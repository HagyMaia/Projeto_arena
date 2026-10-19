from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user_payload
from app.models.booking import Booking
from app.models.user import User
from app.models.venue import Court, Venue
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.booking_service import create_booking_with_lock
from app.services.email_service import (
    generate_booking_confirmation_html,
    send_booking_confirmation_email,
)

router = APIRouter(prefix="/bookings", tags=["Reservas de Jogadores"])


class CheckAvailabilityRequest(BaseModel):
    court_id: str
    start_time: datetime
    end_time: datetime


class CheckAvailabilityResponse(BaseModel):
    available: bool
    court_id: str
    court_name: Optional[str] = None
    venue_name: Optional[str] = None
    message: str


@router.post("/check-availability", response_model=CheckAvailabilityResponse)
async def check_booking_availability(
    req: CheckAvailabilityRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Revalida a disponibilidade de um horário antes ou após o login do usuário,
    garantindo que não ocorram reservas duplicadas ou conflitos de agendamento.
    """
    from app.services.booking_service import expire_unpaid_bookings
    await expire_unpaid_bookings(db)

    # 1. Carregar quadra e arena
    c_res = await db.execute(
        select(Court).where(Court.id == req.court_id, Court.is_active.is_(True)).options(selectinload(Court.venue))
    )
    court = c_res.scalar_one_or_none()
    if not court:
        return CheckAvailabilityResponse(
            available=False,
            court_id=req.court_id,
            message="Quadra não encontrada ou inativa."
        )

    # 2. Ajustar timezones caso venham naive
    start_dt = req.start_time if req.start_time.tzinfo else req.start_time.replace(tzinfo=timezone.utc)
    end_dt = req.end_time if req.end_time.tzinfo else req.end_time.replace(tzinfo=timezone.utc)

    # 3. Verificar sobreposição no banco de dados
    now = datetime.now(timezone.utc)
    overlap_query = select(Booking).where(
        Booking.court_id == req.court_id,
        or_(
            Booking.status == "CONFIRMED",
            and_(
                Booking.status == "PENDING",
                or_(Booking.expires_at.is_(None), Booking.expires_at > now)
            )
        ),
        or_(
            and_(Booking.start_time <= start_dt, Booking.end_time > start_dt),
            and_(Booking.start_time < end_dt, Booking.end_time >= end_dt),
            and_(Booking.start_time >= start_dt, Booking.end_time <= end_dt)
        )
    )
    existing_result = await db.execute(overlap_query)
    conflict = existing_result.scalar_one_or_none()

    c_name = court.name
    v_name = court.venue.name if court.venue else "ArenaGo"

    if conflict:
        return CheckAvailabilityResponse(
            available=False,
            court_id=court.id,
            court_name=c_name,
            venue_name=v_name,
            message="O horário selecionado não está mais disponível pois já foi reservado ou está em processo de pagamento."
        )

    return CheckAvailabilityResponse(
        available=True,
        court_id=court.id,
        court_name=c_name,
        venue_name=v_name,
        message="Horário disponível para reserva!"
    )


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_in: BookingCreate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    user_id = payload.get("sub")
    booking = await create_booking_with_lock(db=db, user_id=user_id, data=booking_in)

    # Obter dados do usuário para personalização e envio de email
    u_res = await db.execute(select(User).where(User.id == user_id))
    user = u_res.scalar_one_or_none()

    # Obter dados da quadra e arena parceira
    c_res = await db.execute(
        select(Court).where(Court.id == booking.court_id).options(selectinload(Court.venue))
    )
    court = c_res.scalar_one_or_none()

    c_name = court.name if court else "Quadra Esportiva"
    s_type = court.sport_type if court else "Esporte"
    v_name = court.venue.name if (court and court.venue) else "ArenaGo Partner"
    v_addr = (
        f"{court.venue.address_street}, n. {court.venue.address_number}, {court.venue.neighborhood}, {court.venue.city} - {court.venue.state}"
        if (court and court.venue)
        else ""
    )

    # Disparo de e-mail de confirmação ao jogador
    player_email = user.email if user else "jogador@arenago.com.br"
    player_name = user.full_name if user else "Atleta ArenaGo"
    date_formatted = booking.start_time.strftime("%d/%m")
    time_range = f"{booking.start_time.strftime('%H:%M')} às {booking.end_time.strftime('%H:%M')}"
    booking_code = f"{booking.id[:8].upper()}"

    await send_booking_confirmation_email(
        to_email=player_email,
        player_name=player_name,
        booking_code=booking_code,
        venue_name=v_name,
        court_name=c_name,
        date_formatted=date_formatted,
        time_range=time_range,
        total_amount=float(booking.total_amount),
        payment_method=booking.payment_method or "PIX"
    )

    return BookingResponse(
        id=booking.id,
        court_id=booking.court_id,
        user_id=booking.user_id,
        booking_type=booking.booking_type,
        start_time=booking.start_time,
        end_time=booking.end_time,
        total_amount=booking.total_amount,
        status=booking.status,
        payment_method=booking.payment_method,
        payment_status=booking.payment_status,
        notes=booking.notes,
        created_at=booking.created_at,
        court_name=c_name,
        venue_name=v_name,
        venue_address=v_addr,
        sport_type=s_type
    )



@router.get("/me", response_model=List[BookingResponse])
async def list_my_bookings(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    user_id = payload.get("sub")
    from app.models.venue import Court
    result = await db.execute(
        select(Booking)
        .where(Booking.user_id == user_id)
        .options(selectinload(Booking.court).selectinload(Court.venue))
        .order_by(Booking.start_time.desc())
    )
    bookings = result.scalars().all()
    out = []
    for b in bookings:
        c_name = b.court.name if b.court else None
        s_type = b.court.sport_type if b.court else None
        v_name = b.court.venue.name if (b.court and b.court.venue) else None
        v_addr = f"{b.court.venue.address_street}, n. {b.court.venue.address_number}, {b.court.venue.neighborhood}, {b.court.venue.city} - {b.court.venue.state}" if (b.court and b.court.venue) else None
        
        b_res = BookingResponse(
            id=b.id,
            court_id=b.court_id,
            user_id=b.user_id,
            booking_type=b.booking_type,
            start_time=b.start_time,
            end_time=b.end_time,
            total_amount=b.total_amount,
            status=b.status,
            payment_method=b.payment_method,
            payment_status=b.payment_status,
            notes=b.notes,
            created_at=b.created_at,
            court_name=c_name,
            venue_name=v_name,
            venue_address=v_addr,
            sport_type=s_type
        )
        out.append(b_res)
    return out


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking_details(
    booking_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    user_id = payload.get("sub")
    role = payload.get("role")

    query = select(Booking).where(Booking.id == booking_id).options(selectinload(Booking.payment))
    result = await db.execute(query)
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")

    # Apenas o próprio usuário ou gestores/admins podem visualizar
    if booking.user_id != user_id and role not in ["MANAGER", "SUPERADMIN"]:
        raise HTTPException(status_code=403, detail="Não autorizado a visualizar esta reserva.")

    return booking


@router.post("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    user_id = payload.get("sub")
    role = payload.get("role")

    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")

    if booking.user_id != user_id and role not in ["MANAGER", "SUPERADMIN"]:
        raise HTTPException(status_code=403, detail="Não autorizado a cancelar esta reserva.")

    if booking.status in ["CANCELLED", "COMPLETED"]:
        raise HTTPException(status_code=400, detail=f"A reserva já está {booking.status.lower()}.")

    booking.status = "CANCELLED"
    await db.commit()
    await db.refresh(booking)
    return booking


class ResendEmailRequest(BaseModel):
    recipient_email: Optional[str] = None


@router.post("/{booking_id}/send-confirmation-email")
async def resend_confirmation_email(
    booking_id: str,
    req: Optional[ResendEmailRequest] = None,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """
    Reenvia o e-mail de confirmação de agendamento com o modelo oficial.
    Permite especificar um e-mail de destino alternativo ou utiliza o do usuário autenticado.
    """
    user_id = payload.get("sub")
    role = payload.get("role")

    query = (
        select(Booking)
        .where(Booking.id == booking_id)
        .options(selectinload(Booking.court).selectinload(Court.venue))
    )
    result = await db.execute(query)
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")

    if booking.user_id != user_id and role not in ["MANAGER", "SUPERADMIN"]:
        raise HTTPException(status_code=403, detail="Não autorizado a gerenciar esta reserva.")

    u_res = await db.execute(select(User).where(User.id == booking.user_id))
    user = u_res.scalar_one_or_none()

    target_email = (req.recipient_email if req and req.recipient_email else (user.email if user else "jogador@arenago.com.br")).strip()
    player_name = user.full_name if user else "Atleta ArenaGo"
    venue_name = booking.court.venue.name if (booking.court and booking.court.venue) else "Arena Show"
    court_name = booking.court.name if booking.court else "Quadra Esportiva"
    date_formatted = booking.start_time.strftime("%d/%m")
    time_range = f"{booking.start_time.strftime('%H:%M')} às {booking.end_time.strftime('%H:%M')}"
    booking_code = f"{booking.id[:8].upper()}"

    await send_booking_confirmation_email(
        to_email=target_email,
        player_name=player_name,
        booking_code=booking_code,
        venue_name=venue_name,
        court_name=court_name,
        date_formatted=date_formatted,
        time_range=time_range,
        total_amount=float(booking.total_amount),
        payment_method=booking.payment_method or "PIX"
    )

    return {
        "success": True,
        "message": f"E-mail de confirmação enviado com sucesso para {target_email}",
        "recipient": target_email
    }


@router.get("/{booking_id}/email-preview", response_class=HTMLResponse)
async def preview_booking_email(
    booking_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna o HTML exato do e-mail de confirmação de agendamento para visualização direta ou iframe.
    """
    query = (
        select(Booking)
        .where(Booking.id == booking_id)
        .options(selectinload(Booking.court).selectinload(Court.venue))
    )
    result = await db.execute(query)
    booking = result.scalar_one_or_none()

    if not booking:
        # Template de demonstração caso o ID seja genérico/teste
        return generate_booking_confirmation_html(
            player_name="Hagy Maia",
            booking_code="9317753",
            venue_name="ARENA SHOW",
            court_name="Quadra de Areia 1 - 8 x 16 m de jogo. Área coberta.",
            date_formatted="18/10",
            time_range="18:00 às 20:00",
            total_amount=100.0,
            payment_method="PIX"
        )

    u_res = await db.execute(select(User).where(User.id == booking.user_id))
    user = u_res.scalar_one_or_none()

    player_name = user.full_name if user else "Hagy Maia"
    venue_name = booking.court.venue.name if (booking.court and booking.court.venue) else "ARENA SHOW"
    court_name = booking.court.name if booking.court else "Quadra de Areia 1"
    date_formatted = booking.start_time.strftime("%d/%m")
    time_range = f"{booking.start_time.strftime('%H:%M')} às {booking.end_time.strftime('%H:%M')}"
    booking_code = f"{booking.id[:8].upper()}"

    return generate_booking_confirmation_html(
        player_name=player_name,
        booking_code=booking_code,
        venue_name=venue_name,
        court_name=court_name,
        date_formatted=date_formatted,
        time_range=time_range,
        total_amount=float(booking.total_amount),
        payment_method=booking.payment_method or "PIX"
    )

