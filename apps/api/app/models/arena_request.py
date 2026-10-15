import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, Boolean
from sqlalchemy.orm import relationship

from app.core.database import Base


class ArenaRequest(Base):
    __tablename__ = "arena_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    request_number = Column(String(30), unique=True, index=True, nullable=False)
    status = Column(String(30), default="PENDING", nullable=False)  # PENDING, APPROVED, REJECTED

    # Responsável
    responsible_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    whatsapp = Column(String(30), nullable=False)
    document_type = Column(String(10), nullable=False, default="CNPJ")  # CPF ou CNPJ
    document_number = Column(String(30), nullable=False)

    # Arena / Estabelecimento
    arena_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    postal_code = Column(String(20), nullable=True)
    address_street = Column(String(255), nullable=True)
    address_number = Column(String(50), nullable=True)
    address_complement = Column(String(100), nullable=True)
    neighborhood = Column(String(100), nullable=True)
    city = Column(String(100), nullable=False, default="Manaus")
    state = Column(String(50), nullable=False, default="AM")

    # Estrutura Esportiva
    sports_modalities = Column(Text, nullable=True)  # JSON lista em texto, ex: ["Beach Tennis", "Futebol Society"]
    court_count = Column(Integer, default=1, nullable=False)
    operating_hours_info = Column(String(255), nullable=True)
    additional_notes = Column(Text, nullable=True)

    # Decisão e Auditoria Super Admin
    decision_notes = Column(Text, nullable=True)
    decided_at = Column(DateTime(timezone=True), nullable=True)
    decided_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    converted_venue_id = Column(String(36), ForeignKey("venues.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    decided_by = relationship("User", foreign_keys=[decided_by_user_id])
    converted_venue = relationship("Venue", foreign_keys=[converted_venue_id])
