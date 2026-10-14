from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user_payload
from app.models.booking import Booking
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.booking_service import create_booking_with_lock

router = APIRouter(prefix="/bookings", tags=["Reservas de Jogadores"])


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_in: BookingCreate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    user_id = payload.get("sub")
    booking = await create_booking_with_lock(db=db, user_id=user_id, data=booking_in)
    return booking


@router.get("/me", response_model=List[BookingResponse])
async def list_my_bookings(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    user_id = payload.get("sub")
    result = await db.execute(
        select(Booking)
        .where(Booking.user_id == user_id)
        .order_by(Booking.start_time.desc())
    )
    return result.scalars().all()


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
