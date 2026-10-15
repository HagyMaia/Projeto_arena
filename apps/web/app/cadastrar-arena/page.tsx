"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  MapPin, 
  Trophy, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Check
} from "lucide-react";
import { api, ArenaRequestSubmitResponse } from "@/lib/api";
import { OFFICIAL_SUPPORT_PHONE_RAW } from "@/lib/utils";

const AVAILABLE_MODALITIES = [
  { id: "BEACH_TENNIS", label: "Beach Tennis", icon: "🎾" },
  { id: "FUTEVOLEI", label: "Futevôlei", icon: "⚽" },
  { id: "VOLEI_PRAIA", label: "Vôlei de Praia", icon: "🏐" },
  { id: "SOCIETY", label: "Futebol Society", icon: "🥅" },
  { id: "FUTSAL", label: "Futsal", icon: "👟" },
  { id: "PADEL", label: "Padel", icon: "🏸" },
  { id: "TENIS", label: "Tênis", icon: "🎾" },
  { id: "BASQUETE", label: "Basquete / 3x3", icon: "🏀" },
  { id: "PICKLEBALL", label: "Pickleball", icon: "🏓" },
];

export default function CadastrarArenaPage() {
  const [formData, setFormData] = useState({
    arena_name: "",
    responsible_name: "",
    whatsapp: "",
    email: "",
    document_type: "CNPJ" as "CPF" | "CNPJ",
    document_number: "",
    address_street: "",
    address_number: "",
    address_complement: "",
    neighborhood: "",
    city: "Manaus",
    state: "AM",
    postal_code: "",
    sports_modalities: ["BEACH_TENNIS", "FUTEVOLEI"] as string[],
    court_count: 2,
    operating_hours_description: "Segunda a Domingo, das 07:00 às 23:00",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<ArenaRequestSubmitResponse | null>(null);

  const handleModalityToggle = (id: string) => {
    setFormData((prev) => {
      const exists = prev.sports_modalities.includes(id);
      if (exists) {
        if (prev.sports_modalities.length === 1) return prev; // Manter pelo menos 1
        return {
          ...prev,
          sports_modalities: prev.sports_modalities.filter((m) => m !== id),
        };
      } else {
        return {
          ...prev,
          sports_modalities: [...prev.sports_modalities, id],
        };
      }
    });
  };

  const handleCepLookup = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            address_street: data.logradouro || prev.address_street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));
        }
      } catch {
        // silencioso
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validações básicas
    if (!formData.arena_name.trim()) {
      setErrorMsg("Por favor, preencha o nome da arena.");
      return;
    }
    if (!formData.responsible_name.trim()) {
      setErrorMsg("Por favor, informe o nome do responsável.");
      return;
    }
    if (!formData.whatsapp.trim() || formData.whatsapp.replace(/\D/g, "").length < 10) {
      setErrorMsg("Informe um número de WhatsApp válido com DDD.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMsg("Informe um e-mail profissional válido.");
      return;
    }
    if (!formData.document_number.trim()) {
      setErrorMsg(`Informe o número do ${formData.document_type}.`);
      return;
    }
    if (!formData.city.trim() || !formData.state.trim()) {
      setErrorMsg("Informe a cidade e o estado da arena.");
      return;
    }
    if (formData.sports_modalities.length === 0) {
      setErrorMsg("Selecione ao menos uma modalidade esportiva.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.createArenaRequest({
        arena_name: formData.arena_name.trim(),
        responsible_name: formData.responsible_name.trim(),
        whatsapp: formData.whatsapp.trim(),
        email: formData.email.trim(),
        document_type: formData.document_type,
        document_number: formData.document_number.trim(),
        address_street: formData.address_street.trim() || "Endereço Principal",
        address_number: formData.address_number.trim() || "S/N",
        address_complement: formData.address_complement.trim() || undefined,
        neighborhood: formData.neighborhood.trim() || "Centro",
        city: formData.city.trim(),
        state: formData.state.trim().toUpperCase(),
        postal_code: formData.postal_code.trim() || "69000-000",
        sports_modalities: formData.sports_modalities,
        court_count: Number(formData.court_count) || 1,
        operating_hours_description: formData.operating_hours_description.trim() || undefined,
        description: formData.description.trim() || undefined,
      });

      setSubmissionResult(res);

      // Tenta abrir a conversa do WhatsApp em uma nova aba
      if (typeof window !== "undefined" && res.whatsapp_url) {
        window.open(res.whatsapp_url, "_blank", "noopener,noreferrer");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao salvar a solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = () => {
    if (!submissionResult) return;
    navigator.clipboard.writeText(submissionResult.whatsapp_message);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        
        {/* Navegação Superior */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Marketplace</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Parceria Oficial ArenaGo
            </span>
          </div>
        </div>

        {/* TELA DE SUCESSO & ENVIO AO WHATSAPP */}
        {submissionResult ? (
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold border border-emerald-200 dark:border-emerald-800 mb-3">
                Protocolo: {submissionResult.request.request_number}
              </span>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Solicitação Registrada com Sucesso!
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Os dados da arena <strong>{submissionResult.request.arena_name}</strong> foram salvos com status <strong>PENDENTE</strong> no sistema. Nossa equipe técnica já recebeu a notificação.
              </p>

              {/* Box de Alerta Crucial do WhatsApp */}
              <div className="my-6 p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800/60 text-left">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-200">
                      Importante: Confirme o envio no WhatsApp!
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                      Ao abrir o WhatsApp, a mensagem com todos os dados da sua arena já estará pronta na caixa de texto. <strong>Você precisa clicar em &ldquo;Enviar&rdquo; no WhatsApp</strong> para que nossa equipe de suporte receba o chamado imediatamente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botão de Envio WhatsApp com wa.me */}
              <div className="space-y-3">
                <a
                  href={submissionResult.whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#25D366]/25 transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Send className="w-5 h-5" />
                  <span>Enviar Solicitação pelo WhatsApp ({OFFICIAL_SUPPORT_PHONE_RAW})</span>
                  <ExternalLink className="w-4 h-4 opacity-80" />
                </a>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? "Mensagem copiada!" : "Copiar texto da mensagem"}</span>
                  </button>

                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
                  >
                    Voltar à Página Inicial
                  </Link>
                </div>
              </div>

              {/* Resumo dos dados cadastrados */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Resumo dos Dados Cadastrados
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div><strong className="text-slate-500">Arena:</strong> {submissionResult.request.arena_name}</div>
                  <div><strong className="text-slate-500">Responsável:</strong> {submissionResult.request.responsible_name}</div>
                  <div><strong className="text-slate-500">WhatsApp:</strong> {submissionResult.request.whatsapp}</div>
                  <div><strong className="text-slate-500">E-mail:</strong> {submissionResult.request.email}</div>
                  <div><strong className="text-slate-500">{submissionResult.request.document_type}:</strong> {submissionResult.request.document_number}</div>
                  <div><strong className="text-slate-500">Localização:</strong> {submissionResult.request.city} - {submissionResult.request.state}</div>
                  <div><strong className="text-slate-500">Quadras:</strong> {submissionResult.request.court_count}</div>
                  <div><strong className="text-slate-500">Status:</strong> <span className="text-amber-500 font-bold">Pendente de Aprovação</span></div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* FORMULÁRIO DE CADASTRO PÚBLICO */
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 dark:border-slate-800">
            
            {/* Header do Formulário */}
            <div className="pb-8 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-[#ff7043] flex items-center justify-center text-white shadow-md">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Cadastre sua Arena no ArenaGo
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Aumente sua visibilidade, automatize agendamentos e receba pagamentos diretamente.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sem mensalidade de adesão</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>Recebimento Pix & Cartão</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Clock className="w-4 h-4" />
                  <span>Ativação rápida por nossa equipe</span>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="mt-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
              
              {/* SEÇÃO 1: DADOS DA ARENA E DO RESPONSÁVEL */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>1. Identificação da Arena & Responsável</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nome da Arena / Complexo Esportivo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Arena Sunset Beach"
                      value={formData.arena_name}
                      onChange={(e) => setFormData({ ...formData, arena_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nome Completo do Responsável *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo Silva"
                      value={formData.responsible_name}
                      onChange={(e) => setFormData({ ...formData, responsible_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Tipo de Cadastro *
                    </label>
                    <div className="flex items-center gap-4 pt-1">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                        <input
                          type="radio"
                          name="document_type"
                          value="CNPJ"
                          checked={formData.document_type === "CNPJ"}
                          onChange={() => setFormData({ ...formData, document_type: "CNPJ" })}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Pessoa Jurídica (CNPJ)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                        <input
                          type="radio"
                          name="document_type"
                          value="CPF"
                          checked={formData.document_type === "CPF"}
                          onChange={() => setFormData({ ...formData, document_type: "CPF" })}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Pessoa Física (CPF)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Número do {formData.document_type} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={formData.document_type === "CNPJ" ? "00.000.000/0001-00" : "000.000.000-00"}
                      value={formData.document_number}
                      onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: CONTATO OFICIAL */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>2. Contato Oficial da Arena</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      WhatsApp Comercial / Reservas (com DDD) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: (92) 98492-3316"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Este número receberá a notificação de cadastro e poderá ser exibido para os atletas.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      E-mail Profissional / Gestão *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: contato@arenasunset.com.br"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Usado para criação da conta de gestor e comunicação sobre a plataforma.
                    </p>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 3: LOCALIZAÇÃO & ENDEREÇO */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>3. Localização & Endereço</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      CEP
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 69055-010"
                      value={formData.postal_code}
                      onChange={(e) => {
                        setFormData({ ...formData, postal_code: e.target.value });
                        handleCepLookup(e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Logradouro (Rua, Avenida, Alameda) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Av. Jornalista Umberto Calderaro Filho"
                      value={formData.address_street}
                      onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Número *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 1200 ou S/N"
                      value={formData.address_number}
                      onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Adrianópolis"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Complemento (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Ao lado do Shopping"
                      value={formData.address_complement}
                      onChange={(e) => setFormData({ ...formData, address_complement: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Manaus"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Estado (UF) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={2}
                      placeholder="AM"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 4: ESTRUTURA & MODALIDADES */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>4. Modalidades & Estrutura</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Modalidades Esportivas Disponíveis (Selecione todas que se aplicam) *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {AVAILABLE_MODALITIES.map((mod) => {
                      const isSelected = formData.sports_modalities.includes(mod.id);
                      return (
                        <button
                          type="button"
                          key={mod.id}
                          onClick={() => handleModalityToggle(mod.id)}
                          className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                            isSelected
                              ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs"
                              : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-lg">{mod.icon}</span>
                          <span className="text-xs">{mod.label}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Quantidade de Quadras *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      required
                      value={formData.court_count}
                      onChange={(e) => setFormData({ ...formData, court_count: parseInt(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Horário de Funcionamento
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Seg a Sex 06h às 23h, Sáb e Dom 07h às 22h"
                      value={formData.operating_hours_description}
                      onChange={(e) => setFormData({ ...formData, operating_hours_description: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Descrição da Arena / Diferenciais (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Conte um pouco sobre sua estrutura: estacionamento, bar/lanchonete, iluminação LED, vestiários, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition resize-none"
                  />
                </div>
              </div>

              {/* AVISO DE FLUXO & BOTÃO SUBMIT */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                  <strong>Como funciona após o envio:</strong> Sua solicitação será registrada com status <strong>PENDENTE</strong> e você será direcionado ao WhatsApp da nossa Central de Atendimento (<strong>{OFFICIAL_SUPPORT_PHONE_RAW}</strong>) para validação das quadras e ativação imediata no marketplace.
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl btn-coral-gradient text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#ff7043]/20 flex items-center justify-center gap-2 transition hover:opacity-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Registrando solicitação...</span>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Cadastrar Arena e Conectar via WhatsApp</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
