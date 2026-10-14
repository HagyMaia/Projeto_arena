"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  CreditCard, 
  QrCode, 
  Sparkles,
  Star,
  MapPin,
  Lock,
  XCircle
} from "lucide-react";
import { api, SlotAvailability, Booking, getStoredUser } from "@/lib/api";

function PlayerPortalContent() {
  const searchParams = useSearchParams();
  const courtIdParam = searchParams.get("court_id") || "c1";
  const venueNameParam = searchParams.get("venue_name") || "Beach Arena Itaim";
  const courtNameParam = searchParams.get("court_name") || "Quadra Central 1 (Areia Coberta)";

  const [activeTab, setActiveTab] = useState<"book" | "my_bookings">("book");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotAvailability | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Minhas reservas
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Generate 7 upcoming days for the date selector carousel
  const next7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split("T")[0];
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return {
      iso,
      dayName: dayNames[d.getDay()],
      dayNumber: d.getDate(),
      month: monthNames[d.getMonth()],
    };
  });

  // Load court slots
  useEffect(() => {
    async function loadSlots() {
      setLoadingSlots(true);
      setErrorMessage(null);
      setSelectedSlot(null);
      try {
        const data = await api.getCourtSlots(courtIdParam, selectedDate);
        setSlots(data);
      } catch (err: any) {
        // Fallback default slots if API isn't responding
        const fallback: SlotAvailability[] = [];
        for (let h = 7; h < 23; h++) {
          const isAvail = h !== 18 && h !== 19; // simulate some taken
          const start = `${selectedDate}T${h.toString().padStart(2, "0")}:00:00Z`;
          const end = `${selectedDate}T${(h + 1).toString().padStart(2, "0")}:00:00Z`;
          fallback.push({
            start_time: start,
            end_time: end,
            is_available: isAvail,
            hourly_rate: 150.0,
          });
        }
        setSlots(fallback);
      } finally {
        setLoadingSlots(false);
      }
    }
    if (activeTab === "book") {
      loadSlots();
    }
  }, [courtIdParam, selectedDate, activeTab]);

  // Load my bookings
  useEffect(() => {
    async function loadMyBookings() {
      if (activeTab === "my_bookings") {
        setLoadingBookings(true);
        try {
          const bookings = await api.getMyBookings();
          setMyBookings(bookings);
        } catch (err) {
          // If offline / unauthenticated fallback demo
          setMyBookings([
            {
              id: "b-demo-1",
              court_id: courtIdParam,
              user_id: "u1",
              start_time: `${selectedDate}T18:00:00Z`,
              end_time: `${selectedDate}T19:00:00Z`,
              status: "CONFIRMED",
              payment_status: "PAID",
              booking_type: "ONLINE_SINGLE",
              total_amount: 150.0,
            }
          ]);
        } finally {
          setLoadingBookings(false);
        }
      }
    }
    loadMyBookings();
  }, [activeTab, selectedDate, courtIdParam]);

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    setBookingLoading(true);
    setErrorMessage(null);

    // Auto-login as player if user not logged in
    const currentUser = getStoredUser();
    if (!currentUser) {
      try {
        await api.login("jogador@arenago.com.br", "player123");
      } catch (err) {
        // proceed
      }
    }

    try {
      const res = await api.createBooking(
        courtIdParam,
        selectedSlot.start_time,
        selectedSlot.end_time,
        "ONLINE_SINGLE"
      );
      setBookingSuccess(res);
      // Refresh slots
      const updatedSlots = await api.getCourtSlots(courtIdParam, selectedDate);
      setSlots(updatedSlots);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao processar reserva. O horário pode ter acabado de ser reservado.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Deseja realmente cancelar esta reserva?")) return;
    try {
      await api.cancelBooking(id);
      setMyBookings(prev => prev.map(b => b.id === id ? { ...b, status: "CANCELLED" } : b));
      alert("Reserva cancelada com sucesso!");
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const formatSlotTime = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.getUTCHours().toString().padStart(2, "0")}:00`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* View Switcher Tabs: Reservar Quadra vs Minhas Reservas */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Portal do Jogador</span>
          <h1 className="text-2xl font-black text-slate-900">Agendamento de Partida</h1>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("book")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "book" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Reservar Horário
          </button>
          <button
            onClick={() => setActiveTab("my_bookings")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "my_bookings" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Minhas Reservas
          </button>
        </div>
      </div>

      {activeTab === "book" ? (
        <div className="space-y-6">
          {/* Court Banner matching portal_jogador.jpg reference */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="relative h-48 sm:h-56 bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80"
                alt="Arena"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase shadow">
                  Beach Tennis
                </span>
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
                  Coberta Climatizada
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {venueNameParam} • Itaim Bibi, São Paulo
                </div>
                <h2 className="text-xl sm:text-2xl font-black">{courtNameParam}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex text-amber-400">
                    {"★".repeat(5)}
                  </div>
                  <span className="text-xs text-slate-300 font-semibold">4.9 (128 avaliações de atletas)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Date Selector Carousel (Seg, Ter, Qua...) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-600" />
                Selecione a Data da Partida
              </h3>
              <span className="text-xs text-slate-500">Hoje: {new Date().toLocaleDateString("pt-BR")}</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {next7Days.map((d) => {
                const isSelected = selectedDate === d.iso;
                return (
                  <button
                    key={d.iso}
                    onClick={() => setSelectedDate(d.iso)}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold scale-102"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className={`text-[10px] uppercase ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                      {d.dayName}
                    </span>
                    <span className="text-lg font-black my-0.5">{d.dayNumber}</span>
                    <span className={`text-[10px] ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                      {d.month}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots Grid (Horários Livres / Ocupados) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Horários Disponíveis (1 hora cada)
                </h3>
                <p className="text-xs text-slate-500">Selecione o melhor slot para você e seus amigos</p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600">Livre</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                  <span className="text-slate-400">Ocupado</span>
                </div>
              </div>
            </div>

            {loadingSlots ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Buscando horários em tempo real...
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {slots.map((slot, idx) => {
                  const isSelected = selectedSlot?.start_time === slot.start_time;
                  const timeLabel = formatSlotTime(slot.start_time);

                  if (!slot.is_available) {
                    return (
                      <div
                        key={idx}
                        className="py-3 px-2 rounded-xl bg-slate-100 border border-slate-200/80 text-center opacity-60 cursor-not-allowed"
                      >
                        <span className="text-xs font-bold text-slate-400 block line-through">{timeLabel}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Reservado</span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 px-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "bg-emerald-600 border-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30 scale-105"
                          : "bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-800"
                      }`}
                    >
                      <span className="text-xs font-bold block">{timeLabel}</span>
                      <span className={`text-[10px] block mt-0.5 ${isSelected ? "text-emerald-100" : "text-emerald-600 font-semibold"}`}>
                        R$ {slot.hourly_rate}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Checkout Drawer / Action Bar */}
          {selectedSlot && (
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Horário Selecionado
                  </div>
                  <h4 className="text-xl font-black">
                    {formatSlotTime(selectedSlot.start_time)} às {formatSlotTime(selectedSlot.end_time)}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {courtNameParam} • {selectedDate}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Valor do Aluguel</span>
                    <span className="text-2xl font-black text-emerald-400">R$ {selectedSlot.hourly_rate.toFixed(2)}</span>
                  </div>

                  <button
                    disabled={bookingLoading}
                    onClick={handleConfirmBooking}
                    className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {bookingLoading ? (
                      <span>Bloqueando vaga...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Confirmar e Reservar
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Double-Layer Lock Guarantee Note */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Proteção Concorrente: Redis Lock distribuído ativo contra reservas simultâneas.
                </span>
                <span className="flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  PIX Imediato & Cartão
                </span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Aviso de Concorrência:</strong> {errorMessage}
              </div>
            </div>
          )}

          {/* Success Booking Modal / Banner */}
          {bookingSuccess && (
            <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <h3 className="text-lg font-black">Reserva Confirmada com Sucesso!</h3>
              </div>
              <p className="text-xs sm:text-sm text-emerald-900">
                Seu horário foi garantido no sistema com bloqueio atômico. Código da reserva: <strong className="font-mono bg-emerald-200/70 px-2 py-0.5 rounded">{bookingSuccess.id.slice(0, 8)}</strong>
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setBookingSuccess(null); setSelectedSlot(null); setActiveTab("my_bookings"); }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow hover:bg-emerald-500"
                >
                  Ver Minhas Reservas
                </button>
                <button
                  onClick={() => setBookingSuccess(null)}
                  className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-bold text-xs hover:bg-emerald-100"
                >
                  Fazer Outro Agendamento
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Minhas Reservas Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Histórico de Agendamentos</h2>
            <span className="text-xs text-slate-500">{myBookings.length} reservas registradas</span>
          </div>

          {loadingBookings ? (
            <div className="py-12 text-center text-slate-400">Carregando suas reservas...</div>
          ) : myBookings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500">
              Você ainda não possui reservas. Escolha uma quadra no Marketplace para começar!
            </div>
          ) : (
            <div className="space-y-3">
              {myBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        b.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-800" :
                        b.status === "CANCELLED" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {b.status === "CONFIRMED" ? "Confirmada" : b.status === "CANCELLED" ? "Cancelada" : "Pendente"}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">#{b.id.slice(0, 8)}</span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{courtNameParam}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(b.start_time).toLocaleDateString("pt-BR")} das {formatSlotTime(b.start_time)} às {formatSlotTime(b.end_time)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase block">Total</span>
                      <span className="text-base font-black text-slate-900">R$ {b.total_amount?.toFixed(2)}</span>
                    </div>

                    {b.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PlayerPortalPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Carregando portal do jogador...</div>}>
      <PlayerPortalContent />
    </Suspense>
  );
}
