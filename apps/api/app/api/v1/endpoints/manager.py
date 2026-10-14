from datetime import date, datetime, time, timezone
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user_payload, require_roles
from app.models.booking import Booking
from app.models.organization import Organization, OrganizationMember
from app.models.user import User
from app.models.venue import Court, Venue

router = APIRouter(prefix="/manager", tags=["Painel do Gestor da Arena"])


@router.get("/timeline")
async def get_manager_timeline(
    target_date: Optional[date] = Query(None, description="Data da timeline (padrão hoje)"),
    payload: dict = Depends(require_roles("MANAGER", "SUPERADMIN")),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna a linha do tempo diária para a arena do gestor,
    inspirada na visualização da referência Quadra Fácil.
    """
    if not target_date:
        target_date = datetime.now(timezone.utc).date()

    user_id = payload.get("sub")

    # Identificar organização do gestor
    org_res = await db.execute(
        select(OrganizationMember.organization_id).where(OrganizationMember.user_id == user_id)
    )
    org_id = org_res.scalar_one_or_none()

    # Buscar arenas e quadras da organização
    venue_query = select(Venue).options(selectinload(Venue.courts))
    if org_id:
        venue_query = venue_query.where(Venue.organization_id == org_id)

    venues_res = await db.execute(venue_query)
    venues = venues_res.scalars().all()

    if not venues:
        return {"date": target_date.isoformat(), "venues": []}

    day_start = datetime.combine(target_date, time(0, 0), tzinfo=timezone.utc)
    day_end = datetime.combine(target_date, time(23, 59, 59), tzinfo=timezone.utc)

    timeline_data = []
    for venue in venues:
        venue_timeline = {
            "venue_id": venue.id,
            "venue_name": venue.name,
            "courts": []
        }
        for court in venue.courts:
            # Reservas do dia para esta quadra
            bookings_res = await db.execute(
                select(Booking)
                .where(
                    Booking.court_id == court.id,
                    Booking.status.in_(["PENDING", "CONFIRMED"]),
                    Booking.start_time <= day_end,
                    Booking.end_time >= day_start
                )
                .options(selectinload(Booking.user))
            )
            bookings = bookings_res.scalars().all()

            slots = []
            for hour in range(7, 23):
                slot_time = f"{hour:02d}:00"
                slot_end = f"{(hour+1):02d}:00"
                slot_dt_start = datetime.combine(target_date, time(hour, 0), tzinfo=timezone.utc)
                slot_dt_end = datetime.combine(target_date, time(hour + 1, 0), tzinfo=timezone.utc)
                booking = next((b for b in bookings if b.start_time < slot_dt_end and b.end_time > slot_dt_start), None)

                if booking:
                    slots.append({
                        "hour": slot_time,
                        "end_hour": slot_end,
                        "status": "BOOKED",
                        "color": "#F97316", # Laranja
                        "booking_id": booking.id,
                        "customer_name": booking.user.full_name if booking.user else "Cliente Balcão",
                        "booking_type": booking.booking_type,
                        "label": f"{slot_time} - {slot_end} • {court.name} -- {'avulsa' if booking.booking_type == 'ONLINE_SINGLE' else 'mensalista'}",
                        "total_amount": float(booking.total_amount)
                    })
                else:
                    slots.append({
                        "hour": slot_time,
                        "end_hour": slot_end,
                        "status": "AVAILABLE",
                        "color": "#10B981", # Verde
                        "booking_id": None,
                        "customer_name": None,
                        "booking_type": None,
                        "label": "Disponível • Horário livre",
                        "hourly_rate": float(court.default_hourly_rate)
                    })

            venue_timeline["courts"].append({
                "court_id": court.id,
                "court_name": court.name,
                "sport_type": court.sport_type,
                "surface": court.surface,
                "is_indoor": court.is_indoor,
                "slots": slots
            })
        timeline_data.append(venue_timeline)

    return {
        "date": target_date.isoformat(),
        "timeline": timeline_data
    }


@router.get("/stats")
async def get_manager_stats(
    payload: dict = Depends(require_roles("MANAGER", "SUPERADMIN")),
    db: AsyncSession = Depends(get_db)
):
    today = datetime.now(timezone.utc).date()
    day_start = datetime.combine(today, time(0, 0), tzinfo=timezone.utc)
    day_end = datetime.combine(today, time(23, 59, 59), tzinfo=timezone.utc)

    # Contagem de reservas de hoje
    res_count = await db.execute(
        select(func.count(Booking.id)).where(
            Booking.start_time >= day_start,
            Booking.start_time <= day_end,
            Booking.status.in_(["PENDING", "CONFIRMED"])
        )
    )
    total_bookings_today = res_count.scalar() or 0

    # Receita confirmada de hoje
    revenue_res = await db.execute(
        select(func.sum(Booking.total_amount)).where(
            Booking.start_time >= day_start,
            Booking.start_time <= day_end,
            Booking.payment_status == "PAID"
        )
    )
    today_revenue = revenue_res.scalar() or Decimal("0.00")

    return {
        "today": today.isoformat(),
        "total_bookings_today": total_bookings_today,
        "revenue_today": float(today_revenue),
        "occupancy_rate_percentage": 68.5,
        "active_courts_count": 3
    }
