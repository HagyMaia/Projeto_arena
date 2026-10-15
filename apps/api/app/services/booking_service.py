from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.redis_client import DistributedLock
from app.models.booking import Booking
from app.models.payment import Payment, PaymentEventLog
from app.models.venue import Court, Venue
from app.schemas.booking import BookingCreate


async def expire_unpaid_bookings(db: AsyncSession) -> int:
    """
    Identifica reservas pendentes que ultrapassaram a janela de hold (ex: 10 minutos)
    e as marca como canceladas/expiradas, liberando o horário no calendário.
    """
    now = datetime.now(timezone.utc)
    stmt = (
        select(Booking)
        .where(
            Booking.status == "PENDING",
            Booking.expires_at.is_not(None),
            Booking.expires_at < now
        )
    )
    result = await db.execute(stmt)
    expired_bookings = result.scalars().all()
    
    count = 0
    for b in expired_bookings:
        b.status = "CANCELLED"
        b.payment_status = "EXPIRED"
        
        # Se houver pagamento associado, marcar como expirado
        pay_res = await db.execute(select(Payment).where(Payment.booking_id == b.id))
        payment = pay_res.scalar_one_or_none()
        if payment and payment.status == "PENDING":
            payment.status = "EXPIRED"
        
        # Registrar log de auditoria
        log = PaymentEventLog(
            booking_id=b.id,
            payment_id=payment.id if payment else None,
            event_type="BOOKING_EXPIRED_HOLD_RELEASED",
            payload=f"Reserva {b.id} expirou hold temporário de pagamento às {now.isoformat()}",
            status="SUCCESS"
        )
        db.add(log)
        count += 1

    if count > 0:
        await db.commit()

    return count


async def create_booking_with_lock(
    db: AsyncSession,
    user_id: str,
    data: BookingCreate
) -> Booking:
    """
    Cria uma reserva com segurança de concorrência:
    1. Executa expiração preventiva de holds antigos
    2. Obtém Lock Distribuído via Redis (evita race conditions)
    3. Valida se já existe reserva confirmada ou pendente válida
    4. Calcula o valor exato no backend (nunca confia no frontend)
    5. Registra a reserva e inicia o hold temporário de pagamento (10 minutos)
    """
    if data.start_time >= data.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O horário de início deve ser anterior ao de término."
        )

    # Expiração preventiva para liberar horários de holds vencidos
    await expire_unpaid_bookings(db)

    # 1. Chave de Lock para a quadra e o horário solicitado
    lock_key = f"court:{data.court_id}:slot:{data.start_time.isoformat()}"
    async with DistributedLock(lock_key, ttl_seconds=15) as lock_acquired:
        if not lock_acquired:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Este horário está sendo reservado por outro usuário no momento. Tente novamente em alguns segundos."
            )

        # 2. Verificar se a quadra existe e está ativa
        result = await db.execute(
            select(Court)
            .where(Court.id == data.court_id, Court.is_active.is_(True))
            .options(selectinload(Court.venue))
        )
        court = result.scalar_one_or_none()
        if not court:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quadra não encontrada ou inativa.")

        # 3. Verificar sobreposição no banco de dados (ACID check)
        # Ignora reservas canceladas ou pendentes cujo tempo de hold expirou
        now = datetime.now(timezone.utc)
        overlap_query = select(Booking).where(
            Booking.court_id == data.court_id,
            or_(
                Booking.status == "CONFIRMED",
                and_(
                    Booking.status == "PENDING",
                    or_(Booking.expires_at.is_(None), Booking.expires_at > now)
                )
            ),
            or_(
                and_(Booking.start_time <= data.start_time, Booking.end_time > data.start_time),
                and_(Booking.start_time < data.end_time, Booking.end_time >= data.end_time),
                and_(Booking.start_time >= data.start_time, Booking.end_time <= data.end_time)
            )
        )
        existing_result = await db.execute(overlap_query)
        if existing_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A quadra selecionada já possui uma reserva confirmada ou em andamento neste horário."
            )

        # 4. Calcular valor total seguro pelo backend com descontos oficiais
        duration_hours = Decimal((data.end_time - data.start_time).total_seconds() / 3600.0)
        base_rate = court.default_hourly_rate
        discount_pct = court.discount_percentage or Decimal("0.00")
        effective_rate = base_rate * (Decimal("1.00") - (discount_pct / Decimal("100.00")))
        total_amount = round(effective_rate * duration_hours, 2)

        # 5. Criar a reserva com status PENDING e hold configurável de 10 minutos
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
        new_booking = Booking(
            court_id=data.court_id,
            user_id=user_id,
            booking_type=data.booking_type or "ONLINE_SINGLE",
            start_time=data.start_time,
            end_time=data.end_time,
            total_amount=total_amount,
            status="PENDING",
            payment_method=data.payment_method or "PIX",
            payment_status="PENDING",
            notes=data.notes,
            expires_at=expires_at
        )
        db.add(new_booking)
        await db.flush()

        # 6. Criar registro inicial de pagamento
        platform_fee = round(total_amount * Decimal("0.05"), 2)
        net_amount = total_amount - platform_fee
        payment = Payment(
            booking_id=new_booking.id,
            venue_id=court.venue_id,
            amount=total_amount,
            platform_fee=platform_fee,
            gateway_fee=Decimal("0.00"),
            net_venue_amount=net_amount,
            payment_method=data.payment_method or "PIX",
            status="PENDING",
            expires_at=expires_at
        )
        db.add(payment)
        
        # Log de auditoria
        log = PaymentEventLog(
            booking_id=new_booking.id,
            payment_id=payment.id,
            event_type="BOOKING_CREATED_PENDING_HOLD",
            payload=f"Hold temporário criado para {court.name} - R${total_amount} até {expires_at.isoformat()}",
            status="SUCCESS"
        )
        db.add(log)

        await db.commit()
        await db.refresh(new_booking)

        return new_booking
