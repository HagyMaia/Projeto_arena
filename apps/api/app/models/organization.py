import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    legal_name = Column(String(255), nullable=True)
    document_number = Column(String(30), unique=True, nullable=True)
    phone = Column(String(30), nullable=True)
    email = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    members = relationship("OrganizationMember", back_populates="organization", cascade="all, delete-orphan")
    venues = relationship("Venue", back_populates="organization", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="organization", uselist=False)


class OrganizationMember(Base):
    __tablename__ = "organization_members"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(30), nullable=False, default="MANAGER") # MANAGER, EMPLOYEE
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("organization_id", "user_id", name="uq_org_user"),
    )

    organization = relationship("Organization", back_populates="members")
    user = relationship("User", back_populates="memberships")
