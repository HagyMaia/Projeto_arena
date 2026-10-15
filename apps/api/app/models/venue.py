import uuid
from datetime import datetime, time, timezone
from decimal import Decimal
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, Numeric, String, Text, Time
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class Venue(Base):
    __tablename__ = "venues"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    phone = Column(String(30), nullable=True)
    address_street = Column(String(255), nullable=False)
    address_number = Column(String(50), nullable=False)
    address_complement = Column(String(100), nullable=True)
    neighborhood = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(50), nullable=False)
    postal_code = Column(String(20), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    cover_image_url = Column(Text, nullable=True)
    rating_average = Column(Float, default=5.0)
    rating_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization", back_populates="venues")
    courts = relationship("Court", back_populates="venue", cascade="all, delete-orphan")
    operating_hours = relationship("OperatingHour", back_populates="venue", cascade="all, delete-orphan")
    whatsapp_contacts = relationship("WhatsAppContact", back_populates="venue", cascade="all, delete-orphan")
    payment_account = relationship("VenuePaymentAccount", back_populates="venue", uselist=False, cascade="all, delete-orphan")


class WhatsAppContact(Base):
    __tablename__ = "whatsapp_contacts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    venue_id = Column(String(36), ForeignKey("venues.id", ondelete="CASCADE"), nullable=True, index=True)
    department = Column(String(100), nullable=False, default="Reservas")
    label = Column(String(100), nullable=True)
    phone_number = Column(String(30), nullable=False)
    custom_message = Column(Text, nullable=True)
    is_primary = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    venue = relationship("Venue", back_populates="whatsapp_contacts")


class Court(Base):
    __tablename__ = "courts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    venue_id = Column(String(36), ForeignKey("venues.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    sport_type = Column(String(50), nullable=False, index=True) # FOOTBALL, FUTSAL, BEACH_TENNIS, TENNIS, etc.
    surface = Column(String(50), nullable=False) # SYNTHETIC_GRASS, PARQUET_WOOD, VINYL, SAND, etc.
    is_indoor = Column(Boolean, default=False, nullable=False)
    default_hourly_rate = Column(Numeric(10, 2), nullable=False)
    discount_percentage = Column(Numeric(5, 2), default=Decimal("0.00"), nullable=True)
    promo_badge = Column(String(100), nullable=True)
    promo_subtext = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    venue = relationship("Venue", back_populates="courts")
    bookings = relationship("Booking", back_populates="court")
    images = relationship("CourtImage", back_populates="court", cascade="all, delete-orphan")


class CourtImage(Base):
    __tablename__ = "court_images"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    court_id = Column(String(36), ForeignKey("courts.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(Text, nullable=False)
    sort_order = Column(Integer, default=0)

    court = relationship("Court", back_populates="images")


class OperatingHour(Base):
    __tablename__ = "operating_hours"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    venue_id = Column(String(36), ForeignKey("venues.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(Integer, nullable=False) # 0 = Domingo, 6 = Sábado
    open_time = Column(Time, nullable=False, default=time(7, 0))
    close_time = Column(Time, nullable=False, default=time(23, 0))
    is_closed = Column(Boolean, default=False, nullable=False)

    venue = relationship("Venue", back_populates="operating_hours")
