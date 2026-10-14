from datetime import datetime, time, timedelta, timezone
from decimal import Decimal
import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.booking import Booking
from app.models.organization import Organization, OrganizationMember
from app.models.payment import Payment
from app.models.subscription import Plan, Subscription
from app.models.user import User
from app.models.venue import Court, CourtImage, OperatingHour, Venue

logger = logging.getLogger(__name__)


async def seed_initial_data(db: AsyncSession):
    # Verificar se já existem dados
    result = await db.execute(select(User).limit(1))
    if result.scalar_one_or_none():
        return

    logger.info("Populando dados iniciais do ArenaGo...")

    # 1. Usuários de Demonstração
    admin_user = User(
        email="admin@arenago.com.br",
        hashed_password=get_password_hash("admin123"),
        full_name="Administrador ArenaGo",
        phone="(11) 99999-0001",
        role="SUPERADMIN"
    )
    manager_user = User(
        email="gestor@beacharena.com.br",
        hashed_password=get_password_hash("arena123"),
        full_name="Carlos Gestor (Beach Arena)",
        phone="(11) 98888-0002",
        role="MANAGER"
    )
    player_user = User(
        email="jogador@arenago.com.br",
        hashed_password=get_password_hash("player123"),
        full_name="Lucas Silva",
        phone="(11) 97777-0003",
        role="PLAYER"
    )
    db.add_all([admin_user, manager_user, player_user])
    await db.flush()

    # 2. Planos SaaS
    plan_starter = Plan(tier="STARTER", name="Starter", monthly_price=Decimal("99.00"), max_courts=2, commission_percentage=Decimal("7.0"))
    plan_pro = Plan(tier="PRO", name="Professional", monthly_price=Decimal("199.00"), max_courts=5, commission_percentage=Decimal("5.0"))
    plan_business = Plan(tier="BUSINESS", name="Business", monthly_price=Decimal("349.00"), max_courts=12, commission_percentage=Decimal("4.0"))
    plan_enterprise = Plan(tier="ENTERPRISE", name="Enterprise", monthly_price=Decimal("699.00"), max_courts=50, commission_percentage=Decimal("2.5"))
    db.add_all([plan_starter, plan_pro, plan_business, plan_enterprise])
    await db.flush()

    # 3. Organização e Assinatura (Beach Arena Sports)
    org_beach = Organization(
        name="Beach Arena Sports Club",
        legal_name="Beach Arena Entretenimento Esportivo Ltda",
        document_number="12.345.678/0001-90",
        phone="(11) 3333-4444",
        email="contato@beacharena.com.br"
    )
    db.add(org_beach)
    await db.flush()

    membership = OrganizationMember(
        organization_id=org_beach.id,
        user_id=manager_user.id,
        role="MANAGER"
    )
    sub = Subscription(
        organization_id=org_beach.id,
        plan_id=plan_pro.id,
        status="ACTIVE",
        billing_cycle="MONTHLY",
        current_period_end=datetime.now(timezone.utc) + timedelta(days=30),
        mrr_amount=Decimal("199.00")
    )
    db.add_all([membership, sub])

    # 4. Venues & Courts
    # Arena 1: Beach Arena Itaim
    venue_beach = Venue(
        organization_id=org_beach.id,
        name="Beach Arena Itaim",
        slug="beach-arena-itaim",
        description="Complexo premium com quadras de areia aquecida, vestiários climatizados, bar gastronômico e estacionamento gratuito.",
        phone="(11) 98888-0002",
        address_street="Rua Clodomiro Amazonas",
        address_number="1150",
        neighborhood="Itaim Bibi",
        city="São Paulo",
        state="SP",
        postal_code="04537-002",
        latitude=-23.5855,
        longitude=-46.6800,
        cover_image_url="https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=800&q=80",
        rating_average=4.9,
        rating_count=128
    )
    db.add(venue_beach)
    await db.flush()

    # Horários de funcionamento
    for day in range(7):
        db.add(OperatingHour(venue_id=venue_beach.id, day_of_week=day, open_time=time(7, 0), close_time=time(23, 0)))

    court_1 = Court(
        venue_id=venue_beach.id,
        name="Quadra 1 — Beach Tennis Coberta",
        sport_type="BEACH_TENNIS",
        surface="SAND",
        is_indoor=True,
        default_hourly_rate=Decimal("120.00")
    )
    court_2 = Court(
        venue_id=venue_beach.id,
        name="Quadra 2 — Beach Tennis Externa",
        sport_type="BEACH_TENNIS",
        surface="SAND",
        is_indoor=False,
        default_hourly_rate=Decimal("100.00")
    )
    court_3 = Court(
        venue_id=venue_beach.id,
        name="Quadra 3 — Futevôlei Pro",
        sport_type="BEACH_TENNIS",
        surface="SAND",
        is_indoor=False,
        default_hourly_rate=Decimal("110.00")
    )
    db.add_all([court_1, court_2, court_3])
    await db.flush()

    # Arena 2: Galaxy Sports Hub
    org_galaxy = Organization(
        name="Galaxy Sports Complex",
        document_number="98.765.432/0001-11",
        email="contato@galaxysports.com.br"
    )
    db.add(org_galaxy)
    await db.flush()

    venue_galaxy = Venue(
        organization_id=org_galaxy.id,
        name="Galaxy Futsal & Society Park",
        slug="galaxy-futsal-society",
        description="Melhor estrutura para futsal em parquet profissional e futebol society 7 society com grama padrão FIFA.",
        phone="(11) 3222-1111",
        address_street="Av. das Nações Unidas",
        address_number="4500",
        neighborhood="Pinheiros",
        city="São Paulo",
        state="SP",
        postal_code="05425-070",
        latitude=-23.5670,
        longitude=-46.6990,
        cover_image_url="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
        rating_average=4.8,
        rating_count=94
    )
    db.add(venue_galaxy)
    await db.flush()

    court_galaxy_futsal = Court(
        venue_id=venue_galaxy.id,
        name="Quadra Principal — Futsal Parquet",
        sport_type="FUTSAL",
        surface="PARQUET_WOOD",
        is_indoor=True,
        default_hourly_rate=Decimal("150.00")
    )
    court_galaxy_society = Court(
        venue_id=venue_galaxy.id,
        name="Campo Society 1 — Grama Sintética",
        sport_type="FOOTBALL",
        surface="SYNTHETIC_GRASS",
        is_indoor=False,
        default_hourly_rate=Decimal("180.00")
    )
    db.add_all([court_galaxy_futsal, court_galaxy_society])
    await db.flush()

    # 5. Reservas de Demonstração para hoje (reproduzindo o painel do gestor)
    today = datetime.now(timezone.utc).date()
    now_utc = datetime.now(timezone.utc)

    # 09:00 - 10:00 Quadra 2 (Beach Tennis)
    b1_start = datetime.combine(today, time(9, 0), tzinfo=timezone.utc)
    b1_end = datetime.combine(today, time(10, 0), tzinfo=timezone.utc)
    b1 = Booking(
        court_id=court_2.id,
        user_id=player_user.id,
        booking_type="ONLINE_SINGLE",
        start_time=b1_start,
        end_time=b1_end,
        total_amount=Decimal("100.00"),
        status="CONFIRMED",
        payment_method="PIX",
        payment_status="PAID",
        notes="Reserva avulsa confirmada via Pix"
    )

    # 11:00 - 12:00 Quadra 1
    b2_start = datetime.combine(today, time(11, 0), tzinfo=timezone.utc)
    b2_end = datetime.combine(today, time(12, 0), tzinfo=timezone.utc)
    b2 = Booking(
        court_id=court_1.id,
        user_id=player_user.id,
        booking_type="ONLINE_SINGLE",
        start_time=b2_start,
        end_time=b2_end,
        total_amount=Decimal("120.00"),
        status="CONFIRMED",
        payment_method="CREDIT_CARD",
        payment_status="PAID"
    )

    # 18:00 - 20:00 Quadra 1 (Mensalista)
    b3_start = datetime.combine(today, time(18, 0), tzinfo=timezone.utc)
    b3_end = datetime.combine(today, time(20, 0), tzinfo=timezone.utc)
    b3 = Booking(
        court_id=court_1.id,
        user_id=player_user.id,
        booking_type="MONTHLY_RECURRING",
        start_time=b3_start,
        end_time=b3_end,
        total_amount=Decimal("240.00"),
        status="CONFIRMED",
        payment_method="PIX",
        payment_status="PAID",
        notes="Turma Mensalista das Quintas"
    )

    db.add_all([b1, b2, b3])
    await db.commit()
    logger.info("Dados de demonstração do ArenaGo inseridos com sucesso!")
