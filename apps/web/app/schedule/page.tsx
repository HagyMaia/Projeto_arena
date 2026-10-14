"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  Trophy, 
  Check,
  Flame,
  Percent,
  HelpCircle,
  Home,
  MessageCircle,
  Tag,
  ArrowRight
} from "lucide-react";
import { 
  api, 
  VenueScheduleResponse, 
  CourtSchedule, 
  CourtScheduleSlot, 
  getStoredUser 
} from "@/lib/api";

function ScheduleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const venueParam = searchParams.get("venue") || searchParams.get("venue_id") || "arena-show";

  const [scheduleData, setScheduleData] = useState<VenueScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ role: string; name: string } | null>(null);

  // Lista de 14 dias para o seletor horizontal estilo Agendei Quadras
  const daysList = useMemo(() => {
    const list = [];
    const today = new Date();
    const dayNames = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const isoDate = d.toISOString().split("T")[0];
      const dayNum = String(d.getDate()).padStart(2, "0");
      const weekday = dayNames[d.getDay()];
      const monthLabel = monthNames[d.getMonth()];
      const year = d.getFullYear();

      list.push({
        isoDate,
        dayNum,
        weekday,
        monthLabel: `${monthLabel} ${year}`,
        displayFull: d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", year: "2-digit" }),
        dateObj: d,
      });
    }
    return list;
  }, []);

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const currentDay = daysList[selectedDayIndex] || daysList[0];

  // Estrutura de slots selecionados
  interface SelectedItem {
    courtId: string;
    courtName: string;
    sportType: string;
    hour: number;
    startTime: string;
    endTime: string;
    timeLabel: string;
    price: number;
  }
  const [selectedSlots, setSelectedSlots] = useState<SelectedItem[]>([]);

  // Carregar usuário logado
  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  // Carregar dados reais da API do PostgreSQL para a arena e data selecionadas
  useEffect(() => {
    async function fetchSchedule() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const data = await api.getVenueSchedule(venueParam, currentDay.isoDate);
        setScheduleData(data);
      } catch (err: any) {
        console.error("Erro ao carregar agenda:", err);
        setErrorMessage(err.message || "Erro ao conectar com a base de dados.");
        // Fallback robusto se a API offline
        setScheduleData({
          venue_id: "arena-show",
          venue_name: "ARENA SHOW",
          venue_slug: "arena-show",
          address_full: "Avenida Natan Xavier, n. 1.685, Novo Aleixo , Manaus - Amazonas",
          city: "Manaus",
          state: "AM",
          rating_average: 5.0,
          rating_count: 3,
          target_date: currentDay.isoDate,
          courts: [
            {
              court_id: "c-pele",
              court_name: "Campo Rei Pelé - Arena Show - Campo Society 40 x 18 m de jogo. Com grama sintética e área totalmente coberta.",
              sport_type: "Futebol",
              surface: "Grama Sintética",
              is_indoor: true,
              default_hourly_rate: 120.0,
              image_url: "https://images.unsplash.com/photo-1529900248673-982855519db1?auto=format&fit=crop&w=600&q=80",
              address: "Avenida Natan Xavier, n. 1.685, Novo Aleixo , Manaus - Amazonas",
              promo_badge: "R$ 10,00 de desconto a cada 2h",
              promo_subtext: "Válido das 18:00 às 21:00 ao selecionar no mínimo 2h",
              slots: [
                { hour: 14, start_time: `${currentDay.isoDate}T14:00:00`, end_time: `${currentDay.isoDate}T15:00:00`, time_label: "14:00 às 15:00", is_available: false, is_booked: true, hourly_rate: 120, original_rate: 120, badge: null, has_discount: false },
                { hour: 15, start_time: `${currentDay.isoDate}T15:00:00`, end_time: `${currentDay.isoDate}T16:00:00`, time_label: "15:00 às 16:00", is_available: true, is_booked: false, hourly_rate: 90, original_rate: 120, badge: null, has_discount: false },
                { hour: 16, start_time: `${currentDay.isoDate}T16:00:00`, end_time: `${currentDay.isoDate}T17:00:00`, time_label: "16:00 às 17:00", is_available: true, is_booked: false, hourly_rate: 110, original_rate: 120, badge: null, has_discount: false },
                { hour: 17, start_time: `${currentDay.isoDate}T17:00:00`, end_time: `${currentDay.isoDate}T18:00:00`, time_label: "17:00 às 18:00", is_available: false, is_booked: true, hourly_rate: 120, original_rate: 120, badge: null, has_discount: false },
                { hour: 18, start_time: `${currentDay.isoDate}T18:00:00`, end_time: `${currentDay.isoDate}T19:00:00`, time_label: "18:00 às 19:00", is_available: true, is_booked: false, hourly_rate: 120, original_rate: 120, badge: "🔥", has_discount: false },
                { hour: 19, start_time: `${currentDay.isoDate}T19:00:00`, end_time: `${currentDay.isoDate}T20:00:00`, time_label: "19:00 às 20:00", is_available: true, is_booked: false, hourly_rate: 120, original_rate: 120, badge: "🔥", has_discount: false },
                { hour: 20, start_time: `${currentDay.isoDate}T20:00:00`, end_time: `${currentDay.isoDate}T21:00:00`, time_label: "20:00 às 21:00", is_available: false, is_booked: true, hourly_rate: 120, original_rate: 120, badge: null, has_discount: false },
                { hour: 21, start_time: `${currentDay.isoDate}T21:00:00`, end_time: `${currentDay.isoDate}T22:00:00`, time_label: "21:00 às 22:00", is_available: false, is_booked: true, hourly_rate: 120, original_rate: 120, badge: null, has_discount: false },
                { hour: 22, start_time: `${currentDay.isoDate}T22:00:00`, end_time: `${currentDay.isoDate}T23:00:00`, time_label: "22:00 às 23:00", is_available: false, is_booked: true, hourly_rate: 120, original_rate: 120, badge: null, has_discount: false },
              ]
            },
            {
              court_id: "c-areia-1",
              court_name: "Quadra de Areia 1 - 8 x 16 m de jogo. Área coberta. Áreas da quadra isoladas por telas e redes para a bola não sair da quadra.",
              sport_type: "Vôlei, Futevôlei e Beach Tennis",
              surface: "Areia Especial Coberta",
              is_indoor: true,
              default_hourly_rate: 60.0,
              image_url: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=600&q=80",
              address: "Natan Xavier mesmo da Arena Show",
              promo_badge: "R$ 10,00 de desconto a cada 2h",
              promo_subtext: "Válido das 14:00 às 21:00 ao selecionar no mínimo 2h",
              slots: [
                { hour: 15, start_time: `${currentDay.isoDate}T15:00:00`, end_time: `${currentDay.isoDate}T16:00:00`, time_label: "15:00 às 16:00", is_available: true, is_booked: false, hourly_rate: 50, original_rate: 60, badge: "%", has_discount: true },
                { hour: 16, start_time: `${currentDay.isoDate}T16:00:00`, end_time: `${currentDay.isoDate}T17:00:00`, time_label: "16:00 às 17:00", is_available: false, is_booked: true, hourly_rate: 60, original_rate: 60, badge: null, has_discount: false },
                { hour: 17, start_time: `${currentDay.isoDate}T17:00:00`, end_time: `${currentDay.isoDate}T18:00:00`, time_label: "17:00 às 18:00", is_available: true, is_booked: false, hourly_rate: 50, original_rate: 60, badge: "%", has_discount: true },
                { hour: 18, start_time: `${currentDay.isoDate}T18:00:00`, end_time: `${currentDay.isoDate}T19:00:00`, time_label: "18:00 às 19:00", is_available: true, is_booked: false, hourly_rate: 60, original_rate: 60, badge: "🔥", has_discount: false },
                { hour: 19, start_time: `${currentDay.isoDate}T19:00:00`, end_time: `${currentDay.isoDate}T20:00:00`, time_label: "19:00 às 20:00", is_available: false, is_booked: true, hourly_rate: 60, original_rate: 60, badge: null, has_discount: false },
                { hour: 20, start_time: `${currentDay.isoDate}T20:00:00`, end_time: `${currentDay.isoDate}T21:00:00`, time_label: "20:00 às 21:00", is_available: false, is_booked: true, hourly_rate: 60, original_rate: 60, badge: null, has_discount: false },
              ]
            },
            {
              court_id: "c-areia-2",
              court_name: "Quadra de Areia 2 - 8 x 16 m de jogo. Área da quadra de areia totalmente coberta. Isolamento com grades e redes para bola não sair da quadra.",
              sport_type: "Poliesportiva, Vôlei, Futevôlei e Beach Tennis",
              surface: "Areia Especial Coberta",
              is_indoor: true,
              default_hourly_rate: 60.0,
              image_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
              address: "Avenida Natan Xavier, mesmo endereço da Arena Show.",
              promo_badge: "R$ 10,00 de desconto a cada 2h",
              promo_subtext: "Válido das 21:00 às 23:00 ao selecionar no mínimo 2h",
              slots: [
                { hour: 15, start_time: `${currentDay.isoDate}T15:00:00`, end_time: `${currentDay.isoDate}T16:00:00`, time_label: "15:00 às 16:00", is_available: true, is_booked: false, hourly_rate: 50, original_rate: 60, badge: "%", has_discount: true },
                { hour: 16, start_time: `${currentDay.isoDate}T16:00:00`, end_time: `${currentDay.isoDate}T17:00:00`, time_label: "16:00 às 17:00", is_available: true, is_booked: false, hourly_rate: 50, original_rate: 60, badge: "%", has_discount: true },
                { hour: 17, start_time: `${currentDay.isoDate}T17:00:00`, end_time: `${currentDay.isoDate}T18:00:00`, time_label: "17:00 às 18:00", is_available: true, is_booked: false, hourly_rate: 50, original_rate: 60, badge: "%", has_discount: true },
                { hour: 18, start_time: `${currentDay.isoDate}T18:00:00`, end_time: `${currentDay.isoDate}T19:00:00`, time_label: "18:00 às 19:00", is_available: true, is_booked: false, hourly_rate: 60, original_rate: 60, badge: "🔥", has_discount: false },
                { hour: 19, start_time: `${currentDay.isoDate}T19:00:00`, end_time: `${currentDay.isoDate}T20:00:00`, time_label: "19:00 às 20:00", is_available: true, is_booked: false, hourly_rate: 60, original_rate: 60, badge: "🔥", has_discount: false },
                { hour: 20, start_time: `${currentDay.isoDate}T20:00:00`, end_time: `${currentDay.isoDate}T21:00:00`, time_label: "20:00 às 21:00", is_available: false, is_booked: true, hourly_rate: 60, original_rate: 60, badge: null, has_discount: false },
              ]
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSchedule();
    // Limpar seleção ao trocar de dia
    setSelectedSlots([]);
  }, [venueParam, currentDay.isoDate]);

  // Manipulador de clique no horário (suporta múltiplas horas consecutivas)
  const handleToggleSlot = (court: CourtSchedule, slot: CourtScheduleSlot) => {
    if (slot.is_booked || !slot.is_available) return;

    // Se já tiver horários de OUTRA quadra, limpa e inicia nova seleção
    if (selectedSlots.length > 0 && selectedSlots[0].courtId !== court.court_id) {
      setSelectedSlots([{
        courtId: court.court_id,
        courtName: court.court_name,
        sportType: court.sport_type,
        hour: slot.hour,
        startTime: slot.start_time,
        endTime: slot.end_time,
        timeLabel: slot.time_label,
        price: slot.hourly_rate,
      }]);
      return;
    }

    // Verificar se o slot já está selecionado
    const isAlreadySelected = selectedSlots.some(s => s.hour === slot.hour);

    if (isAlreadySelected) {
      // Remover slot
      const filtered = selectedSlots.filter(s => s.hour !== slot.hour);
      setSelectedSlots(filtered);
    } else {
      // Adicionar novo slot
      const newSlot: SelectedItem = {
        courtId: court.court_id,
        courtName: court.court_name,
        sportType: court.sport_type,
        hour: slot.hour,
        startTime: slot.start_time,
        endTime: slot.end_time,
        timeLabel: slot.time_label,
        price: slot.hourly_rate,
      };

      const updated = [...selectedSlots, newSlot].sort((a, b) => a.hour - b.hour);
      setSelectedSlots(updated);
    }
  };

  // Cálculo financeiro da seleção
  const { subtotal, discount, finalTotal, timeRangeSummary, activeCourtName } = useMemo(() => {
    if (selectedSlots.length === 0) {
      return { subtotal: 0, discount: 0, finalTotal: 0, timeRangeSummary: "", activeCourtName: "" };
    }

    const courtName = selectedSlots[0].courtName;
    const sortedHours = selectedSlots.map(s => s.hour).sort((a, b) => a - b);
    const minH = sortedHours[0];
    const maxH = sortedHours[sortedHours.length - 1];

    const startLabel = `${String(minH).padStart(2, "0")}:00`;
    const endLabel = `${String(maxH + 1).padStart(2, "0")}:00`;
    const rangeLabel = `${startLabel} às ${endLabel}`;

    const rawSubtotal = selectedSlots.reduce((acc, curr) => acc + curr.price, 0);

    // Desconto de R$ 10 a cada 2h (exatamente como no banner da referência)
    let appliedDiscount = 0;
    if (selectedSlots.length >= 2) {
      appliedDiscount = Math.floor(selectedSlots.length / 2) * 10;
    }

    return {
      subtotal: rawSubtotal,
      discount: appliedDiscount,
      finalTotal: Math.max(0, rawSubtotal - appliedDiscount),
      timeRangeSummary: rangeLabel,
      activeCourtName: courtName,
    };
  }, [selectedSlots]);

  // Avançar para o checkout
  const handleProceedToCheckout = () => {
    if (selectedSlots.length === 0 || !scheduleData) return;

    const sortedHours = selectedSlots.map(s => s.hour).sort((a, b) => a - b);
    const minH = sortedHours[0];
    const maxH = sortedHours[sortedHours.length - 1];
    const startISO = `${currentDay.isoDate}T${String(minH).padStart(2, "0")}:00:00`;
    const endISO = `${currentDay.isoDate}T${String(maxH + 1).padStart(2, "0")}:00:00`;

    const activeCourt = scheduleData.courts.find(c => c.court_id === selectedSlots[0].courtId);

    const checkoutIntent = {
      venue: {
        id: scheduleData.venue_id,
        name: scheduleData.venue_name,
        slug: scheduleData.venue_slug,
        address: scheduleData.address_full,
        city: scheduleData.city,
        state: scheduleData.state,
      },
      court: {
        id: selectedSlots[0].courtId,
        name: selectedSlots[0].courtName,
        sportType: selectedSlots[0].sportType,
        address: activeCourt?.address || scheduleData.address_full,
      },
      date: currentDay.isoDate,
      dateFormatted: `${currentDay.weekday.toLowerCase()}, ${currentDay.dayNum} de ${currentDay.monthLabel.toLowerCase()}`,
      slots: selectedSlots,
      timeRangeLabel: timeRangeSummary,
      totalHours: selectedSlots.length,
      subtotal: subtotal,
      discount: discount,
      totalAmount: finalTotal,
      startISO: startISO,
      endISO: endISO,
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("arenago_checkout_intent", JSON.stringify(checkoutIntent));
    }

    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-orange-500 selection:text-white pb-32">
      {/* Top Header Laranja com Ícone de Calendário estilo Agendei Quadras */}
      <header className="bg-[#EA580C] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-8 rounded-lg bg-white/20 border border-white/40 flex flex-col items-center justify-center p-1 backdrop-blur-xs group-hover:scale-105 transition-transform">
                <div className="flex gap-1 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
                <div className="w-6 h-2.5 bg-white/30 rounded-xs flex items-center justify-around">
                  <span className="w-1 h-1 rounded-full bg-white"></span>
                  <span className="w-1 h-1 rounded-full bg-white"></span>
                </div>
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-sans lowercase">
                arenago
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 text-sm">
            <span className="text-xs sm:text-sm font-medium text-white/95 hidden sm:inline">
              {currentUser ? `Olá, ${currentUser.name}` : "Olá, Visitante"}
            </span>

            <Link 
              href="/" 
              title="Centros Esportivos"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>

            <Link 
              href="/player" 
              title="Minhas Reservas"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
            >
              <CalendarIcon className="w-4 h-4" />
            </Link>

            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noreferrer" 
              title="Suporte"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            {currentUser ? (
              <div className="w-9 h-9 rounded-full bg-white text-orange-600 font-extrabold flex items-center justify-center text-sm shadow-sm">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-full bg-white text-orange-600 font-bold text-xs shadow-sm hover:bg-orange-50 transition"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-8 flex-1">
        
        {/* Breadcrumb e Título Central "Agende seu Horário" */}
        <div className="relative text-center mb-6">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
              Agende seu Horário
            </h1>
            <button 
              type="button" 
              title="Ajuda sobre agendamento"
              className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold"
            >
              ?
            </button>
          </div>

          <div className="text-sm font-semibold text-slate-700 mt-2">
            {currentDay.monthLabel}
          </div>
        </div>

        {/* Calendário Horizontal de 14 Dias estilo Agendei Quadras */}
        <div className="relative mb-8 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar scroll-smooth">
            
            {/* Seta Esquerda */}
            <button
              type="button"
              onClick={() => setSelectedDayIndex(Math.max(0, selectedDayIndex - 1))}
              disabled={selectedDayIndex === 0}
              className="p-2 rounded-full text-slate-400 hover:text-orange-600 disabled:opacity-20 shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dias do Mês */}
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-1">
              {daysList.map((d, index) => {
                const isSelected = selectedDayIndex === index;

                return (
                  <button
                    key={d.isoDate}
                    type="button"
                    onClick={() => setSelectedDayIndex(index)}
                    className={`flex flex-col items-center justify-center min-w-[50px] sm:min-w-[62px] py-1.5 px-1 rounded-2xl transition-all cursor-pointer ${
                      isSelected
                        ? "bg-orange-200/60 font-bold scale-105"
                        : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <span className={`text-base sm:text-lg font-bold leading-tight ${
                      isSelected ? "text-orange-950" : "text-slate-800"
                    }`}>
                      {d.dayNum}
                    </span>
                    <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${
                      isSelected ? "text-orange-900" : "text-slate-400"
                    }`}>
                      {d.weekday}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Seta Direita */}
            <button
              type="button"
              onClick={() => setSelectedDayIndex(Math.min(daysList.length - 1, selectedDayIndex + 1))}
              disabled={selectedDayIndex === daysList.length - 1}
              className="p-2 rounded-full text-slate-400 hover:text-orange-600 disabled:opacity-20 shrink-0"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lista de Quadras com Slots Horários */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="font-semibold text-slate-600">Sincronizando disponibilidade em tempo real...</p>
            <p className="text-xs text-slate-400 mt-1">Consultando base PostgreSQL Neon Tech</p>
          </div>
        ) : scheduleData?.courts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
            <p className="text-slate-500 font-semibold">Nenhuma quadra ativa nesta arena para o dia selecionado.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {scheduleData?.courts.map((court) => (
              <div 
                key={court.court_id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden transition-all hover:shadow-md"
              >
                {/* Header do Card da Quadra com Imagem e Banner Promocional */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100">
                  
                  {/* Foto e Detalhes da Quadra */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-24 h-20 sm:w-28 sm:h-22 rounded-xl bg-slate-900 overflow-hidden shrink-0 relative border border-slate-200">
                      <img 
                        src={court.image_url || "https://images.unsplash.com/photo-1529900248673-982855519db1?auto=format&fit=crop&w=600&q=80"} 
                        alt={court.court_name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {court.court_name}
                      </h2>

                      <p className="text-xs font-semibold text-orange-600 mt-1">
                        {court.sport_type}
                      </p>

                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {court.address}
                      </p>
                    </div>
                  </div>

                  {/* Banner Verde Promocional estilo Agendei Quadras */}
                  <div className="bg-linear-to-r from-emerald-600 to-teal-500 text-white rounded-xl px-4 py-2.5 shrink-0 flex items-center gap-3 shadow-xs">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Tag className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-black">
                        {court.promo_badge || "R$ 10,00 de desconto a cada 2h"}
                      </div>
                      <div className="text-[10px] text-emerald-100 font-medium">
                        {court.promo_subtext || "Válido ao selecionar no mínimo 2h consecutivas"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grade / Trilho Horizontal de Horários da Quadra */}
                <div className="p-4 sm:p-5 bg-slate-50/50">
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 scroll-smooth">
                    {court.slots.map((slot) => {
                      const isSelected = selectedSlots.some(
                        s => s.courtId === court.court_id && s.hour === slot.hour
                      );

                      if (slot.is_booked) {
                        return (
                          <div
                            key={slot.hour}
                            className="shrink-0 bg-slate-100/90 border border-slate-200/90 rounded-xl px-3 py-2 text-center min-w-[125px] opacity-75 cursor-not-allowed select-none"
                          >
                            <span className="block text-xs font-semibold text-slate-500">
                              {slot.time_label}
                            </span>
                            <span className="block text-[11px] font-extrabold text-slate-400 mt-0.5 uppercase tracking-wider">
                              OCUPADO
                            </span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={slot.hour}
                          type="button"
                          onClick={() => handleToggleSlot(court, slot)}
                          className={`shrink-0 rounded-xl px-3.5 py-2 text-left min-w-[135px] border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? "bg-white border-orange-500 ring-2 ring-orange-500/20 shadow-md scale-102"
                              : "bg-white hover:bg-orange-50/30 border-slate-200 hover:border-orange-300 shadow-xs"
                          }`}
                        >
                          {/* Ícone de status (Rádio não marcado ou Check Verde estilo referência) */}
                          <div className="shrink-0">
                            {isSelected ? (
                              <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
                            )}
                          </div>

                          <div className="flex-1 text-center">
                            <span className="block text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">
                              {slot.time_label}
                            </span>

                            <div className="flex items-center justify-center gap-1 mt-0.5">
                              {slot.has_discount ? (
                                <>
                                  <span className="text-[10px] text-slate-400 line-through">
                                    R$ {slot.original_rate.toFixed(2).replace(".", ",")}
                                  </span>
                                  <span className="text-xs font-extrabold text-emerald-600">
                                    R$ {slot.hourly_rate.toFixed(2).replace(".", ",")}
                                  </span>
                                  <span className="text-[9px] px-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                                    %
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs font-extrabold text-slate-900">
                                  R$ {slot.hourly_rate.toFixed(2).replace(".", ",")}
                                </span>
                              )}

                              {slot.badge === "🔥" && (
                                <span className="text-xs" title="Horário nobre">🔥</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Barra Laranja Fixa Inferior com Resumo da Seleção estilo Agendei Quadras */}
      {selectedSlots.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-[#EA580C] text-white shadow-2xl py-3.5 px-4 sm:px-8 z-50 border-t border-orange-600 animate-in slide-in-from-bottom duration-200">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Texto do Agendamento */}
            <div className="text-left w-full sm:w-auto">
              <h3 className="text-xs sm:text-sm font-bold line-clamp-1 text-white">
                Resumo do agendamento na {activeCourtName}
              </h3>
              <p className="text-[11px] sm:text-xs text-orange-100 mt-0.5">
                {selectedSlots.length} {selectedSlots.length > 1 ? "horários selecionados" : "horário selecionado"} das {timeRangeSummary} de {currentDay.displayFull}
              </p>
            </div>

            {/* Total e Botão Escolher Horário */}
            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
              <div className="text-right">
                <span className="text-xs sm:text-sm font-black text-white">
                  Valor total: R$ {finalTotal.toFixed(2).replace(".", ",")}
                </span>
                {discount > 0 && (
                  <span className="block text-[10px] text-emerald-200 font-bold">
                    (R$ {discount.toFixed(2).replace(".", ",")} de desconto aplicado!)
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="bg-white hover:bg-orange-50 text-orange-600 font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
              >
                Escolher horário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ScheduleContent />
    </Suspense>
  );
}
