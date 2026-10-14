import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, unique=True)
    amount = Column(Numeric(10, 2), nullable=False)
    platform_fee = Column(Numeric(10, 2), default=0.00)
    net_venue_amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(30), nullable=False) # PIX, CREDIT_CARD, CASH_AT_VENUE
    pix_qr_code = Column(Text, nullable=True)
    pix_code = Column(Text, nullable=True)
    status = Column(String(30), default="PENDING", nullable=False) # PENDING, PAID, REFUNDED
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    booking = relationship("Booking", back_populates="payment")
