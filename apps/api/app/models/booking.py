import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    court_id = Column(String(36), ForeignKey("courts.id", ondelete="RESTRICT"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    booking_type = Column(String(30), default="ONLINE_SINGLE", nullable=False) # ONLINE_SINGLE, BALCAO_SINGLE, MONTHLY_RECURRING
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False, index=True)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(30), default="PENDING", nullable=False, index=True) # PENDING, CONFIRMED, COMPLETED, CANCELLED
    payment_method = Column(String(30), nullable=True) # PIX, CREDIT_CARD, CASH_AT_VENUE
    payment_status = Column(String(30), default="PENDING", nullable=False) # PENDING, PAID, REFUNDED
    notes = Column(Text, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    court = relationship("Court", back_populates="bookings")
    user = relationship("User", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False)


class CourtBlock(Base):
    __tablename__ = "court_blocks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    court_id = Column(String(36), ForeignKey("courts.id", ondelete="CASCADE"), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    reason = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
