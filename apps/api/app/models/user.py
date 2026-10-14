import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, String, Enum as SqlEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    role = Column(String(30), nullable=False, default="PLAYER") # SUPERADMIN, MANAGER, EMPLOYEE, PLAYER
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    memberships = relationship("OrganizationMember", back_populates="user", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="user")
