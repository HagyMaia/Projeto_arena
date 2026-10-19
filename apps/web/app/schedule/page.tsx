"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  Trophy, 
  ShieldCheck, 
  Repeat, 
  Zap, 
  ArrowRight,
  Info,
  Layers,
  Filter
} from "lucide-react";
import { api, Venue, Court, getStoredUser } from "@/lib/api";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { GoogleAccountModal } from "@/components/GoogleAccountModal";

// Arenas padrão para fallback e alternância rápida
const DEFAULT_VENUES: Venue[] = [
  {
    id: "beach-arena-itaim",
    slug: "beach-arena-itaim",
    name: "Beach Arena Itaim",
    description: "Complexo premium com quadras de areia aquecida, vestiários climatizados, bar gastronômico e estacionamento gratuito.",
    address: "Rua Clodomiro Amazonas, 1150, Itaim Bibi",
    city: "São Paulo",
    state: "SP",
    latitude: -23.5855,
    longitude: -46.6800,
    courts: [
      {
        id: "c-bt-coberta-1",
        venue_id: "beach-arena-itaim",
        name: "Quadra 1 — Beach Tennis Coberta",
        sport_type: "BEACH_TENNIS",
        surface: "Sand",
        is_indoor: true,
        default_hourly_rate: 120.0,
      },
      {
        id: "c-bt-externa-2",
        venue_id: "beach-arena-itaim",
        name: "Quadra 2 — Beach Tennis Externa",
        sport_type: "BEACH_TENNIS",
        surface: "Sand",
        is_indoor: false,
        default_hourly_rate: 100.0,
      },
      {
        id: "c-futevolei-3",
        venue_id: "beach-arena-itaim",
        name: "Quadra 3 — Futevôlei Pro",
        sport_type: "BEACH_TENNIS",
        surface: "Sand",
        is_indoor: false,
        default_hourly_rate: 110.0,
      },
    ],
  },
  {
    id: "arena-show",
    slug: "arena-show",
    name: "ARENA SHOW",
    description: "Complexo esportivo completo com futebol society e quadras de areia para futevôlei e beach tennis.",
    address: "Avenida Natan Xavier, n. 1.685, Novo Aleixo",
    city: "Manaus",
    state: "AM",
    latitude: -3.0558,
    longitude: -59.9868,
    courts: [
      {
        id: "c-pele",
        venue_id: "arena-show",
        name: "Campo Rei Pelé - Society Coberto",
        sport_type: "Futebol",
        surface: "Grama Sintética",
        is_indoor: true,
        default_hourly_rate: 120.0,
      },
      {
        id: "c-areia-1",
        venue_id: "arena-show",
        name: "Quadra de Areia 1 - Vôlei e Beach Tennis",
        sport_type: "Vôlei, Futevôlei e Beach Tennis",
        surface: "Areia Especial Coberta",
        is_indoor: true,
        default_hourly_rate: 60.0,
      },
      {
        id: "c-areia-2",
        venue_id: "arena-show",
        name: "Quadra de Areia 2 - Poliesportiva Coberta",
        sport_type: "Poliesportiva, Vôlei e Beach Tennis",
        surface: "Areia Especial Coberta",
        is_indoor: true,
        default_hourly_rate: 60.0,
      },
    ],
  },
  {
    id: "galaxy-sports-hub",
    slug: "galaxy-sports-hub",
    name: "Galaxy Sports Hub",
    description: "A melhor estrutura de Padel e Beach Tennis da zona sul de São Paulo.",
    address: "Av. Engenheiro Luís Carlos Berrini, 1050, Brooklin",
    city: "São Paulo",
    state: "SP",
    latitude: -23.6067,
    longitude: -46.6968,
    courts: [
      {
        id: "c-padel-1",
        venue_id: "galaxy-sports-hub",
        name: "Quadra Central Padel Pro",
        sport_type: "PADEL",
        surface: "Vidro e Grama Especial",
        is_indoor: true,
        default_hourly_rate: 140.0,
      },
      {
        id: "c-padel-2",
        venue_id: "galaxy-sports-hub",
        name: "Quadra 2 Padel Panorâmica",
        sport_type: "PADEL",
        surface: "Vidro Panorâmico",
        is_indoor: true,
        default_hourly_rate: 130.0,
      },
    ],
  },
];

function ScheduleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const venueParam = searchParams.get("venue") || searchParams.get("venue_id");
  const courtParam = searchParams.get("court_id") || searchParams.get("court");

  const [venues, setVenues] = useState<Venue[]>(DEFAULT_VENUES);
  const [selectedVenue, setSelectedVenue] = useState<Venue>(DEFAULT_VENUES[0]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Modo de reserva: Avulsa ou Mensalista Semanal
  const [bookingMode, setBookingMode] = useState<"SINGLE" | "RECURRING">("SINGLE");

  // Autenticação Google obrigatória ao avançar
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleLoggingIn, setGoogleLoggingIn] = useState(false);

  // Calendário Horizontal: próximos 14 dias
  const datesList = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const isoStr = d.toISOString().split("T")[0];
      const weekday = i === 0 ? "Hoje" : i === 1 ? "Amanhã" : d.toLocaleDateString("pt-BR", { weekday: "short" });
      const dayNum = d.getDate();
      const monthStr = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
      list.push({
        dateStr: isoStr,
        weekday: weekday.toUpperCase(),
        dayNum,
        monthStr: monthStr.toUpperCase(),
        fullDateFormatted: d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
      });
    }
    return list;
  }, []);

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const selectedDate = datesList[selectedDateIndex] || datesList[0];

  // Horários selecionados (múltiplas horas)
  interface SelectedSlotItem {
    courtId: string;
    courtName: string;
    hour: number;
    startTime: string; // "19:00"
    endTime: string;   // "20:00"
    timeLabel: string; // "19:00 às 20:00"
    price: number;
  }
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlotItem[]>([]);

  // Carregar dados reais das arenas da API Neon PostgreSQL
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await api.getVenues();
        if (data && data.length > 0) {
          setVenues(data);
          let found = null;
          if (venueParam) {
            found = data.find(v => v.id === venueParam || v.slug === venueParam);
          }
          if (!found && courtParam) {
            found = data.find(v => v.courts.some(c => c.id === courtParam));
          }
          const targetVenue = found || data[0];
          setSelectedVenue(targetVenue);
          if (courtParam && targetVenue.courts.some(c => c.id === courtParam)) {
            setSelectedCourtId(courtParam);
          }
        } else {
          // Fallback se array vazio
          applyFallbackVenue();
        }
      } catch (err) {
        console.warn("Utilizando dados de contingência para as arenas:", err);
        applyFallbackVenue();
      } finally {
        setLoading(false);
      }
    }

    function applyFallbackVenue() {
      let target = DEFAULT_VENUES[0];
      if (venueParam) {
        const matched = DEFAULT_VENUES.find(v => v.id === venueParam || v.slug === venueParam);
        if (matched) target = matched;
      }
      setSelectedVenue(target);
      if (courtParam && target.courts.some(c => c.id === courtParam)) {
        setSelectedCourtId(courtParam);
      }
    }

    loadData();
  }, [venueParam, courtParam]);

  // Lista de quadras filtrada
  const courtsToDisplay = useMemo(() => {
    if (!selectedVenue) return [];
    if (selectedCourtId === "ALL") return selectedVenue.courts;
    return selectedVenue.courts.filter(c => c.id === selectedCourtId);
  }, [selectedVenue, selectedCourtId]);

  // Helper para formatar o intervalo completo do horário (Exemplo: 19:00 às 20:00)
  const formatSlotRange = (hour: number) => {
    const startStr = `${String(hour).padStart(2, "0")}:00`;
    const nextH = hour === 23 ? 0 : hour + 1;
    const endStr = `${String(nextH).padStart(2, "0")}:00`;
    return `${startStr} às ${endStr}`;
  };

  // Gerador de slots com intervalo completo e ocupação realista
  const getSlotsForCourt = (court: Court) => {
    const slots = [];
    const baseRate = Number(court.default_hourly_rate || 100);
    const courtDiscount = Number(court.discount_percentage || 0);

    for (let h = 7; h <= 22; h++) {
      const startStr = `${String(h).padStart(2, "0")}:00`;
      const nextH = h === 23 ? 0 : h + 1;
      const endStr = `${String(nextH).padStart(2, "0")}:00`;
      const timeIntervalLabel = `${startStr} às ${endStr}`;

      // Preço dinâmico por horário:
      // Se houver desconto configurado na quadra (ex: 10%), aplica diretamente!
      let slotRate = baseRate;
      let badge = court.promo_badge || null;

      if (courtDiscount > 0) {
        slotRate = Math.round(baseRate * (1 - courtDiscount / 100));
        if (!badge) {
          badge = `${courtDiscount}% OFF`;
        }
      } else if (h < 12) {
        slotRate = Math.round(baseRate * 0.8);
        badge = "PROMO DIURNA (-20%)";
      } else if (h >= 18) {
        slotRate = Math.round(baseRate * 1.25);
        badge = "HORÁRIO NOBRE 🔥";
      }

      // Ocupação simulada baseada em hash da data e horário
      const hash = (selectedDateIndex * 17 + h * 13 + court.name.length) % 10;
      // 19h e 20h têm maior chance de ocupado
      const isBooked = (h === 19 && hash > 4) || (h === 20 && hash > 5) || (h === 7 && hash > 6) || (hash === 2);

      slots.push({
        hour: h,
        startTime: startStr,
        endTime: endStr,
        timeLabel: timeIntervalLabel,
        price: slotRate,
        badge,
        isBooked,
      });
    }
    return slots;
  };

  // Manipular clique no horário (toggle seleção múltipla de slots)
  const toggleSlot = (court: Court, slot: { hour: number; startTime: string; endTime: string; timeLabel: string; price: number; isBooked: boolean }) => {
    if (slot.isBooked) return;

    const existingIndex = selectedSlots.findIndex(
      s => s.courtId === court.id && s.hour === slot.hour
    );

    if (existingIndex >= 0) {
      // Desmarca o slot
      setSelectedSlots(prev => prev.filter((_, idx) => idx !== existingIndex));
    } else {
      // Se já houver slots de outra quadra, pergunta ou limpa para manter na mesma quadra
      if (selectedSlots.length > 0 && selectedSlots[0].courtId !== court.id) {
        if (!confirm(`Você já selecionou horários na ${selectedSlots[0].courtName}. Deseja trocar para ${court.name}?`)) {
          return;
        }
        setSelectedSlots([{
          courtId: court.id,
          courtName: court.name,
          hour: slot.hour,
          startTime: slot.startTime,
          endTime: slot.endTime,
          timeLabel: slot.timeLabel,
          price: slot.price
        }]);
        return;
      }

      // Adiciona o novo slot e ordena por hora
      const newItem: SelectedSlotItem = {
        courtId: court.id,
        courtName: court.name,
        hour: slot.hour,
        startTime: slot.startTime,
        endTime: slot.endTime,
        timeLabel: slot.timeLabel,
        price: slot.price
      };

      const updated = [...selectedSlots, newItem].sort((a, b) => a.hour - b.hour);
      setSelectedSlots(updated);
    }
  };

  // Cálculos financeiros do resumo
  const totalHours = selectedSlots.length;
  const subtotal = selectedSlots.reduce((acc, curr) => acc + curr.price, 0);

  // Descontos:
  // Se 2 ou mais horas consecutivas: 5% de desconto
  const multiHourDiscount = totalHours >= 2 ? Math.round(subtotal * 0.05) : 0;
  // Se mensalista semanal: 10% de desconto adicional
  const recurringDiscount = bookingMode === "RECURRING" ? Math.round(subtotal * 0.10) : 0;
  const totalAmount = Math.max(0, subtotal - multiHourDiscount - recurringDiscount);

  // Horário inicial e final formatado para o resumo
  const timeRangeLabel = useMemo(() => {
    if (selectedSlots.length === 0) return "";
    const first = selectedSlots[0];
    const last = selectedSlots[selectedSlots.length - 1];
    return `${first.startTime} às ${last.endTime}`;
  }, [selectedSlots]);

  // Avançar para Checkout
  const handleProceedToCheckout = () => {
    if (selectedSlots.length === 0 || !selectedVenue) return;

    const checkoutData = {
      venue: {
        id: selectedVenue.id,
        name: selectedVenue.name,
        address: selectedVenue.address,
        city: selectedVenue.city,
      },
      court: {
        id: selectedSlots[0].courtId,
        name: selectedSlots[0].courtName,
      },
      date: selectedDate.dateStr,
      dateFormatted: selectedDate.fullDateFormatted,
      slots: selectedSlots,
      timeRangeLabel,
      totalHours,
      bookingMode,
      subtotal,
      multiHourDiscount,
      recurringDiscount,
      totalAmount,
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("arenago_checkout_intent", JSON.stringify(checkoutData));
      localStorage.setItem("arenago_checkout_intent", JSON.stringify(checkoutData));
    }

    const currentUser = getStoredUser();
    if (!currentUser) {
      setGoogleModalOpen(true);
      return;
    }

    router.push("/checkout");
  };

  // Callback de autenticação Google obrigatória com preservação do agendamento
  const handleSelectGoogleAccount = async (account: { name: string; email: string }) => {
    setGoogleLoggingIn(true);
    try {
      await api.loginWithGoogle(account.email, account.name);
      setGoogleModalOpen(false);
      router.push("/checkout");
    } catch (err) {
      console.error("Falha na autenticação Google:", err);
      // Fallback seguro redirecionando para a tela de login preservando intent
      router.push("/login?redirect=/checkout&flow=booking");
    } finally {
      setGoogleLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 pb-32 transition-colors">
      {/* Topo: Detalhes da Arena Selecionada & Alternador de Arena */}
      <section className="relative bg-gradient-to-br from-[#0F172A] via-[#122238] to-[#0A101D] text-white border-b border-slate-800 overflow-hidden">
        {/* Glows esportivos sutis */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ff7043]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#ff7043]" />
                  Complexo Esportivo Verificado
                </span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>4.9 (128)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                <span className="text-sports-gradient">{selectedVenue?.name || "Beach Arena Itaim"}</span>
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{selectedVenue?.address}, {selectedVenue?.city} - {selectedVenue?.state}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#ff7043]" />
                  <span>Aberto das 07:00 às 23:00</span>
                </div>
              </div>
            </div>

            {/* Seletor de Outras Arenas */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 p-2 rounded-2xl shadow-lg">
              <span className="text-xs text-slate-300 font-medium pl-2 hidden sm:inline">Trocar Arena:</span>
              <select
                value={selectedVenue?.id || selectedVenue?.slug || ""}
                onChange={(e) => {
                  const v = venues.find(item => item.id === e.target.value || item.slug === e.target.value);
                  if (v) {
                    setSelectedVenue(v);
                    setSelectedCourtId("ALL");
                    setSelectedSlots([]);
                  }
                }}
                className="bg-slate-800 text-white text-xs font-bold rounded-xl px-3 py-2 border border-slate-600 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
              >
                {venues.map(v => (
                  <option key={v.id || v.slug} value={v.id || v.slug}>{v.name} ({v.city})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Calendário Horizontal Navegável (Data Picker Strip) */}
      <section className="bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 shadow-xs sticky top-16 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Selecione o Dia da Partida
              </span>
            </div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 capitalize">
              {selectedDate.fullDateFormatted}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão anterior */}
            <button
              onClick={() => setSelectedDateIndex(prev => Math.max(0, prev - 1))}
              disabled={selectedDateIndex === 0}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-600 dark:text-slate-300 transition cursor-pointer"
              aria-label="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Linha horizontal dos 14 dias */}
            <div className="flex-1 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {datesList.map((d, index) => {
                const isSelected = index === selectedDateIndex;
                return (
                  <button
                    key={d.dateStr}
                    onClick={() => {
                      setSelectedDateIndex(index);
                      setSelectedSlots([]);
                    }}
                    className={`shrink-0 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] py-2 px-2.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-br from-emerald-600 via-teal-600 to-[#ff7043] border-transparent text-white shadow-md shadow-emerald-600/30 scale-102 font-bold"
                        : "bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className={`text-[10px] font-extrabold uppercase tracking-tight ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                      {d.weekday}
                    </span>
                    <span className="text-lg font-black leading-tight mt-0.5">
                      {d.dayNum}
                    </span>
                    <span className={`text-[9px] font-bold uppercase ${isSelected ? "text-emerald-200" : "text-slate-400"}`}>
                      {d.monthStr}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Botão próximo */}
            <button
              onClick={() => setSelectedDateIndex(prev => Math.min(datesList.length - 1, prev + 1))}
              disabled={selectedDateIndex === datesList.length - 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-600 dark:text-slate-300 transition cursor-pointer"
              aria-label="Próximo dia"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal: Filtros de Quadra e Grade de Horários */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de Filtros: Quadras e Tipo de Reserva */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Abas de Quadra */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCourtId("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                selectedCourtId === "ALL"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              Todas as Quadras ({selectedVenue?.courts.length || 0})
            </button>
            {selectedVenue?.courts.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCourtId(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                  selectedCourtId === c.id
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Alternador de Tipo de Reserva: Avulsa vs Mensalista */}
          <div className="flex items-center bg-white dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs shrink-0">
            <button
              onClick={() => setBookingMode("SINGLE")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                bookingMode === "SINGLE"
                  ? "bg-slate-900 dark:bg-slate-800 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Reserva Avulsa
            </button>

            <button
              onClick={() => setBookingMode("RECURRING")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                bookingMode === "RECURRING"
                  ? "bg-gradient-to-r from-emerald-600 to-[#ff7043] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              Mensalista (-10% OFF)
            </button>
          </div>
        </div>

        {/* Legenda de Disponibilidade */}
        <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8 text-xs">
          <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Legenda:</span>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
            <span className="w-3 h-3 rounded-md bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600"></span>
            Disponível
          </div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="w-3 h-3 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600"></span>
            Selecionado
          </div>
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600 line-through">
            <span className="w-3 h-3 rounded-md bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700"></span>
            Ocupado / Reservado
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
            <Info className="w-3.5 h-3.5 text-coral-500" />
            <span>Você pode selecionar <strong>vários horários consecutivos</strong> para a mesma partida.</span>
          </div>
        </div>

        {/* Lista de Quadras com Grid de Horários */}
        <div className="space-y-8">
          {courtsToDisplay.map((court) => {
            const slots = getSlotsForCourt(court);

            return (
              <div key={court.id} className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs backdrop-blur-sm">
                {/* Cabeçalho da Quadra */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">{court.name}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase">
                        {court.sport_type}
                      </span>
                      {court.is_indoor ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                          Coberta
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                          Ao Ar Livre
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>Piso: <strong className="text-slate-700 dark:text-slate-300 capitalize">{court.surface?.toLowerCase() || "areia"}</strong></span>
                      <span>•</span>
                      {Number(court.discount_percentage || 0) > 0 ? (
                        <span className="flex items-center gap-1.5">
                          <span className="line-through text-slate-400">R$ {Number(court.default_hourly_rate).toFixed(2)}</span>
                          <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                            R$ {(Number(court.default_hourly_rate) * (1 - Number(court.discount_percentage) / 100)).toFixed(2)}/h
                          </strong>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#ff7043]/15 text-[#ff7043] border border-[#ff7043]/30">
                            {court.promo_badge || `${court.discount_percentage}% OFF`}
                          </span>
                        </span>
                      ) : (
                        <span>Tarifa Padrão: <strong className="text-slate-700 dark:text-slate-200">R$ {Number(court.default_hourly_rate).toFixed(2)}/h</strong></span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-200/50 dark:border-emerald-800/60">
                    Grade de 1 em 1 hora
                  </span>
                </div>

                {/* Grid de Horários com Formatação de Intervalo Completo */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {slots.map((s) => {
                    const isSelected = selectedSlots.some(
                      item => item.courtId === court.id && item.hour === s.hour
                    );

                    return (
                      <button
                        key={s.hour}
                        disabled={s.isBooked}
                        onClick={() => toggleSlot(court, s)}
                        className={`group relative p-3 rounded-2xl border text-left transition flex flex-col justify-between min-h-[96px] cursor-pointer ${
                          s.isBooked
                            ? "bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-60 cursor-not-allowed"
                            : isSelected
                            ? "bg-gradient-to-br from-emerald-600 via-teal-600 to-[#ff7043] border-transparent text-white shadow-lg shadow-emerald-600/25 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900"
                            : "bg-white dark:bg-slate-800/60 hover:bg-emerald-50/40 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-500/40 text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {/* Horário Completo em Intervalo */}
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className={`text-[11px] sm:text-xs font-extrabold tracking-tight leading-tight whitespace-nowrap ${isSelected ? "text-white" : "text-slate-900 dark:text-slate-100"}`}>
                            {s.startTime} às {s.endTime}
                          </span>
                          {isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                          ) : s.isBooked ? (
                            <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-600 uppercase shrink-0">Ocupado</span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 shrink-0">+</span>
                          )}
                        </div>

                        {/* Preço e Badges */}
                        <div className="mt-2 w-full">
                          {s.badge && !s.isBooked && !isSelected && (
                            <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded block mb-1 truncate ${
                              s.badge.includes("NOBRE")
                                ? "bg-[#ff7043]/15 text-[#ff7043] border border-[#ff7043]/30"
                                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                            }`}>
                              {s.badge}
                            </span>
                          )}

                          <div className="flex items-baseline gap-1">
                            <span className={`text-xs font-black ${isSelected ? "text-white" : "text-slate-900 dark:text-slate-100"}`}>
                              R$ {s.price}
                            </span>
                            <span className={`text-[9px] ${isSelected ? "text-emerald-200" : "text-slate-400 dark:text-slate-500"}`}>
                              /1h
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Barra Fixa Inferior com Resumo e Ação de Agendamento */}
      {selectedSlots.length > 0 && (
        <aside className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 transition-all duration-300 animate-in slide-in-from-bottom-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Informações da Partida Selecionada */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-emerald-600/30 shrink-0">
                {totalHours}h
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                    {selectedSlots[0]?.courtName}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase border border-emerald-300/40 dark:border-emerald-800">
                    {bookingMode === "RECURRING" ? "Mensalista Semanal" : "Avulsa"}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                  <strong>{selectedDate.weekday}, {selectedDate.dayNum} de {selectedDate.monthStr}</strong> • {timeRangeLabel} ({totalHours} {totalHours === 1 ? "hora" : "horas"})
                </p>

                {(multiHourDiscount > 0 || recurringDiscount > 0) && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                    <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    Economia de R$ {(multiHourDiscount + recurringDiscount).toFixed(2)} aplicada!
                  </p>
                )}
              </div>
            </div>

            {/* Total e Botão para Checkout */}
            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-slate-200 dark:border-slate-800 pt-3 sm:pt-0">
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                  Valor Total
                </span>
                <div className="flex items-baseline gap-1.5">
                  {(multiHourDiscount > 0 || recurringDiscount > 0) && (
                    <span className="text-xs text-slate-400 line-through">
                      R$ {subtotal.toFixed(2)}
                    </span>
                  )}
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    R$ {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSlots([])}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs transition cursor-pointer"
                >
                  Limpar
                </button>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="px-6 py-3 rounded-2xl btn-coral-gradient font-extrabold text-sm transition flex items-center gap-2 group cursor-pointer shadow-lg"
                >
                  <span>Continuar para Pagamento</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Botão Flutuante de WhatsApp da Arena Selecionada */}
      <FloatingWhatsApp
        venueIdOrSlug={selectedVenue?.slug || selectedVenue?.id}
        venueName={selectedVenue?.name}
      />

      {/* Modal Interativo de Login Obrigatório com Google ao Avançar */}
      <GoogleAccountModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
        loading={googleLoggingIn}
      />
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin"></div>
      </div>
    }>
      <ScheduleContent />
    </Suspense>
  );
}
