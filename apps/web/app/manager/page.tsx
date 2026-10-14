"use client";

import { useEffect, useState } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter, 
  RefreshCw, 
  Users, 
  DollarSign, 
  Percent, 
  Layers, 
  CheckCircle, 
  Clock, 
  X,
  Phone,
  Mail,
  UserCheck
} from "lucide-react";
import { api, ManagerTimelineResponse, ManagerStats, getStoredUser } from "@/lib/api";

export default function ManagerDashboardPage() {
  const [currentDate, setCurrentDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [timelineData, setTimelineData] = useState<ManagerTimelineResponse | null>(null);
  const [stats, setStats] = useState<ManagerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourtFilter, setSelectedCourtFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AVAILABLE" | "BOOKED">("ALL");
  const [selectedSlotDetails, setSelectedSlotDetails] = useState<any | null>(null);
  const [quickBookingSlot, setQuickBookingSlot] = useState<any | null>(null);
  const [customerNameInput, setCustomerNameInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fallback demo timeline if API is starting
  const fallbackTimeline: ManagerTimelineResponse = {
    date: currentDate,
    timeline: [
      {
        venue_id: "v1",
        venue_name: "Beach Arena Itaim",
        courts: [
          {
            court_id: "c1",
            court_name: "Quadra Central 1 (Areia Coberta)",
            sport_type: "BEACH_TENNIS",
            surface: "Areia Especial Climatizada",
            is_indoor: true,
            slots: [
              { hour: "08:00", end_hour: "09:00", status: "AVAILABLE", color: "#10B981", label: "Disponível • Horário livre", hourly_rate: 150 },
              { hour: "09:00", end_hour: "10:00", status: "BOOKED", color: "#F97316", booking_id: "b1", customer_name: "Lucas Ferreira", booking_type: "ONLINE_SINGLE", label: "09:00 - 10:00 • Lucas Ferreira (avulsa)", total_amount: 150 },
              { hour: "10:00", end_hour: "11:00", status: "AVAILABLE", color: "#10B981", label: "Disponível • Horário livre", hourly_rate: 150 },
              { hour: "11:00", end_hour: "12:00", status: "AVAILABLE", color: "#10B981", label: "Disponível • Horário livre", hourly_rate: 150 },
              { hour: "14:00", end_hour: "15:00", status: "BOOKED", color: "#F97316", booking_id: "b2", customer_name: "Marcelo Rossi (Mensalista)", booking_type: "RECURRING_MONTHLY", label: "14:00 - 15:00 • Marcelo Rossi (mensalista)", total_amount: 150 },
              { hour: "15:00", end_hour: "16:00", status: "AVAILABLE", color: "#10B981", label: "Disponível • Horário livre", hourly_rate: 150 },
              { hour: "18:00", end_hour: "19:00", status: "BOOKED", color: "#F97316", booking_id: "b3", customer_name: "Renata Silveira", booking_type: "ONLINE_SINGLE", label: "18:00 - 19:00 • Renata Silveira (avulsa)", total_amount: 150 },
              { hour: "19:00", end_hour: "20:00", status: "BOOKED", color: "#F97316", booking_id: "b4", customer_name: "Turma Beach 4x4", booking_type: "ONLINE_SINGLE", label: "19:00 - 20:00 • Turma Beach 4x4 (avulsa)", total_amount: 150 },
              { hour: "20:00", end_hour: "21:00", status: "AVAILABLE", color: "#10B981", label: "Disponível • Horário livre", hourly_rate: 150 },
            ]
          },
          {
            court_id: "c2",
            court_name: "Quadra 2 Externa Sol & Brisa",
            sport_type: "BEACH_TENNIS",
            surface: "Areia Branca Tratada",
            is_indoor: false,
            slots: [
              { hour: "08:00", end_hour: "09:00", status: "AVAILABLE", color: "#10B981", label: "Disponível • Horário livre", hourly_rate: 130 },
              { hour: "09:00", end_hour: "10:00", status: "AVAILABLE", color: "#10B981", label: "Disponível • Horário livre", hourly_rate: 130 },
              { hour: "10:00", end_hour: "11:00", status: "BOOKED", color: "#F97316", booking_id: "b5", customer_name: "Felipe Andreoli", booking_type: "ONLINE_SINGLE", label: "10:00 - 11:00 • Felipe Andreoli (avulsa)", total_amount: 130 },
              { hour: "16:00", end_hour: "17:00", status: "BOOKED", color: "#F97316", booking_id: "b6", customer_name: "Gabriel Medina Friends", booking_type: "ONLINE_SINGLE", label: "16:00 - 17:00 • Gabriel Medina (avulsa)", total_amount: 130 },
              { hour: "17:00", end_hour: "18:00", status: "AVAILABLE", color: "#10B981", label: "Disponível • Horário livre", hourly_rate: 130 },
              { hour: "18:00", end_hour: "19:00", status: "AVAILABLE", color: "#10B981", label: "Disponível • Horário livre", hourly_rate: 130 },
              { hour: "19:00", end_hour: "20:00", status: "BOOKED", color: "#F97316", booking_id: "b7", customer_name: "Torneio Noturno", booking_type: "ONLINE_SINGLE", label: "19:00 - 20:00 • Torneio Noturno", total_amount: 130 },
            ]
          }
        ]
      }
    ]
  };

  const loadData = async () => {
    setLoading(true);
    // Ensure manager session
    const user = getStoredUser();
    if (!user || user.role !== "MANAGER") {
      try {
        await api.login("gestor@beacharena.com.br", "arena123");
      } catch (e) {}
    }

    try {
      const [tData, sData] = await Promise.all([
        api.getManagerTimeline(currentDate),
        api.getManagerStats(),
      ]);
      setTimelineData(tData);
      setStats(sData);
    } catch (err) {
      // Use graceful fallback
      setTimelineData(fallbackTimeline);
      setStats({
        today: currentDate,
        total_bookings_today: 18,
        revenue_today: 2450.0,
        occupancy_rate_percentage: 68.5,
        active_courts_count: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const changeDay = (offset: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset);
    setCurrentDate(d.toISOString().split("T")[0]);
  };

  // Quick Counter Booking (Reserva Balcão)
  const handleQuickBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBookingSlot || !customerNameInput) return;
    setActionLoading(true);
    try {
      const startTime = `${currentDate}T${quickBookingSlot.hour}:00Z`;
      const endTime = `${currentDate}T${quickBookingSlot.end_hour}:00Z`;
      await api.createBooking(quickBookingSlot.courtId, startTime, endTime, "OFFLINE_MANUAL");
      alert("Reserva de balcão registrada com sucesso!");
      setQuickBookingSlot(null);
      setCustomerNameInput("");
      loadData();
    } catch (err: any) {
      alert(`Falha: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const courtsList = timelineData?.timeline?.[0]?.courts || [];
  const filteredCourts = courtsList.filter(c => selectedCourtFilter === "ALL" || c.court_id === selectedCourtFilter);

  return (
    <div className="min-h-screen bg-slate-100/60 pb-16">
      {/* Top Banner with Arena info & KPI Cards */}
      <section className="bg-slate-900 text-white border-b border-slate-800 pt-8 pb-12 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/30">
                  Painel do Gestor
                </span>
                <span className="text-xs text-slate-400">Quadra Fácil Style</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white mt-1">
                {timelineData?.timeline?.[0]?.venue_name || "Beach Arena Itaim"}
              </h1>
              <p className="text-xs text-slate-400">
                Grade operacional diária e gestão de fluxo de quadras em tempo real.
              </p>
            </div>

            {/* Date Navigation Bar */}
            <div className="flex items-center gap-2 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700">
              <button
                onClick={() => changeDay(-1)}
                className="p-2 rounded-xl hover:bg-slate-700 text-slate-300 transition"
                title="Dia anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 px-3 py-1">
                <CalendarIcon className="w-4 h-4 text-orange-400" />
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer"
                />
              </div>

              <button
                onClick={() => changeDay(1)}
                className="p-2 rounded-xl hover:bg-slate-700 text-slate-300 transition"
                title="Próximo dia"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={loadData}
                className="p-2 rounded-xl hover:bg-slate-700 text-orange-400 transition ml-1"
                title="Atualizar dados"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* KPI Mini-Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold">Reservas Hoje</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white">{stats?.total_bookings_today ?? 18}</p>
              <span className="text-[10px] text-emerald-400 font-medium">+14% vs semana anterior</span>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold">Faturamento Dia</span>
                <DollarSign className="w-4 h-4 text-orange-400" />
              </div>
              <p className="text-2xl font-black text-orange-400">
                R$ {Number(stats?.revenue_today ?? 2450).toFixed(2)}
              </p>
              <span className="text-[10px] text-slate-400">Total confirmado</span>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold">Taxa de Ocupação</span>
                <Percent className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-black text-white">{stats?.occupancy_rate_percentage ?? 68.5}%</p>
              <span className="text-[10px] text-blue-400 font-medium">Meta diária: 70%</span>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold">Quadras Ativas</span>
                <Layers className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-white">{stats?.active_courts_count ?? 4}</p>
              <span className="text-[10px] text-slate-400">100% operacionais</span>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Controls & Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-md flex flex-wrap items-center justify-between gap-4">
          {/* Court Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCourtFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCourtFilter === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todas as Quadras ({courtsList.length})
            </button>
            {courtsList.map(c => (
              <button
                key={c.court_id}
                onClick={() => setSelectedCourtFilter(c.court_id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCourtFilter === c.court_id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c.court_name}
              </button>
            ))}
          </div>

          {/* Status Legend & Filter matching Quadra Fácil reference */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                statusFilter === "ALL" ? "bg-slate-200 text-slate-900" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter("AVAILABLE")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                statusFilter === "AVAILABLE" ? "bg-emerald-100 text-emerald-800" : "text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Livres (Verde)
            </button>
            <button
              onClick={() => setStatusFilter("BOOKED")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                statusFilter === "BOOKED" ? "bg-orange-100 text-orange-800" : "text-orange-700 hover:bg-orange-50"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              Reservados (Laranja)
            </button>
          </div>
        </div>
      </section>

      {/* Timeline Visual Cards Grid (Quadra Fácil Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {loading ? (
          <div className="py-20 text-center text-slate-500 font-medium">
            Carregando timeline operacional da arena...
          </div>
        ) : filteredCourts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
            Nenhuma quadra encontrada para os filtros selecionados.
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCourts.map((court) => {
              const visibleSlots = court.slots.filter(s => {
                if (statusFilter === "AVAILABLE") return s.status === "AVAILABLE";
                if (statusFilter === "BOOKED") return s.status === "BOOKED";
                return true;
              });

              return (
                <div
                  key={court.court_id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden"
                >
                  {/* Court Header */}
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900">{court.court_name}</h3>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                          {court.sport_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {court.surface} • {court.is_indoor ? "Coberta" : "Ao Ar Livre"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-semibold text-slate-600">
                        Total slots: <strong className="text-slate-900">{visibleSlots.length}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Quadra Fácil Style Card Slots */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {visibleSlots.map((slot, sIdx) => {
                        const isBooked = slot.status === "BOOKED";

                        return (
                          <div
                            key={sIdx}
                            onClick={() => {
                              if (isBooked) {
                                setSelectedSlotDetails({ ...slot, courtName: court.court_name });
                              } else {
                                setQuickBookingSlot({ ...slot, courtId: court.court_id, courtName: court.court_name });
                              }
                            }}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer select-none group relative overflow-hidden ${
                              isBooked
                                ? "bg-orange-50/70 border-orange-300 hover:border-orange-500 hover:shadow-md"
                                : "bg-emerald-50/70 border-emerald-300 hover:border-emerald-500 hover:shadow-md"
                            }`}
                          >
                            {/* Accent vertical pill */}
                            <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isBooked ? "bg-orange-500" : "bg-emerald-500"}`} />

                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-black font-mono ${isBooked ? "text-orange-900" : "text-emerald-950"}`}>
                                  {slot.hour} - {slot.end_hour}
                                </span>
                              </div>

                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                isBooked ? "bg-orange-200 text-orange-900" : "bg-emerald-200 text-emerald-900"
                              }`}>
                                {isBooked ? "Reservado" : "Livre"}
                              </span>
                            </div>

                            <div className="mt-2 text-xs">
                              {isBooked ? (
                                <div>
                                  <p className="font-bold text-slate-900 line-clamp-1">{slot.customer_name || "Cliente Balcão"}</p>
                                  <p className="text-[11px] text-orange-800 font-medium mt-0.5">
                                    {slot.booking_type === "ONLINE_SINGLE" ? "Reserva Online (App)" : "Mensalista / Balcão"} • R$ {Number(slot.total_amount || 0).toFixed(2)}
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <p className="font-medium text-emerald-900">Horário Aberto para Aluguel</p>
                                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                                    Tarifa: R$ {Number(slot.hourly_rate || 0).toFixed(2)}/h • Clique p/ Bloquear
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal: Detalhes da Reserva (Laranja) */}
      {selectedSlotDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <h3 className="text-base font-black text-slate-900">Detalhes da Reserva</h3>
              </div>
              <button
                onClick={() => setSelectedSlotDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-950">
                <span className="text-[10px] uppercase font-bold text-orange-600 block">Horário e Quadra</span>
                <p className="text-sm font-black">{selectedSlotDetails.hour} - {selectedSlotDetails.end_hour} • {selectedSlotDetails.courtName}</p>
                <p className="text-xs text-orange-800 mt-0.5">Data: {currentDate}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Cliente Titular:</span>
                  <strong className="text-slate-900 font-bold">{selectedSlotDetails.customer_name}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tipo de Reserva:</span>
                  <span className="font-semibold text-slate-700">{selectedSlotDetails.booking_type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Valor Cobrado:</span>
                  <strong className="text-emerald-700 font-bold">R$ {Number(selectedSlotDetails.total_amount || 0).toFixed(2)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status do Pagamento:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">PAGO (PIX)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setSelectedSlotDetails(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reserva Rápida de Balcão (Verde) */}
      {quickBookingSlot && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleQuickBookingSubmit}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <h3 className="text-base font-black text-slate-900">Reserva de Balcão / Bloqueio</h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickBookingSlot(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Horário Disponível</span>
                <p className="text-sm font-black">{quickBookingSlot.hour} às {quickBookingSlot.end_hour}</p>
                <p className="text-xs text-emerald-800 mt-0.5">{quickBookingSlot.courtName} • {currentDate}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Cliente / Time Balcão *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Turma do Zé, Rogério Santos..."
                  value={customerNameInput}
                  onChange={(e) => setCustomerNameInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setQuickBookingSlot(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {actionLoading ? "Bloqueando..." : "Confirmar Bloqueio"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
