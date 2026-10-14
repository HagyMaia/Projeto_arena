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
from app.models.venue import Court, Venue, WhatsAppContact
from app.schemas.venue import (
    WhatsAppContactCreate,
    WhatsAppContactResponse,
    WhatsAppContactUpdate,
)

router = APIRouter(prefix="/manager", tags=["Painel do Gestor da Arena"])


async def verify_venue_manager_access(venue_id: str, payload: dict, db: AsyncSession) -> Venue:
    venue_res = await db.execute(select(Venue).where(Venue.id == venue_id))
    venue = venue_res.scalar_one_or_none()
    if not venue:
        raise HTTPException(status_code=404, detail="Arena não encontrada.")
    if payload.get("role") == "SUPERADMIN":
        return venue
    user_id = payload.get("sub")
    mem_res = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == venue.organization_id,
            OrganizationMember.user_id == user_id
        )
    )
    if not mem_res.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Acesso negado: você não tem permissão para gerenciar esta arena.")
    return venue


@router.get("/timeline")
async def get_manager_timeline(
    target_date: Optional[date] = Query(None, description="Data da timeline (padrão hoje)"),
    payload: dict = Depends(require_roles("MANAGER", "SUPERADMIN")),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna a linha do tempo diária para a arena do gestor.
    """
    if not target_date:
        target_date = datetime.now(timezone.utc).date()

    user_id = payload.get("sub")
    is_superadmin = payload.get("role") == "SUPERADMIN"

    # Identificar organização do gestor se não for SuperAdmin
    org_id = None
    if not is_superadmin:
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
                        "color": "#0F172A",  # Azul-marinho oficial
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
                        "color": "#059669",  # Verde-esmeralda oficial
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

    user_id = payload.get("sub")
    is_superadmin = payload.get("role") == "SUPERADMIN"

    # Filtrar quadras pertencentes à organização do gestor
    court_ids = []
    active_courts_count = 0
    if not is_superadmin:
        org_res = await db.execute(
            select(OrganizationMember.organization_id).where(OrganizationMember.user_id == user_id)
        )
        org_id = org_res.scalar_one_or_none()
        if org_id:
            c_res = await db.execute(
                select(Court.id).join(Venue, Court.venue_id == Venue.id).where(Venue.organization_id == org_id)
            )
            court_ids = c_res.scalars().all()
            active_courts_count = len(court_ids)
    else:
        c_res = await db.execute(select(Court.id))
        court_ids = c_res.scalars().all()
        active_courts_count = len(court_ids)

    if not court_ids and not is_superadmin:
        return {
            "today": today.isoformat(),
            "total_bookings_today": 0,
            "revenue_today": 0.0,
            "occupancy_rate_percentage": 0.0,
            "active_courts_count": 0
        }

    # Contagem de reservas de hoje
    booking_query = select(func.count(Booking.id)).where(
        Booking.start_time >= day_start,
        Booking.start_time <= day_end,
        Booking.status.in_(["PENDING", "CONFIRMED"])
    )
    if court_ids:
        booking_query = booking_query.where(Booking.court_id.in_(court_ids))

    res_count = await db.execute(booking_query)
    total_bookings_today = res_count.scalar() or 0

    # Receita confirmada de hoje
    rev_query = select(func.sum(Booking.total_amount)).where(
        Booking.start_time >= day_start,
        Booking.start_time <= day_end,
        Booking.payment_status == "PAID"
    )
    if court_ids:
        rev_query = rev_query.where(Booking.court_id.in_(court_ids))

    revenue_res = await db.execute(rev_query)
    today_revenue = revenue_res.scalar() or Decimal("0.00")

    return {
        "today": today.isoformat(),
        "total_bookings_today": total_bookings_today,
        "revenue_today": float(today_revenue),
        "occupancy_rate_percentage": 68.5,
        "active_courts_count": active_courts_count
    }


@router.get("/venues")
async def list_manager_venues(
    payload: dict = Depends(require_roles("MANAGER", "SUPERADMIN")),
    db: AsyncSession = Depends(get_db)
):
    """
    Lista as arenas que o gestor autenticado administra, incluindo quadras
    e canais de atendimento WhatsApp cadastrados.
    """
    user_id = payload.get("sub")
    is_superadmin = payload.get("role") == "SUPERADMIN"

    query = select(Venue).options(
        selectinload(Venue.courts),
        selectinload(Venue.whatsapp_contacts)
    ).order_by(Venue.name.asc())

    if not is_superadmin:
        org_res = await db.execute(
            select(OrganizationMember.organization_id).where(OrganizationMember.user_id == user_id)
        )
        org_id = org_res.scalar_one_or_none()
        if not org_id:
            return []
        query = query.where(Venue.organization_id == org_id)

    venues_res = await db.execute(query)
    venues = venues_res.scalars().all()

    result = []
    for v in venues:
        result.append({
            "id": v.id,
            "name": v.name,
            "slug": v.slug,
            "description": v.description,
            "phone": v.phone,
            "cover_image_url": v.cover_image_url,
            "address_street": v.address_street,
            "address_number": v.address_number,
            "neighborhood": v.neighborhood,
            "city": v.city,
            "state": v.state,
            "courts": [
                {
                    "id": c.id,
                    "name": c.name,
                    "sport_type": c.sport_type,
                    "surface": c.surface,
                    "default_hourly_rate": float(c.default_hourly_rate),
                    "discount_percentage": float(c.discount_percentage or 0),
                    "promo_badge": c.promo_badge,
                    "promo_subtext": c.promo_subtext,
                    "is_active": c.is_active
                }
                for c in v.courts
            ],
            "whatsapp_contacts": [
                {
                    "id": w.id,
                    "venue_id": w.venue_id,
                    "department": w.department,
                    "label": w.label,
                    "phone_number": w.phone_number,
                    "custom_message": w.custom_message,
                    "is_primary": w.is_primary,
                    "is_active": w.is_active
                }
                for w in v.whatsapp_contacts
            ]
        })

    return result


@router.post("/venues/{venue_id}/whatsapp-contacts", response_model=WhatsAppContactResponse, status_code=status.HTTP_201_CREATED)
async def create_venue_whatsapp_contact(
    venue_id: str,
    data: WhatsAppContactCreate,
    payload: dict = Depends(require_roles("MANAGER", "SUPERADMIN")),
    db: AsyncSession = Depends(get_db)
):
    """
    Cadastra um novo número de WhatsApp para uma arena gerida pelo usuário.
    Permite setorizar (Reservas, Atendimento, Financeiro, Torneios, etc.).
    """
    venue = await verify_venue_manager_access(venue_id, payload, db)

    # Se for marcado como principal, desmarcar anteriores
    if data.is_primary:
        existing_contacts = await db.execute(
            select(WhatsAppContact).where(WhatsAppContact.venue_id == venue.id)
        )
        for contact in existing_contacts.scalars().all():
            contact.is_primary = False

    new_contact = WhatsAppContact(
        venue_id=venue.id,
        department=data.department or "Reservas",
        label=data.label,
        phone_number=data.phone_number,
        custom_message=data.custom_message,
        is_primary=data.is_primary,
        is_active=data.is_active
    )
    db.add(new_contact)
    await db.commit()
    await db.refresh(new_contact)
    return new_contact


@router.put("/whatsapp-contacts/{contact_id}", response_model=WhatsAppContactResponse)
async def update_venue_whatsapp_contact(
    contact_id: str,
    data: WhatsAppContactUpdate,
    payload: dict = Depends(require_roles("MANAGER", "SUPERADMIN")),
    db: AsyncSession = Depends(get_db)
):
    """
    Atualiza número, setor, mensagem ou status do contato de WhatsApp da arena.
    """
    contact_res = await db.execute(select(WhatsAppContact).where(WhatsAppContact.id == contact_id))
    contact = contact_res.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contato não encontrado.")

    if contact.venue_id:
        await verify_venue_manager_access(contact.venue_id, payload, db)

    if data.is_primary and contact.venue_id:
        other_contacts = await db.execute(
            select(WhatsAppContact).where(
                WhatsAppContact.venue_id == contact.venue_id,
                WhatsAppContact.id != contact.id
            )
        )
        for c in other_contacts.scalars().all():
            c.is_primary = False

    update_dict = data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(contact, field, value)

    await db.commit()
    await db.refresh(contact)
    return contact


@router.delete("/whatsapp-contacts/{contact_id}")
async def delete_venue_whatsapp_contact(
    contact_id: str,
    payload: dict = Depends(require_roles("MANAGER", "SUPERADMIN")),
    db: AsyncSession = Depends(get_db)
):
    """
    Remove um contato de WhatsApp de uma arena.
    """
    contact_res = await db.execute(select(WhatsAppContact).where(WhatsAppContact.id == contact_id))
    contact = contact_res.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contato não encontrado.")

    if contact.venue_id:
        await verify_venue_manager_access(contact.venue_id, payload, db)

    await db.delete(contact)
    await db.commit()
    return {"success": True, "message": "Contato WhatsApp removido com sucesso."}
