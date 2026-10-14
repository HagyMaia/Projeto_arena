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


class CourtResponse(CourtBase):
    id: str
    venue_id: str
    is_active: bool

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

