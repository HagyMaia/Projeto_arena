from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel


class BookingCreate(BaseModel):
    court_id: str
    start_time: datetime
    end_time: datetime
    payment_method: str = "PIX" # PIX, CREDIT_CARD, CASH_AT_VENUE
    notes: Optional[str] = None


class BookingResponse(BaseModel):
    id: str
    court_id: str
    user_id: str
    booking_type: str
    start_time: datetime
    end_time: datetime
    total_amount: Decimal
    status: str
    payment_method: Optional[str] = None
    payment_status: str
    notes: Optional[str] = None
    created_at: datetime
    court_name: Optional[str] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    sport_type: Optional[str] = None

    class Config:
        from_attributes = True


class SlotAvailability(BaseModel):
    start_time: datetime
    end_time: datetime
    is_available: bool
    hourly_rate: Decimal
