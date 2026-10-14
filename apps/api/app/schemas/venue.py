from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel


class CourtBase(BaseModel):
    name: str
    sport_type: str
    surface: str
    is_indoor: bool = False
    default_hourly_rate: Decimal
    discount_percentage: Optional[Decimal] = Decimal("0.00")
    promo_badge: Optional[str] = None
    promo_subtext: Optional[str] = None


class CourtCreatePayload(CourtBase):
    image_url: Optional[str] = None


class CourtPricingUpdate(BaseModel):
    default_hourly_rate: Decimal
    discount_percentage: Optional[Decimal] = Decimal("0.00")
    promo_badge: Optional[str] = None
    promo_subtext: Optional[str] = None
    image_url: Optional[str] = None


class CourtResponse(CourtBase):
    id: str
    venue_id: str
    is_active: bool
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class VenueBase(BaseModel):
    name: str
    description: Optional[str] = None
    phone: Optional[str] = None
    address_street: str
    address_number: str
    address_complement: Optional[str] = None
    neighborhood: str
    city: str
    state: str
    postal_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    cover_image_url: Optional[str] = None


class VenueCreate(VenueBase):
    organization_id: str


class VenueResponse(VenueBase):
    id: str
    organization_id: str
    slug: str
    rating_average: float
    rating_count: int
    is_active: bool
    courts: List[CourtResponse] = []

    class Config:
        from_attributes = True


class VenueWithOwnerCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    address_street: str
    address_number: str
    address_complement: Optional[str] = None
    neighborhood: str
    city: str
    state: str
    postal_code: str
    cover_image_url: Optional[str] = None
    # Dados do dono / gestor
    owner_name: str
    owner_email: str
    owner_password: str
    owner_phone: Optional[str] = None
    # Quadras iniciais
    courts: Optional[List[CourtCreatePayload]] = []


class VenueUpdatePayload(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    address_street: Optional[str] = None
    address_number: Optional[str] = None
    address_complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    cover_image_url: Optional[str] = None


class VenueAdminResponse(VenueResponse):
    owner_name: Optional[str] = None
    owner_email: Optional[str] = None
    owner_phone: Optional[str] = None
    organization_name: Optional[str] = None
    subscription_plan: Optional[str] = None
    subscription_status: Optional[str] = None


class CourtScheduleSlot(BaseModel):
    hour: int
    start_time: datetime
    end_time: datetime
    time_label: str
    is_available: bool
    is_booked: bool
    hourly_rate: Decimal
    original_rate: Decimal
    badge: Optional[str] = None
    has_discount: bool = False


class CourtSchedule(BaseModel):
    court_id: str
    court_name: str
    sport_type: str
    surface: str
    is_indoor: bool
    default_hourly_rate: Decimal
    image_url: Optional[str] = None
    address: str
    promo_badge: Optional[str] = None
    promo_subtext: Optional[str] = None
    slots: List[CourtScheduleSlot]


class VenueScheduleResponse(BaseModel):
    venue_id: str
    venue_name: str
    venue_slug: str
    address_full: str
    city: str
    state: str
    rating_average: float
    rating_count: int
    target_date: str
    courts: List[CourtSchedule]


class WhatsAppContactBase(BaseModel):
    department: str = "Reservas"
    label: Optional[str] = None
    phone_number: str
    custom_message: Optional[str] = None
    is_primary: bool = False
    is_active: bool = True


class WhatsAppContactCreate(WhatsAppContactBase):
    venue_id: Optional[str] = None


class WhatsAppContactUpdate(BaseModel):
    department: Optional[str] = None
    label: Optional[str] = None
    phone_number: Optional[str] = None
    custom_message: Optional[str] = None
    is_primary: Optional[bool] = None
    is_active: Optional[bool] = None


class WhatsAppContactResponse(WhatsAppContactBase):
    id: str
    venue_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


