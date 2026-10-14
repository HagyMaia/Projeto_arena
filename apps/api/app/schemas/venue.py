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
