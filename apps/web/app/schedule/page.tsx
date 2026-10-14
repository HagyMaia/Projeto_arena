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
import { api, Venue, Court, SlotAvailability } from "@/lib/api";

function ScheduleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const venueParam = searchParams.get("venue") || searchParams.get("venue_id");
  const courtParam = searchParams.get("court_id") || searchParams.get("court");

  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Modo de reserva: Avulsa ou Mensalista Semanal
  const [bookingMode, setBookingMode] = useState<"SINGLE" | "RECURRING">("SINGLE");

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
  // Formato: array de objetos { hour: number, label: string, price: number, courtId: string, courtName: string }
  interface SelectedSlotItem {
    courtId: string;
    courtName: string;
    hour: number;
    startTime: string; // "18:00"
    endTime: string;   // "19:00"
    price: number;
  }
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlotItem[]>([]);

  // Carregar dados das arenas
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await api.getVenues();
        setVenues(data);
        if (data.length > 0) {
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
        }
      } catch (err) {
        console.error("Erro ao buscar arenas:", err);
      } finally {
        setLoading(false);
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

  // Gerador de slots por horário para cada quadra
  // Simula ocupação realista (alguns horários nobres ocupados, etc.)
  const getSlotsForCourt = (court: Court) => {
    const slots = [];
    const baseRate = Number(court.default_hourly_rate || 100);

    for (let h = 7; h <= 22; h++) {
      const startStr = `${String(h).padStart(2, "0")}:00`;
      const endStr = `${String(h + 1).padStart(2, "0")}:00`;

      // Preço dinâmico por horário:
      // 07h-12h: Manhã promocional (-20%)
      // 12h-17h: Horário normal
      // 18h-22h: Horário nobre noturno (+30%)
      let slotRate = baseRate;
      let badge = null;

      if (h < 12) {
        slotRate = Math.round(baseRate * 0.8);
        badge = "PROMO DIURNA (-20%)";
      } else if (h >= 18) {
        slotRate = Math.round(baseRate * 1.25);
        badge = "HORÁRIO NOBRE 🔥";
      }

      // Ocupação simulada baseada em hash da data e horário
      const hash = (selectedDateIndex * 17 + h * 13 + court.name.length) % 10;
      // 19h e 20h têm maior chance de ocupado
      const isBooked = (h === 19 && hash > 4) || (h === 20 && hash > 5) || (hash === 2);

      slots.push({
        hour: h,
        startTime: startStr,
        endTime: endStr,
        price: slotRate,
        badge,
        isBooked,
      });
    }
    return slots;
  };

  // Manipular clique no horário (toggle seleção múltipla)
  const toggleSlot = (court: Court, slot: { hour: number; startTime: string; endTime: string; price: number; isBooked: boolean }) => {
    if (slot.isBooked) return;

    const existingIndex = selectedSlots.findIndex(
      s => s.courtId === court.id && s.hour === slot.hour
    );

    if (existingIndex >= 0) {
      // Desmarca o slot
      setSelectedSlots(prev => prev.filter((_, idx) => idx !== existingIndex));
    } else {
      // Se já houver slots de outra quadra, avisa ou limpa para manter na mesma quadra
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

  // Horário inicial e final formatado
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
    }

    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Topo: Detalhes da Arena Selecionada & Alternador */}
      <section className="bg-slate-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] uppercase tracking-wide">
                  Complexo Esportivo Verificado
                </span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>4.9 (128)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {selectedVenue?.name || "Carregando Arena..."}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{selectedVenue?.address}, {selectedVenue?.city} - {selectedVenue?.state}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Aberto das 07:00 às 23:00</span>
                </div>
              </div>
            </div>

            {/* Seletor de Outras Arenas */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium pl-2 hidden sm:inline">Trocar Arena:</span>
              <select
                value={selectedVenue?.id || ""}
                onChange={(e) => {
                  const v = venues.find(item => item.id === e.target.value);
                  if (v) {
                    setSelectedVenue(v);
                    setSelectedCourtId("ALL");
                    setSelectedSlots([]);
                  }
                }}
                className="bg-slate-800 text-white text-xs font-bold rounded-xl px-3 py-2 border border-slate-700 focus:outline-hidden focus:border-emerald-500"
              >
                {venues.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.city})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Calendário Horizontal Navegável (Data Picker Strip) */}
      <section className="bg-white border-b border-slate-200 shadow-xs sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Selecione o Dia da Partida
              </span>
            </div>
            <span className="text-xs font-semibold text-emerald-700 capitalize">
              {selectedDate.fullDateFormatted}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão anterior */}
            <button
              onClick={() => setSelectedDateIndex(prev => Math.max(0, prev - 1))}
              disabled={selectedDateIndex === 0}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-slate-600 transition"
              aria-label="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Linha horizontal dos 14 dias */}
            <div className="flex-1 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {datesList.map((d, index) => {
                const isSelected = index === selectedDateIndex;
                return (
                  <button
                    key={d.dateStr}
                    onClick={() => {
                      setSelectedDateIndex(index);
                      // Mantém ou limpa os slots ao trocar data
                      setSelectedSlots([]);
                    }}
                    className={`shrink-0 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] py-2 px-2.5 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-102"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <span className={`text-[10px] font-extrabold uppercase tracking-tight ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                      {d.weekday}
                    </span>
                    <span className="text-lg font-black leading-tight mt-0.5">
                      {d.dayNum}
                    </span>
                    <span className={`text-[9px] font-bold uppercase ${isSelected ? "text-emerald-200" : "text-slate-500"}`}>
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
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-slate-600 transition"
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedCourtId === "ALL"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Todas as Quadras ({selectedVenue?.courts.length || 0})
            </button>
            {selectedVenue?.courts.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCourtId(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedCourtId === c.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Alternador de Tipo de Reserva: Avulsa vs Mensalista */}
          <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-xs shrink-0">
            <button
              onClick={() => setBookingMode("SINGLE")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                bookingMode === "SINGLE"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Reserva Avulsa
            </button>

            <button
              onClick={() => setBookingMode("RECURRING")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                bookingMode === "RECURRING"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              Mensalista (-10% OFF)
            </button>
          </div>
        </div>

        {/* Legenda de Disponibilidade */}
        <div className="flex flex-wrap items-center gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 mb-8 text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Legenda:</span>
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="w-3 h-3 rounded-md bg-white border-2 border-slate-300"></span>
            Disponível
          </div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <span className="w-3 h-3 rounded-md bg-emerald-600"></span>
            Selecionado
          </div>
          <div className="flex items-center gap-2 text-slate-400 line-through">
            <span className="w-3 h-3 rounded-md bg-slate-200 border border-slate-300"></span>
            Ocupado / Reservado
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-1.5 text-slate-500 font-medium">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Você pode selecionar <strong>vários horários consecutivos</strong> para a mesma partida.</span>
          </div>
        </div>

        {/* Lista de Quadras com Grid de Horários */}
        <div className="space-y-8">
          {courtsToDisplay.map((court) => {
            const slots = getSlotsForCourt(court);

            return (
              <div key={court.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                {/* Cabeçalho da Quadra */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{court.name}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                        {court.sport_type}
                      </span>
                      {court.is_indoor ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px]">
                          Coberta
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px]">
                          Ao Ar Livre
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Piso: <strong className="text-slate-700 capitalize">{court.surface.toLowerCase()}</strong> • Tarifa Padrão: <strong>R$ {Number(court.default_hourly_rate).toFixed(2)}/h</strong>
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                    Grade de 1 em 1 hora
                  </span>
                </div>

                {/* Grid de Horários de 1 hora */}
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
                        className={`group relative p-3 rounded-2xl border text-left transition flex flex-col justify-between min-h-[90px] ${
                          s.isBooked
                            ? "bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
                            : isSelected
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500 ring-offset-2"
                            : "bg-white hover:bg-emerald-50/50 border-slate-200 hover:border-emerald-300 text-slate-800"
                        }`}
                      >
                        {/* Horário */}
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-black tracking-tight ${isSelected ? "text-white" : "text-slate-900"}`}>
                            {s.startTime}
                          </span>
                          {isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                          ) : s.isBooked ? (
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Ocupado</span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600">+</span>
                          )}
                        </div>

                        {/* Preço e Badges */}
                        <div className="mt-2">
                          {s.badge && !s.isBooked && !isSelected && (
                            <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded block mb-1 truncate ${
                              s.badge.includes("NOBRE") ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {s.badge}
                            </span>
                          )}

                          <div className="flex items-baseline gap-1">
                            <span className={`text-xs font-black ${isSelected ? "text-white" : "text-slate-900"}`}>
                              R$ {s.price}
                            </span>
                            <span className={`text-[9px] ${isSelected ? "text-emerald-200" : "text-slate-400"}`}>
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

      {/* Tela 4: Barra Fixa Inferior com Resumo e Ação (Sticky Bottom Bar) */}
      {selectedSlots.length > 0 && (
        <aside className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl z-50 p-4 transition-all duration-300 animate-in slide-in-from-bottom-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Informações da Partida Selecionada */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-emerald-600/30 shrink-0">
                {totalHours}h
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    {selectedSlots[0]?.courtName}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    {bookingMode === "RECURRING" ? "Mensalista Semanal" : "Avulsa"}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  <strong>{selectedDate.weekday}, {selectedDate.dayNum} de {selectedDate.monthStr}</strong> • {timeRangeLabel} ({totalHours} {totalHours === 1 ? "hora" : "horas"})
                </p>

                {(multiHourDiscount > 0 || recurringDiscount > 0) && (
                  <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    Economia de R$ {(multiHourDiscount + recurringDiscount).toFixed(2)} aplicada!
                  </p>
                )}
              </div>
            </div>

            {/* Total e Botão para Checkout */}
            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Valor Total
                </span>
                <div className="flex items-baseline gap-1.5">
                  {(multiHourDiscount > 0 || recurringDiscount > 0) && (
                    <span className="text-xs text-slate-400 line-through">
                      R$ {subtotal.toFixed(2)}
                    </span>
                  )}
                  <span className="text-xl sm:text-2xl font-black text-slate-900">
                    R$ {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSlots([])}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold text-xs transition"
                >
                  Limpar
                </button>

                <button
                  onClick={handleProceedToCheckout}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 group active:scale-[0.98]"
                >
                  <span>Continuar para Pagamento</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}
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
