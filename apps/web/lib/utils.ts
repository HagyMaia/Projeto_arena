import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export const OFFICIAL_SUPPORT_PHONE_RAW = "+55 92 98492-3316";
export const OFFICIAL_SUPPORT_PHONE_CLEAN = "5592984923316";
export const OFFICIAL_SUPPORT_MESSAGE = "Olá, preciso de ajuda com o ArenaGo.";

/**
 * Normaliza um número de telefone para o padrão do WhatsApp (wa.me):
 * Remove caracteres não numéricos e garante o DDI 55 sem duplicidades (ex: 5555...).
 */
export function cleanPhoneForWhatsApp(phone?: string): string {
  if (!phone) return OFFICIAL_SUPPORT_PHONE_CLEAN;
  let cleaned = phone.replace(/\D/g, "");
  if (!cleaned) return OFFICIAL_SUPPORT_PHONE_CLEAN;

  // Se o número tiver 10 ou 11 dígitos (DDD + número brasileiro), adiciona DDI 55
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = `55${cleaned}`;
  }

  // Previne duplicação acidental de 55 (ex.: 555592984923316)
  if (cleaned.startsWith("5555") && cleaned.length > 13) {
    cleaned = cleaned.slice(2);
  }

  return cleaned;
}

/**
 * Gera o link direto wa.me com número higienizado e mensagem codificada.
 */
export function formatWhatsAppUrl(phone?: string, message?: string): string {
  const number = cleanPhoneForWhatsApp(phone || OFFICIAL_SUPPORT_PHONE_CLEAN);
  const text = message !== undefined ? message : OFFICIAL_SUPPORT_MESSAGE;
  if (!text) {
    return `https://wa.me/${number}`;
  }
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/**
 * Retorna o link oficial da Central de Atendimento da plataforma ArenaGo.
 * wa.me/5592984923316?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20ArenaGo.
 */
export function getOfficialSupportWhatsAppUrl(): string {
  return formatWhatsAppUrl(OFFICIAL_SUPPORT_PHONE_CLEAN, OFFICIAL_SUPPORT_MESSAGE);
}

