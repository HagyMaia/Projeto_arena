from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.booking import Booking
from app.models.venue import Court, OperatingHour, Venue, WhatsAppContact
from app.schemas.booking import SlotAvailability
from app.schemas.venue import (
    CourtResponse,
    CourtSchedule,
    CourtScheduleSlot,
    VenueResponse,
    VenueScheduleResponse,
    WhatsAppContactResponse,
)

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
    query = select(Venue).where(
        Venue.is_active.is_(True),
        Venue.is_published.is_(True),
        Venue.is_deleted.is_(False)
    ).options(
        selectinload(Venue.courts)
    )

    if city:
        query = query.where(Venue.city.ilike(f"%{city}%"))

    result = await db.execute(query)
    venues = result.scalars().all()

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


@router.get("/{id_or_slug}/schedule", response_model=VenueScheduleResponse)
async def get_venue_schedule(
    id_or_slug: str,
    target_date: Optional[date] = Query(None, description="Data no formato AAAA-MM-DD (padrão hoje)"),
    date: Optional[date] = Query(None, description="Alias para target_date"),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna a grade horária completa da arena e de todas as suas quadras
    para a data informada, sincronizada em tempo real com o banco de dados.
    """
    target_date = target_date or date or datetime.now(timezone.utc).date()

    query = select(Venue).where(
        (Venue.id == id_or_slug) | (Venue.slug == id_or_slug)
    ).options(selectinload(Venue.courts).selectinload(Court.images))
    
    result = await db.execute(query)
    venue = result.scalar_one_or_none()
    if not venue:
        raise HTTPException(status_code=404, detail="Arena não encontrada.")

    day_start = datetime.combine(target_date, time(0, 0), tzinfo=timezone.utc)
    day_end = datetime.combine(target_date, time(23, 59, 59), tzinfo=timezone.utc)

    # Buscar reservas ativas de todas as quadras da arena para o dia
    court_ids = [c.id for c in venue.courts if c.is_active]
    bookings_res = await db.execute(
        select(Booking).where(
            Booking.court_id.in_(court_ids),
            Booking.status.in_(["PENDING", "CONFIRMED"]),
            Booking.start_time <= day_end,
            Booking.end_time >= day_start
        )
    )
    all_bookings = bookings_res.scalars().all()

    courts_schedule = []
    address_str = f"{venue.address_street}, n. {venue.address_number}, {venue.neighborhood}, {venue.city} - {venue.state}"

    court_images = {
        "FOOTBALL": "https://images.unsplash.com/photo-1529900248673-982855519db1?auto=format&fit=crop&w=600&q=80",
        "BEACH_TENNIS": "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=600&q=80",
        "VOLLEYBALL": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
        "FUTSAL": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80",
    }

    for court in venue.courts:
        if not court.is_active:
            continue

        court_bookings = [b for b in all_bookings if b.court_id == court.id]

        slots = []
        base_rate = court.default_hourly_rate
        discount_pct = court.discount_percentage or Decimal("0.00")
        has_custom_discount = discount_pct > Decimal("0.00")
        custom_rate = round(base_rate * (Decimal(1) - (discount_pct / Decimal(100))), 2) if has_custom_discount else base_rate

        for hour in range(7, 24):
            slot_start = datetime.combine(target_date, time(hour, 0), tzinfo=timezone.utc)
            # Lida com virada da meia-noite se for 23h
            if hour == 23:
                next_day = target_date + timedelta(days=1)
                slot_end = datetime.combine(next_day, time(0, 0), tzinfo=timezone.utc)
                time_label = "23:00 às 00:00"
            else:
                slot_end = datetime.combine(target_date, time(hour + 1, 0), tzinfo=timezone.utc)
                time_label = f"{hour:02d}:00 às {(hour + 1):02d}:00"

            # Checagem real de sobreposição de intervalo
            is_booked = any(b.start_time < slot_end and b.end_time > slot_start for b in court_bookings)

            # Dinâmica de preços: aplica desconto personalizado do admin se houver, ou regras padrão
            current_rate = base_rate
            original_rate = base_rate
            badge = None
            has_discount = False

            if has_custom_discount:
                current_rate = custom_rate
                has_discount = True
                badge = court.promo_badge or f"-{int(discount_pct)}%"
            elif 18 <= hour <= 21:
                badge = "🔥"
            elif hour < 12:
                # Promoção diurna padrão
                current_rate = round(base_rate * Decimal("0.85"), 2)
                has_discount = True
                badge = "%"

            slots.append(
                CourtScheduleSlot(
                    hour=hour,
                    start_time=slot_start,
                    end_time=slot_end,
                    time_label=time_label,
                    is_available=not is_booked,
                    is_booked=is_booked,
                    hourly_rate=current_rate,
                    original_rate=original_rate,
                    badge=badge,
                    has_discount=has_discount
                )
            )

        court_img = None
        if court.images and len(court.images) > 0:
            court_img = court.images[0].image_url
        if not court_img:
            court_img = venue.cover_image_url or court_images.get(court.sport_type, "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=600&q=80")

        badge_text = court.promo_badge
        if not badge_text and has_custom_discount:
            badge_text = f"PROMO -{int(discount_pct)}% OFF"
        elif not badge_text:
            badge_text = "R$ 10,00 de desconto a cada 2h"

        sub_text = court.promo_subtext or "Promoção especial ativa para este local"

        courts_schedule.append(
            CourtSchedule(
                court_id=court.id,
                court_name=court.name,
                sport_type=court.sport_type,
                surface=court.surface,
                is_indoor=court.is_indoor,
                default_hourly_rate=court.default_hourly_rate,
                image_url=court_img,
                address=address_str,
                promo_badge=badge_text,
                promo_subtext=sub_text,
                slots=slots
            )
        )

    return VenueScheduleResponse(
        venue_id=venue.id,
        venue_name=venue.name,
        venue_slug=venue.slug,
        address_full=address_str,
        city=venue.city,
        state=venue.state,
        rating_average=venue.rating_average,
        rating_count=venue.rating_count,
        target_date=target_date.isoformat(),
        courts=courts_schedule
    )


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
    date: Optional[date] = Query(None, description="Alias para target_date"),
    db: AsyncSession = Depends(get_db)
):
    target_date = target_date or date or datetime.now(timezone.utc).date()

    court_res = await db.execute(select(Court).where(Court.id == court_id, Court.is_active.is_(True)))
    court = court_res.scalar_one_or_none()
    if not court:
        raise HTTPException(status_code=404, detail="Quadra não encontrada.")

    day_start = datetime.combine(target_date, time(0, 0), tzinfo=timezone.utc)
    day_end = datetime.combine(target_date, time(23, 59, 59), tzinfo=timezone.utc)

    bookings_res = await db.execute(
        select(Booking).where(
            Booking.court_id == court_id,
            Booking.status.in_(["PENDING", "CONFIRMED"]),
            Booking.start_time <= day_end,
            Booking.end_time >= day_start
        )
    )
    booked_slots = bookings_res.scalars().all()

    slots = []
    for hour in range(7, 23):
        slot_start = datetime.combine(target_date, time(hour, 0), tzinfo=timezone.utc)
        slot_end = datetime.combine(target_date, time(hour + 1, 0), tzinfo=timezone.utc)
        is_avail = not any(b.start_time < slot_end and b.end_time > slot_start for b in booked_slots)

        slots.append(
            SlotAvailability(
                start_time=slot_start,
                end_time=slot_end,
                is_available=is_avail,
                hourly_rate=court.default_hourly_rate
            )
        )

    return slots


@router.get("/platform/whatsapp-contacts", response_model=List[WhatsAppContactResponse])
async def get_platform_whatsapp_contacts(
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna os contatos oficiais de WhatsApp da plataforma ArenaGo.
    """
    res = await db.execute(
        select(WhatsAppContact)
        .where(WhatsAppContact.venue_id.is_(None), WhatsAppContact.is_active.is_(True))
        .order_by(WhatsAppContact.is_primary.desc(), WhatsAppContact.created_at.asc())
    )
    return list(res.scalars().all())


@router.get("/{id_or_slug}/whatsapp-contacts", response_model=List[WhatsAppContactResponse])
async def get_venue_whatsapp_contacts(
    id_or_slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna os contatos de WhatsApp configurados para a arena específica,
    identificados por setor (Reservas, Atendimento, Financeiro, etc.).
    Se a arena não tiver contato ativo, retorna o contato geral da plataforma.
    """
    venue_res = await db.execute(
        select(Venue).where((Venue.id == id_or_slug) | (Venue.slug == id_or_slug))
    )
    venue = venue_res.scalar_one_or_none()

    contacts = []
    if venue:
        res = await db.execute(
            select(WhatsAppContact)
            .where(WhatsAppContact.venue_id == venue.id, WhatsAppContact.is_active.is_(True))
            .order_by(WhatsAppContact.is_primary.desc(), WhatsAppContact.created_at.asc())
        )
        contacts = list(res.scalars().all())

    if not contacts:
        # Fallback para contato geral da plataforma
        plat_res = await db.execute(
            select(WhatsAppContact)
            .where(WhatsAppContact.venue_id.is_(None), WhatsAppContact.is_active.is_(True))
            .order_by(WhatsAppContact.is_primary.desc(), WhatsAppContact.created_at.asc())
        )
        contacts = list(plat_res.scalars().all())

    return contacts


