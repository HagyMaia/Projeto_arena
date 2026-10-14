from datetime import datetime, timedelta, timezone
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis_client import DistributedLock
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.venue import Court
from app.schemas.booking import BookingCreate


async def create_booking_with_lock(
    db: AsyncSession,
    user_id: str,
    data: BookingCreate
) -> Booking:
    """
    Cria uma reserva com segurança de concorrência:
    1. Obtém Lock Distribuído via Redis (evita race conditions)
    2. Valida se já existe reserva ativa/pendente com sobreposição de horário
    3. Registra a reserva e inicia o hold temporário de pagamento
    """
    if data.start_time >= data.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O horário de início deve ser anterior ao de término."
        )

    # 1. Chave de Lock para a quadra e o horário solicitado
    lock_key = f"court:{data.court_id}:slot:{data.start_time.isoformat()}"
    async with DistributedLock(lock_key, ttl_seconds=15) as lock_acquired:
        if not lock_acquired:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Este horário está sendo reservado por outro usuário no momento. Tente novamente em alguns segundos."
            )

        # 2. Verificar se a quadra existe e está ativa
        result = await db.execute(select(Court).where(Court.id == data.court_id, Court.is_active.is_(True)))
        court = result.scalar_one_or_none()
        if not court:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quadra não encontrada ou inativa.")

        # 3. Verificar sobreposição no banco de dados (ACID check)
        overlap_query = select(Booking).where(
            Booking.court_id == data.court_id,
            Booking.status.in_(["PENDING", "CONFIRMED"]),
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

        # 4. Calcular valor total com base nas horas
        duration_hours = Decimal((data.end_time - data.start_time).total_seconds() / 3600.0)
        total_amount = round(court.default_hourly_rate * duration_hours, 2)

        # 5. Criar a reserva com status PENDING e hold de 10 min
        new_booking = Booking(
            court_id=data.court_id,
            user_id=user_id,
            booking_type="ONLINE_SINGLE",
            start_time=data.start_time,
            end_time=data.end_time,
            total_amount=total_amount,
            status="PENDING",
            payment_method=data.payment_method,
            payment_status="PENDING",
            notes=data.notes,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
        )
        db.add(new_booking)
        await db.flush()

        # 6. Criar registro de pagamento com dados de Pix simulados
        payment = Payment(
            booking_id=new_booking.id,
            amount=total_amount,
            platform_fee=round(total_amount * Decimal("0.05"), 2),
            net_venue_amount=round(total_amount * Decimal("0.95"), 2),
            payment_method=data.payment_method,
            pix_qr_code="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=arenago-pix-mock",
            pix_code="00020126580014BR.GOV.BCB.PIX0136arenago-pix-mock520400005303986540" + str(total_amount),
            status="PENDING"
        )
        db.add(payment)
        await db.commit()
        await db.refresh(new_booking)

        return new_booking
