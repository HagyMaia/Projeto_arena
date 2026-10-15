import json
import random
import re
import string
import urllib.parse
import uuid
from datetime import datetime, time, timezone
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_password_hash, require_roles
from app.models.arena_request import ArenaRequest
from app.models.organization import Organization, OrganizationMember
from app.models.subscription import Plan, Subscription
from app.models.user import User
from app.models.venue import Court, OperatingHour, Venue, WhatsAppContact
from app.schemas.arena_request import (
    ArenaRequestCreate,
    ArenaRequestDecisionPayload,
    ArenaRequestResponse,
)

router = APIRouter(prefix="/arena-requests", tags=["Solicitações de Cadastro de Arenas"])

SUPPORT_PHONE_RAW = "+55 92 98492-3316"
SUPPORT_PHONE_CLEAN = "5592984923316"


def generate_request_number() -> str:
    """Gera um número de protocolo amigável e único: REQ-2026-XXXX"""
    random_digits = "".join(random.choices(string.digits, k=4))
    return f"REQ-2026-{random_digits}"


def generate_whatsapp_message_and_url(req: ArenaRequest, modalities: List[str]) -> tuple[str, str]:
    modalities_text = ", ".join(modalities) if modalities else "Geral / Poliesportiva"
    
    address_parts = []
    if req.address_street:
        part = req.address_street
        if req.address_number:
            part += f", {req.address_number}"
        address_parts.append(part)
    if req.neighborhood:
        address_parts.append(req.neighborhood)
    address_parts.append(f"{req.city} - {req.state}")
    full_address = " | ".join(address_parts)

    msg = (
        "Olá! Gostaria de cadastrar minha arena no ArenaGo 🏟️\n\n"
        f"📋 *Protocolo:* {req.request_number}\n"
        f"🏢 *Arena:* {req.arena_name}\n"
        f"👤 *Responsável:* {req.responsible_name}\n"
        f"📱 *WhatsApp:* {req.whatsapp}\n"
        f"✉️ *E-mail:* {req.email}\n"
        f"📄 *Documento:* {req.document_type} {req.document_number}\n"
        f"📍 *Localização:* {full_address}\n"
        f"⚽ *Modalidades:* {modalities_text}\n"
        f"🏟️ *Quantidade de Quadras:* {req.court_count}\n"
        f"⏰ *Horários:* {req.operating_hours_info or 'Segunda a Domingo (07h às 23h)'}\n"
    )
    if req.additional_notes:
        msg += f"💬 *Observações:* {req.additional_notes}\n"
    
    msg += "\nAguardo a análise e liberação do acesso à plataforma!"

    encoded = urllib.parse.quote(msg)
    url = f"https://wa.me/{SUPPORT_PHONE_CLEAN}?text={encoded}"
    return msg, url


def map_to_response(req: ArenaRequest) -> ArenaRequestResponse:
    try:
        modalities = json.loads(req.sports_modalities) if req.sports_modalities else []
        if isinstance(modalities, str):
            modalities = [modalities]
    except Exception:
        modalities = [s.strip() for s in (req.sports_modalities or "").split(",") if s.strip()]

    msg, wa_url = generate_whatsapp_message_and_url(req, modalities)

    return ArenaRequestResponse(
        id=req.id,
        request_number=req.request_number,
        status=req.status,
        responsible_name=req.responsible_name,
        email=req.email,
        whatsapp=req.whatsapp,
        document_type=req.document_type,
        document_number=req.document_number,
        arena_name=req.arena_name,
        description=req.description,
        postal_code=req.postal_code,
        address_street=req.address_street,
        address_number=req.address_number,
        address_complement=req.address_complement,
        neighborhood=req.neighborhood,
        city=req.city,
        state=req.state,
        sports_modalities=modalities,
        court_count=req.court_count,
        operating_hours_info=req.operating_hours_info,
        additional_notes=req.additional_notes,
        decision_notes=req.decision_notes,
        decided_at=req.decided_at,
        decided_by_user_id=req.decided_by_user_id,
        converted_venue_id=req.converted_venue_id,
        whatsapp_message=msg,
        whatsapp_url=wa_url,
        created_at=req.created_at,
        updated_at=req.updated_at,
    )


@router.post("", response_model=ArenaRequestResponse, status_code=status.HTTP_201_CREATED)
async def submit_arena_request(
    data: ArenaRequestCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Público: Registra uma nova solicitação de cadastro de arena por um gestor/dono.
    Armazena os dados com status PENDENTE no PostgreSQL e retorna os detalhes com link wa.me.
    """
    # Gerar número de protocolo único
    req_number = generate_request_number()
    for _ in range(5):
        existing = await db.execute(select(ArenaRequest).where(ArenaRequest.request_number == req_number))
        if not existing.scalar_one_or_none():
            break
        req_number = generate_request_number()

    modalities_json = json.dumps(data.sports_modalities, ensure_ascii=False)

    new_request = ArenaRequest(
        request_number=req_number,
        status="PENDING",
        responsible_name=data.responsible_name.strip(),
        email=data.email.strip().lower(),
        whatsapp=re.sub(r"[^\d+]", "", data.whatsapp.strip()),
        document_type=data.document_type.upper().strip(),
        document_number=re.sub(r"[^\d]", "", data.document_number.strip()),
        arena_name=data.arena_name.strip(),
        description=data.description.strip() if data.description else None,
        postal_code=data.postal_code.strip() if data.postal_code else None,
        address_street=data.address_street.strip() if data.address_street else None,
        address_number=data.address_number.strip() if data.address_number else None,
        address_complement=data.address_complement.strip() if data.address_complement else None,
        neighborhood=data.neighborhood.strip() if data.neighborhood else None,
        city=data.city.strip() if data.city else "Manaus",
        state=data.state.strip().upper() if data.state else "AM",
        sports_modalities=modalities_json,
        court_count=data.court_count,
        operating_hours_info=data.operating_hours_info.strip() if data.operating_hours_info else None,
        additional_notes=data.additional_notes.strip() if data.additional_notes else None,
    )

    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)

    return map_to_response(new_request)


@router.get("", response_model=List[ArenaRequestResponse])
async def list_arena_requests(
    status_filter: Optional[str] = Query(None, description="Filtrar por status: PENDING, APPROVED, REJECTED ou ALL"),
    payload: dict = Depends(require_roles("SUPERADMIN")),
    db: AsyncSession = Depends(get_db)
):
    """
    SuperAdmin: Lista todas as solicitações de cadastro recebidas.
    """
    query = select(ArenaRequest).order_by(ArenaRequest.created_at.desc())
    if status_filter and status_filter.upper() != "ALL":
        query = query.where(ArenaRequest.status == status_filter.upper())

    result = await db.execute(query)
    requests = result.scalars().all()
    return [map_to_response(r) for r in requests]


@router.get("/{request_id}", response_model=ArenaRequestResponse)
async def get_arena_request(
    request_id: str,
    payload: dict = Depends(require_roles("SUPERADMIN")),
    db: AsyncSession = Depends(get_db)
):
    """
    SuperAdmin: Obtém dados detalhados de uma solicitação de cadastro específica.
    """
    result = await db.execute(select(ArenaRequest).where(ArenaRequest.id == request_id))
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada.")
    return map_to_response(req)


@router.post("/{request_id}/approve")
async def approve_arena_request(
    request_id: str,
    data: ArenaRequestDecisionPayload,
    payload: dict = Depends(require_roles("SUPERADMIN")),
    db: AsyncSession = Depends(get_db)
):
    """
    SuperAdmin: Aprova a solicitação e converte em uma Arena oficial e usuário Gestor.
    A arena é criada como ativa e publicada no Marketplace, sem duplicidades.
    """
    result = await db.execute(select(ArenaRequest).where(ArenaRequest.id == request_id))
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada.")

    if req.status == "APPROVED" and req.converted_venue_id:
        # Já convertida previamente
        v_check = await db.execute(select(Venue).where(Venue.id == req.converted_venue_id))
        existing_v = v_check.scalar_one_or_none()
        if existing_v:
            return {
                "success": True,
                "message": f"Esta solicitação já foi aprovada anteriormente. Arena: '{existing_v.name}'.",
                "venue_id": existing_v.id,
                "arena_name": existing_v.name,
                "already_approved": True
            }

    # 1. Gerar slug único
    clean_name = re.sub(r"[^a-z0-9]+", "-", req.arena_name.lower()).strip("-")
    base_slug = clean_name or f"arena-{uuid.uuid4().hex[:6]}"
    slug_check = await db.execute(select(Venue).where(Venue.slug == base_slug))
    if slug_check.scalar_one_or_none():
        base_slug = f"{base_slug}-{uuid.uuid4().hex[:4]}"

    # 2. Criar Organização
    org = Organization(
        name=f"{req.arena_name} Gestão Esportiva",
        document_number=req.document_number,
        phone=req.whatsapp,
        email=req.email
    )
    db.add(org)
    await db.flush()

    # 3. Criar ou Atualizar Usuário Gestor
    user_res = await db.execute(select(User).where(User.email == req.email))
    owner_user = user_res.scalar_one_or_none()
    
    generated_password = data.manager_password or f"Arena@{random.randint(1000, 9999)}"
    is_new_user = False

    if owner_user:
        if owner_user.role == "PLAYER":
            owner_user.role = "MANAGER"
        if not owner_user.phone:
            owner_user.phone = req.whatsapp
    else:
        is_new_user = True
        owner_user = User(
            email=req.email,
            full_name=req.responsible_name,
            phone=req.whatsapp,
            hashed_password=get_password_hash(generated_password),
            role="MANAGER",
            is_active=True
        )
        db.add(owner_user)
        await db.flush()

    # Vincular na Organização
    membership = OrganizationMember(
        organization_id=org.id,
        user_id=owner_user.id,
        role="MANAGER"
    )
    db.add(membership)

    # 4. Assinatura SaaS Inicial
    plan_res = await db.execute(select(Plan).where(Plan.tier == "PRO").limit(1))
    plan = plan_res.scalar_one_or_none()
    if plan:
        sub = Subscription(
            organization_id=org.id,
            plan_id=plan.id,
            status="ACTIVE",
            billing_cycle="MONTHLY",
            current_period_end=datetime.now(timezone.utc),
            mrr_amount=plan.monthly_price
        )
        db.add(sub)

    # 5. Criar a Arena no catálogo (Ativa e Publicada)
    venue = Venue(
        organization_id=org.id,
        name=req.arena_name,
        slug=base_slug,
        description=req.description or f"Complexo esportivo {req.arena_name}. Agende seu horário online no ArenaGo.",
        phone=req.whatsapp,
        address_street=req.address_street or "Avenida Principal",
        address_number=req.address_number or "S/N",
        address_complement=req.address_complement,
        neighborhood=req.neighborhood or "Bairro Central",
        city=req.city,
        state=req.state,
        postal_code=req.postal_code or "69000-000",
        cover_image_url="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80",
        rating_average=5.0,
        rating_count=1,
        is_active=True,
        is_published=True,
        is_deleted=False
    )
    db.add(venue)
    await db.flush()

    # 6. Criar Horários de Funcionamento (07h às 23h para todos os dias)
    for day in range(7):
        db.add(OperatingHour(
            venue_id=venue.id,
            day_of_week=day,
            open_time=time(7, 0),
            close_time=time(23, 0),
            is_closed=False
        ))

    # 7. Criar Contato Oficial de WhatsApp da Arena
    db.add(WhatsAppContact(
        venue_id=venue.id,
        department="Reservas & Atendimento",
        label="WhatsApp Oficial da Arena",
        phone_number=req.whatsapp,
        custom_message=f"Olá! Gostaria de informações sobre horários na {req.arena_name}.",
        is_primary=True,
        is_active=True
    ))

    # 8. Criar Quadras Iniciais Conforme o Formulário
    try:
        modalities = json.loads(req.sports_modalities) if req.sports_modalities else []
        if isinstance(modalities, str):
            modalities = [modalities]
    except Exception:
        modalities = [s.strip() for s in (req.sports_modalities or "").split(",") if s.strip()]

    rate = data.courts_hourly_rate or Decimal("100.00")
    courts_to_create = max(req.court_count, 1)

    for i in range(courts_to_create):
        sport_type = "BEACH_TENNIS"
        surface = "SAND"
        mod_label = "Areia / Beach Tennis"

        if modalities:
            chosen = modalities[i % len(modalities)].lower()
            if "futebol" in chosen or "society" in chosen:
                sport_type = "FOOTBALL"
                surface = "SYNTHETIC_GRASS"
                mod_label = "Futebol Society"
            elif "futsal" in chosen:
                sport_type = "FUTSAL"
                surface = "PARQUET_WOOD"
                mod_label = "Futsal"
            elif "tênis" in chosen or "tenis" in chosen:
                sport_type = "TENNIS"
                surface = "HARD_COURT"
                mod_label = "Tênis"
            elif "vôlei" in chosen or "volei" in chosen:
                sport_type = "VOLLEYBALL"
                surface = "SAND"
                mod_label = "Vôlei de Praia"
            else:
                mod_label = modalities[i % len(modalities)]

        court = Court(
            venue_id=venue.id,
            name=f"Quadra {i + 1} — {mod_label}",
            sport_type=sport_type,
            surface=surface,
            is_indoor=False,
            default_hourly_rate=rate,
            discount_percentage=Decimal("0.00"),
            is_active=True
        )
        db.add(court)

    # 9. Atualizar Status da Solicitação
    admin_id = payload.get("sub") if payload else None
    req.status = "APPROVED"
    req.converted_venue_id = venue.id
    req.decided_at = datetime.now(timezone.utc)
    req.decided_by_user_id = admin_id
    req.decision_notes = data.decision_notes or "Solicitação aprovada e arena ativada no SaaS."

    await db.commit()

    return {
        "success": True,
        "message": f"Solicitação aprovada com sucesso! A arena '{venue.name}' foi publicada no Marketplace.",
        "venue_id": venue.id,
        "venue_slug": venue.slug,
        "arena_name": venue.name,
        "manager_email": owner_user.email,
        "manager_name": owner_user.full_name,
        "temporary_password": generated_password if is_new_user else None,
        "courts_created": courts_to_create
    }


@router.post("/{request_id}/reject")
async def reject_arena_request(
    request_id: str,
    data: ArenaRequestDecisionPayload,
    payload: dict = Depends(require_roles("SUPERADMIN")),
    db: AsyncSession = Depends(get_db)
):
    """
    SuperAdmin: Rejeita a solicitação de cadastro com justificativa.
    """
    result = await db.execute(select(ArenaRequest).where(ArenaRequest.id == request_id))
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada.")

    admin_id = payload.get("sub") if payload else None
    req.status = "REJECTED"
    req.decided_at = datetime.now(timezone.utc)
    req.decided_by_user_id = admin_id
    req.decision_notes = data.decision_notes or "Solicitação não atendeu aos critérios cadastrais da plataforma."

    await db.commit()

    return {
        "success": True,
        "message": f"A solicitação do protocolo {req.request_number} foi marcada como REJEITADA.",
        "status": "REJECTED",
        "decision_notes": req.decision_notes
    }
