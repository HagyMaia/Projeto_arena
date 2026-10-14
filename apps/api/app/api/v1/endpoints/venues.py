from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.booking import Booking
from app.models.venue import Court, OperatingHour, Venue
from app.schemas.booking import SlotAvailability
from app.schemas.venue import CourtResponse, VenueResponse

router = APIRouter(prefix="/venues", tags=["Marketplace de Arenas & Quadras"])


@router.get("", response_model=List[VenueResponse])
async def list_venues(
    sport: Optional[str] = Query(None, description="Filtrar por esporte: FOOTBALL, FUTSAL, BEACH_TENNIS, etc."),
    city: Optional[str] = Query(None, description="Filtrar por cidade"),
    surface: Optional[str] = Query(None, description="Tipo de piso"),
    is_indoor: Optional[bool] = Query(None, description="Apenas cobertas ou externas"),
    max_price: Optional[Decimal] = Query(None, description="Preço máximo por hora"),
    db: AsyncSession = Depends(get_db)
):
    query = select(Venue).where(Venue.is_active.is_(True)).options(
        selectinload(Venue.courts)
    )

    if city:
        query = query.where(Venue.city.ilike(f"%{city}%"))

    result = await db.execute(query)
    venues = result.scalars().all()

    # Filtros em nível de quadra se especificados
    filtered_venues = []
    for v in venues:
        matched_courts = []
        for c in v.courts:
            if not c.is_active:
                continue
            if sport and c.sport_type.upper() != sport.upper():
                continue
            if surface and c.surface.upper() != surface.upper():
                continue
            if is_indoor is not None and c.is_indoor != is_indoor:
                continue
            if max_price is not None and c.default_hourly_rate > max_price:
                continue
            matched_courts.append(c)

        if (sport or surface or is_indoor is not None or max_price is not None):
            if matched_courts:
                v.courts = matched_courts
                filtered_venues.append(v)
        else:
            filtered_venues.append(v)

    return filtered_venues


@router.get("/{id_or_slug}", response_model=VenueResponse)
async def get_venue(id_or_slug: str, db: AsyncSession = Depends(get_db)):
    query = select(Venue).where(
        (Venue.id == id_or_slug) | (Venue.slug == id_or_slug)
    ).options(selectinload(Venue.courts))
    
    result = await db.execute(query)
    venue = result.scalar_one_or_none()
    if not venue:
        raise HTTPException(status_code=404, detail="Arena não encontrada.")
    return venue


@router.get("/courts/{court_id}/slots", response_model=List[SlotAvailability])
async def get_court_slots(
    court_id: str,
    target_date: Optional[date] = Query(None, description="Data no formato AAAA-MM-DD (padrão hoje)"),
    db: AsyncSession = Depends(get_db)
):
    if not target_date:
        target_date = datetime.now(timezone.utc).date()

    # Buscar quadra
    court_res = await db.execute(select(Court).where(Court.id == court_id, Court.is_active.is_(True)))
    court = court_res.scalar_one_or_none()
    if not court:
        raise HTTPException(status_code=404, detail="Quadra não encontrada.")

    # Início e fim do dia
    day_start = datetime.combine(target_date, time(0, 0), tzinfo=timezone.utc)
    day_end = datetime.combine(target_date, time(23, 59, 59), tzinfo=timezone.utc)

    # Buscar reservas ativas do dia
    bookings_res = await db.execute(
        select(Booking).where(
            Booking.court_id == court_id,
            Booking.status.in_(["PENDING", "CONFIRMED"]),
            Booking.start_time >= day_start,
            Booking.start_time <= day_end
        )
    )
    booked_slots = bookings_res.scalars().all()
    booked_hours = {b.start_time.hour for b in booked_slots}

    # Gerar slots das 07:00 às 23:00
    slots = []
    for hour in range(7, 23):
        slot_start = datetime.combine(target_date, time(hour, 0), tzinfo=timezone.utc)
        slot_end = datetime.combine(target_date, time(hour + 1, 0), tzinfo=timezone.utc)
        is_avail = hour not in booked_hours

        slots.append(
            SlotAvailability(
                start_time=slot_start,
                end_time=slot_end,
                is_available=is_avail,
                hourly_rate=court.default_hourly_rate
            )
        )

    return slots
