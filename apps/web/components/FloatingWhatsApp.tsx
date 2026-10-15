"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X, ExternalLink, ShieldCheck, Phone } from "lucide-react";
import { api, WhatsAppContact } from "@/lib/api";
import { formatWhatsAppUrl, getOfficialSupportWhatsAppUrl } from "@/lib/utils";

interface FloatingWhatsAppProps {
  venueIdOrSlug?: string;
  venueName?: string;
}

export function FloatingWhatsApp({ venueIdOrSlug, venueName }: FloatingWhatsAppProps) {
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadContacts() {
      try {
        setLoading(true);
        let list: WhatsAppContact[] = [];
        if (venueIdOrSlug) {
          list = await api.getVenueWhatsAppContacts(venueIdOrSlug);
        } else {
          list = await api.getPlatformWhatsAppContacts();
        }
        if (isMounted) {
          setContacts(list.filter((c) => c.is_active));
        }
      } catch (err) {
        console.error("Falha ao carregar contatos WhatsApp:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadContacts();
    return () => {
      isMounted = false;
    };
  }, [venueIdOrSlug]);

  function getWhatsAppUrl(contact: WhatsAppContact): string {
    const defaultMsg = venueName
      ? `Olá! Gostaria de informações sobre o ArenaGo na arena ${venueName}.`
      : undefined;
    return formatWhatsAppUrl(contact.phone_number, contact.custom_message || defaultMsg);
  }


  // Se houver apenas 1 contato ativo, botão pode abrir direto ou abrir drawer
  const primaryContact = contacts.find((c) => c.is_primary) || contacts[0];

  const handleClickMainButton = () => {
    if (contacts.length === 1 && primaryContact) {
      window.open(getWhatsAppUrl(primaryContact), "_blank", "noopener,noreferrer");
    } else {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Popover de Contatos por Setor */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0F172A] p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {venueName ? `Atendimento • ${venueName}` : "Suporte ArenaGo"}
                </h4>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {contacts.length > 0 ? "Normalmente responde em instantes" : "Horário comercial"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
            {loading ? (
              <div className="py-6 text-center text-xs text-slate-500">Carregando contatos...</div>
            ) : contacts.length === 0 ? (
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Nenhum contato específico disponível no momento.
                </p>
                <a
                  href={getOfficialSupportWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Central de Atendimento
                </a>
              </div>
            ) : (
              contacts.map((contact) => (
                <a
                  key={contact.id}
                  href={getWhatsAppUrl(contact)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-3 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all shadow-sm"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {contact.department}
                      </span>
                      {contact.is_primary && (
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                          Principal
                        </span>
                      )}
                    </div>
                    {contact.label && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {contact.label}
                      </p>
                    )}
                    <p className="text-[11px] font-mono text-slate-600 dark:text-slate-300 mt-0.5">
                      {contact.phone_number}
                    </p>
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow group-hover:scale-105 transition-transform">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                </a>
              ))
            )}
          </div>

          <div className="mt-3 pt-2 text-center border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              Atendimento seguro via WhatsApp oficial
            </p>
          </div>
        </div>
      )}

      {/* Botão Flutuante */}
      <button
        onClick={handleClickMainButton}
        className="group flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-white shadow-xl hover:bg-emerald-700 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
        aria-label="Abrir WhatsApp"
      >
        <MessageCircle className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline font-semibold text-sm">
          WhatsApp {contacts.length > 1 ? `(${contacts.length})` : ""}
        </span>
      </button>
    </div>
  );
}
