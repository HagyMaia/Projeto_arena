import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Plan(Base):
    __tablename__ = "plans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tier = Column(String(30), unique=True, nullable=False) # STARTER, PRO, BUSINESS, ENTERPRISE
    name = Column(String(100), nullable=False)
    monthly_price = Column(Numeric(10, 2), nullable=False)
    max_courts = Column(Integer, default=2)
    commission_percentage = Column(Numeric(5, 2), default=5.00)
    is_active = Column(Boolean, default=True)

    subscriptions = relationship("Subscription", back_populates="plan")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="RESTRICT"), nullable=False, unique=True)
    plan_id = Column(String(36), ForeignKey("plans.id", ondelete="RESTRICT"), nullable=False)
    status = Column(String(30), default="ACTIVE", nullable=False) # TRIAL, ACTIVE, PAST_DUE, CANCELLED
    billing_cycle = Column(String(20), default="MONTHLY") # MONTHLY, QUARTERLY, ANNUAL
    current_period_start = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    current_period_end = Column(DateTime(timezone=True), nullable=False)
    mrr_amount = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization", back_populates="subscription")
    plan = relationship("Plan", back_populates="subscriptions")
