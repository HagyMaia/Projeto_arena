import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class VenuePaymentAccount(Base):
    """
    Conta de recebimentos do gestor da arena via OAuth oficial (Mercado Pago).
    Garante o isolamento multi-tenant: cada gestor recebe em sua própria conta.
    Tokens são armazenados criptografados e nunca em texto puro.
    """
    __tablename__ = "venue_payment_accounts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    venue_id = Column(String(36), ForeignKey("venues.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    provider = Column(String(50), default="MERCADOPAGO", nullable=False) # MERCADOPAGO
    mp_user_id = Column(String(100), nullable=True)
    account_email = Column(String(255), nullable=True)
    account_name = Column(String(255), nullable=True)
    encrypted_access_token = Column(Text, nullable=True)
    encrypted_refresh_token = Column(Text, nullable=True)
    public_key = Column(String(255), nullable=True)
    live_mode = Column(Boolean, default=False, nullable=False)
    status = Column(String(30), default="CONNECTED", nullable=False) # CONNECTED, DISCONNECTED, PENDING
    connected_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    venue = relationship("Venue", back_populates="payment_account")


class Payment(Base):
    """
    Transação financeira associada a uma reserva.
    Guarda dados da cobrança no Mercado Pago (Pix/Cartão), status, taxas e reconciliação.
    """
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    venue_id = Column(String(36), ForeignKey("venues.id", ondelete="SET NULL"), nullable=True, index=True)
    
    mp_payment_id = Column(String(100), nullable=True, index=True) # ID no Mercado Pago
    mp_preference_id = Column(String(100), nullable=True)
    idempotency_key = Column(String(100), nullable=True, unique=True)

    amount = Column(Numeric(10, 2), nullable=False)
    platform_fee = Column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    gateway_fee = Column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    net_venue_amount = Column(Numeric(10, 2), nullable=False)
    
    payment_method = Column(String(30), nullable=False) # PIX, CREDIT_CARD, CASH_AT_VENUE
    pix_qr_code = Column(Text, nullable=True)
    pix_code = Column(Text, nullable=True)

    card_brand = Column(String(50), nullable=True)
    card_last_four = Column(String(4), nullable=True)
    payer_name = Column(String(255), nullable=True)
    payer_email = Column(String(255), nullable=True)

    status = Column(String(30), default="PENDING", nullable=False, index=True) # PENDING, PAID, REJECTED, EXPIRED, REFUNDED
    paid_at = Column(DateTime(timezone=True), nullable=True)
    refunded_at = Column(DateTime(timezone=True), nullable=True)
    refunded_amount = Column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    booking = relationship("Booking", back_populates="payment")
    venue = relationship("Venue")


class PaymentEventLog(Base):
    """
    Log de auditoria e idempotência para eventos e webhooks do gateway de pagamento.
    """
    __tablename__ = "payment_event_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    payment_id = Column(String(36), nullable=True, index=True)
    booking_id = Column(String(36), nullable=True, index=True)
    event_type = Column(String(100), nullable=False) # WEBHOOK_RECEIVED, PAYMENT_APPROVED, PAYMENT_REJECTED, REFUND_ISSUED, EXPIRED, RECONCILED
    provider_event_id = Column(String(100), nullable=True, index=True)
    payload = Column(Text, nullable=True) # JSON textual
    status = Column(String(50), nullable=False) # SUCCESS, IGNORED, FAILED
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
