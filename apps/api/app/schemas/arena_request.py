from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class ArenaRequestCreate(BaseModel):
    responsible_name: str = Field(..., min_length=2, max_length=255, description="Nome do responsável pela arena")
    email: EmailStr = Field(..., description="E-mail de contato")
    whatsapp: str = Field(..., min_length=8, max_length=30, description="WhatsApp com DDD")
    document_type: str = Field("CNPJ", description="Tipo do documento: CNPJ ou CPF")
    document_number: str = Field(..., min_length=9, max_length=30, description="Número do CPF ou CNPJ")
    
    arena_name: str = Field(..., min_length=2, max_length=255, description="Nome comercial da arena")
    description: Optional[str] = Field(None, description="Descrição ou diferenciais da arena")
    postal_code: Optional[str] = Field(None, description="CEP")
    address_street: Optional[str] = Field(None, description="Rua / Avenida")
    address_number: Optional[str] = Field(None, description="Número")
    address_complement: Optional[str] = Field(None, description="Complemento")
    neighborhood: Optional[str] = Field(None, description="Bairro")
    city: str = Field("Manaus", description="Cidade")
    state: str = Field("AM", description="Estado/UF")

    sports_modalities: List[str] = Field(default_factory=list, description="Lista de esportes oferecidos")
    court_count: int = Field(1, ge=1, le=50, description="Quantidade de quadras disponíveis")
    operating_hours_info: Optional[str] = Field(None, description="Horário de funcionamento")
    additional_notes: Optional[str] = Field(None, description="Informações adicionais")


class ArenaRequestDecisionPayload(BaseModel):
    decision_notes: Optional[str] = Field(None, description="Justificativa ou anotação da decisão")
    manager_password: Optional[str] = Field(None, description="Senha temporária opcional para acesso do gestor")
    courts_hourly_rate: Optional[Decimal] = Field(Decimal("100.00"), description="Valor padrão da hora das quadras criadas")


class ArenaRequestResponse(BaseModel):
    id: str
    request_number: str
    status: str
    responsible_name: str
    email: str
    whatsapp: str
    document_type: str
    document_number: str
    arena_name: str
    description: Optional[str] = None
    postal_code: Optional[str] = None
    address_street: Optional[str] = None
    address_number: Optional[str] = None
    address_complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: str
    state: str
    sports_modalities: List[str] = []
    court_count: int
    operating_hours_info: Optional[str] = None
    additional_notes: Optional[str] = None
    decision_notes: Optional[str] = None
    decided_at: Optional[datetime] = None
    decided_by_user_id: Optional[str] = None
    converted_venue_id: Optional[str] = None
    whatsapp_message: Optional[str] = None
    whatsapp_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
