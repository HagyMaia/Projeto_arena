"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  UserCheck,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Building,
  Check,
  Trash2,
  Edit2,
  AlertCircle
} from "lucide-react";
import { 
  api, 
  ManagerTimelineResponse, 
  ManagerStats, 
  ManagerVenue,
  WhatsAppContact,
  CreateWhatsAppContactPayload,
  UpdateWhatsAppContactPayload,
  getStoredUser 
} from "@/lib/api";
import { formatWhatsAppUrl } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const SECTORS_LIST = [
  "Reservas",
  "Atendimento ao Cliente",
  "Financeiro & Mensalistas",
  "Aulas & Treinos",
  "Torneios & Eventos",
  "Bar & Restaurante",
  "Suporte Geral"
];

export default function ManagerDashboardPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"timeline" | "whatsapp">("timeline");

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

  // WhatsApp Management State
  const [managerVenues, setManagerVenues] = useState<ManagerVenue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const [whatsappContacts, setWhatsappContacts] = useState<WhatsAppContact[]>([]);
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<WhatsAppContact | null>(null);
  const [contactFeedback, setContactFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Contact Form
  const [contactForm, setContactForm] = useState<CreateWhatsAppContactPayload>({
    department: "Reservas",
    label: "WhatsApp Recepção",
    phone_number: "",
    custom_message: "Olá! Gostaria de informações sobre reservas de quadra.",
    is_primary: false,
    is_active: true
  });

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
              { hour: "08:00", end_hour: "09:00", status: "AVAILABLE", color: "#059669", label: "Disponível • Horário livre", hourly_rate: 150 },
              { hour: "09:00", end_hour: "10:00", status: "BOOKED", color: "#0F172A", booking_id: "b1", customer_name: "Lucas Ferreira", booking_type: "ONLINE_SINGLE", label: "09:00 - 10:00 • Lucas Ferreira (avulsa)", total_amount: 150 },
              { hour: "10:00", end_hour: "11:00", status: "AVAILABLE", color: "#059669", label: "Disponível • Horário livre", hourly_rate: 150 },
              { hour: "11:00", end_hour: "12:00", status: "AVAILABLE", color: "#059669", label: "Disponível • Horário livre", hourly_rate: 150 },
              { hour: "14:00", end_hour: "15:00", status: "BOOKED", color: "#0F172A", booking_id: "b2", customer_name: "Marcelo Rossi (Mensalista)", booking_type: "RECURRING_MONTHLY", label: "14:00 - 15:00 • Marcelo Rossi (mensalista)", total_amount: 150 },
              { hour: "15:00", end_hour: "16:00", status: "AVAILABLE", color: "#059669", label: "Disponível • Horário livre", hourly_rate: 150 },
              { hour: "18:00", end_hour: "19:00", status: "BOOKED", color: "#0F172A", booking_id: "b3", customer_name: "Renata Silveira", booking_type: "ONLINE_SINGLE", label: "18:00 - 19:00 • Renata Silveira (avulsa)", total_amount: 150 },
              { hour: "19:00", end_hour: "20:00", status: "BOOKED", color: "#0F172A", booking_id: "b4", customer_name: "Turma Beach 4x4", booking_type: "ONLINE_SINGLE", label: "19:00 - 20:00 • Turma Beach 4x4 (avulsa)", total_amount: 150 },
              { hour: "20:00", end_hour: "21:00", status: "AVAILABLE", color: "#059669", label: "Disponível • Horário livre", hourly_rate: 150 },
            ]
          },
          {
            court_id: "c2",
            court_name: "Quadra 2 Externa Sol & Brisa",
            sport_type: "BEACH_TENNIS",
            surface: "Areia Branca Tratada",
            is_indoor: false,
            slots: [
              { hour: "08:00", end_hour: "09:00", status: "AVAILABLE", color: "#059669", label: "Disponível • Horário livre", hourly_rate: 130 },
              { hour: "09:00", end_hour: "10:00", status: "AVAILABLE", color: "#059669", label: "Disponível • Horário livre", hourly_rate: 130 },
              { hour: "10:00", end_hour: "11:00", status: "BOOKED", color: "#0F172A", booking_id: "b5", customer_name: "Felipe Andreoli", booking_type: "ONLINE_SINGLE", label: "10:00 - 11:00 • Felipe Andreoli (avulsa)", total_amount: 130 },
              { hour: "16:00", end_hour: "17:00", status: "BOOKED", color: "#0F172A", booking_id: "b6", customer_name: "Gabriel Medina Friends", booking_type: "ONLINE_SINGLE", label: "16:00 - 17:00 • Gabriel Medina (avulsa)", total_amount: 130 },
              { hour: "17:00", end_hour: "18:00", status: "AVAILABLE", color: "#059669", label: "Disponível • Horário livre", hourly_rate: 130 },
              { hour: "18:00", end_hour: "19:00", status: "AVAILABLE", color: "#059669", label: "Disponível • Horário livre", hourly_rate: 130 },
              { hour: "19:00", end_hour: "20:00", status: "BOOKED", color: "#0F172A", booking_id: "b7", customer_name: "Torneio Noturno", booking_type: "ONLINE_SINGLE", label: "19:00 - 20:00 • Torneio Noturno", total_amount: 130 },
            ]
          }
        ]
      }
    ]
  };

  const loadData = async () => {
    // RBAC check: Only MANAGER and SUPERADMIN can access
    const user = getStoredUser();
    if (!user) {
      router.push("/login?redirect=/manager");
      return;
    }
    if (user.role === "PLAYER") {
      router.push("/player");
      return;
    }

    setUserRole(user.role);
    setUserName(user.name);
    setLoading(true);

    try {
      const [tData, sData, vData] = await Promise.all([
        api.getManagerTimeline(currentDate).catch(() => null),
        api.getManagerStats().catch(() => null),
        api.getManagerVenues().catch(() => [])
      ]);

      if (tData) {
        setTimelineData(tData);
      } else {
        setTimelineData(fallbackTimeline);
      }

      if (sData) {
        setStats(sData);
      } else {
        setStats({
          today: currentDate,
          total_bookings_today: 18,
          revenue_today: 2450.0,
          occupancy_rate_percentage: 68.5,
          active_courts_count: 4,
        });
      }

      if (vData && vData.length > 0) {
        setManagerVenues(vData);
        if (!selectedVenueId) {
          setSelectedVenueId(vData[0].id);
          setWhatsappContacts(vData[0].whatsapp_contacts || []);
        } else {
          const currentV = vData.find(v => v.id === selectedVenueId) || vData[0];
          setWhatsappContacts(currentV.whatsapp_contacts || []);
        }
      }
    } catch {
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

  // Load WhatsApp contacts when selected venue changes
  const loadVenueWhatsApp = async (venueId: string) => {
    if (!venueId) return;
    setWhatsappLoading(true);
    try {
      const contacts = await api.getVenueWhatsAppContacts(venueId);
      setWhatsappContacts(contacts);
    } catch {
      const v = managerVenues.find(item => item.id === venueId);
      if (v) setWhatsappContacts(v.whatsapp_contacts || []);
    } finally {
      setWhatsappLoading(false);
    }
  };

  const handleVenueChange = (newVenueId: string) => {
    setSelectedVenueId(newVenueId);
    loadVenueWhatsApp(newVenueId);
  };

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

  // WhatsApp Actions
  const showNotification = (type: "success" | "error", text: string) => {
    setContactFeedback({ type, text });
    setTimeout(() => setContactFeedback(null), 4000);
  };

  const handleOpenAddContact = () => {
    setEditingContact(null);
    setContactForm({
      department: "Reservas",
      label: "WhatsApp Recepção",
      phone_number: "",
      custom_message: "Olá! Gostaria de informações sobre reservas de quadra.",
      is_primary: whatsappContacts.length === 0,
      is_active: true
    });
    setIsContactModalOpen(true);
  };

  const handleOpenEditContact = (c: WhatsAppContact) => {
    setEditingContact(c);
    setContactForm({
      department: c.department,
      label: c.label || "",
      phone_number: c.phone_number,
      custom_message: c.custom_message || "",
      is_primary: c.is_primary,
      is_active: c.is_active
    });
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = contactForm.phone_number.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      showNotification("error", "Número de WhatsApp inválido. Digite DDD + número (ex: 11988887777).");
      return;
    }

    if (!selectedVenueId && managerVenues.length > 0) {
      setSelectedVenueId(managerVenues[0].id);
    }
    const targetVenueId = selectedVenueId || (managerVenues[0]?.id);

    if (!targetVenueId) {
      showNotification("error", "Nenhuma arena vinculada encontrada para associar o contato.");
      return;
    }

    setActionLoading(true);
    try {
      if (editingContact) {
        await api.updateManagerWhatsAppContact(editingContact.id, {
          department: contactForm.department,
          label: contactForm.label,
          phone_number: contactForm.phone_number,
          custom_message: contactForm.custom_message,
          is_primary: contactForm.is_primary,
          is_active: contactForm.is_active
        });
        showNotification("success", "Contato WhatsApp atualizado com sucesso!");
      } else {
        await api.createManagerWhatsAppContact(targetVenueId, {
          venue_id: targetVenueId,
          department: contactForm.department,
          label: contactForm.label,
          phone_number: contactForm.phone_number,
          custom_message: contactForm.custom_message,
          is_primary: contactForm.is_primary,
          is_active: contactForm.is_active
        });
        showNotification("success", "Novo contato de WhatsApp cadastrado!");
      }
      setIsContactModalOpen(false);
      await loadVenueWhatsApp(targetVenueId);
    } catch (err: any) {
      showNotification("error", `Erro: ${err.message || "Não foi possível salvar o contato."}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleContactActive = async (contact: WhatsAppContact) => {
    try {
      await api.updateManagerWhatsAppContact(contact.id, {
        is_active: !contact.is_active
      });
      showNotification("success", `Contato ${!contact.is_active ? "ativado" : "pausado"} com sucesso.`);
      if (selectedVenueId) loadVenueWhatsApp(selectedVenueId);
    } catch (err: any) {
      showNotification("error", "Erro ao atualizar status do contato.");
    }
  };

  const handleSetPrimaryContact = async (contact: WhatsAppContact) => {
    try {
      await api.updateManagerWhatsAppContact(contact.id, {
        is_primary: true
      });
      showNotification("success", `Contato definido como principal para ${contact.department}.`);
      if (selectedVenueId) loadVenueWhatsApp(selectedVenueId);
    } catch (err: any) {
      showNotification("error", "Erro ao definir contato principal.");
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("Tem certeza que deseja excluir este número de WhatsApp?")) return;
    try {
      await api.deleteManagerWhatsAppContact(contactId);
      showNotification("success", "Contato WhatsApp excluído.");
      if (selectedVenueId) loadVenueWhatsApp(selectedVenueId);
    } catch (err: any) {
      showNotification("error", "Erro ao excluir contato.");
    }
  };

  const courtsList = timelineData?.timeline?.[0]?.courts || [];
  const filteredCourts = courtsList.filter(c => selectedCourtFilter === "ALL" || c.court_id === selectedCourtFilter);

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 pb-16 transition-colors">
      {/* Top Banner with Arena info & KPI Cards */}
      <section className="bg-slate-900 dark:bg-slate-950 text-white border-b border-slate-800 pt-8 pb-12 px-4 sm:px-6 lg:px-8 shadow-md relative overflow-hidden">
        {/* Ambient glowing orbs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#ff7043]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                  Painel do Gestor
                </span>
                <span className="text-xs text-slate-400">Quadra Fácil Style</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white mt-1">
                <span className="text-sports-gradient">{timelineData?.timeline?.[0]?.venue_name || "Beach Arena Itaim"}</span>
              </h1>
              <p className="text-xs text-slate-400">
                Grade operacional diária e gestão integrada de fluxo e canais de contato.
              </p>
            </div>

            {/* Top Right: Actions & Theme Toggle & Date Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                title="Visualizar a plataforma pública como atleta/cliente"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ver Visão do Cliente</span>
              </Link>

              {userRole === "SUPERADMIN" && (
                <Link
                  href="/admin"
                  className="px-3.5 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 text-purple-200 border border-purple-700/60 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  title="Acessar o Painel SuperAdmin SaaS"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>SaaS Master</span>
                </Link>
              )}

              <ThemeToggle />

              {/* Date Navigation Bar (Only for Timeline tab) */}
              {activeTab === "timeline" && (
                <div className="flex items-center gap-2 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700">
                  <button
                    onClick={() => changeDay(-1)}
                    className="p-2 rounded-xl hover:bg-slate-700 text-slate-300 transition"
                    title="Dia anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2 px-3 py-1">
                    <CalendarIcon className="w-4 h-4 text-emerald-400" />
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
                    className="p-2 rounded-xl hover:bg-slate-700 text-emerald-400 transition ml-1"
                    title="Atualizar dados"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs (Grade Operacional vs WhatsApp) */}
          <div className="flex items-center gap-2 border-b border-slate-800 mb-6">
            <button
              onClick={() => setActiveTab("timeline")}
              className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition ${
                activeTab === "timeline"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-4 h-4" />
              Grade Operacional (Timeline)
            </button>
            <button
              onClick={() => setActiveTab("whatsapp")}
              className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition ${
                activeTab === "whatsapp"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Setorizado ({whatsappContacts.length})
            </button>
          </div>

          {/* KPI Mini-Cards (Shown in Timeline tab) */}
          {activeTab === "timeline" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold">Reservas Hoje</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-white">{stats?.total_bookings_today ?? 18}</p>
                <span className="text-[10px] text-emerald-400 font-medium">+14% vs semana anterior</span>
              </div>

              <div className="bg-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold">Faturamento Dia</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-emerald-400">
                  R$ {Number(stats?.revenue_today ?? 2450).toFixed(2)}
                </p>
                <span className="text-[10px] text-slate-400">Total confirmado</span>
              </div>

              <div className="bg-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold">Taxa de Ocupação</span>
                  <Percent className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-black text-white">{stats?.occupancy_rate_percentage ?? 68.5}%</p>
                <span className="text-[10px] text-blue-400 font-medium">Meta diária: 70%</span>
              </div>

              <div className="bg-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold">Quadras Ativas</span>
                  <Layers className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-black text-white">{stats?.active_courts_count ?? 4}</p>
                <span className="text-[10px] text-slate-400">100% operacionais</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FEEDBACK NOTIFICATION */}
      {contactFeedback && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between ${
            contactFeedback.type === "success" 
              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800"
              : "bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800"
          }`}>
            <div className="flex items-center gap-2">
              {contactFeedback.type === "success" ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{contactFeedback.text}</span>
            </div>
            <button onClick={() => setContactFeedback(null)} className="p-1 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: GRADE OPERACIONAL */}
      {activeTab === "timeline" && (
        <>
          {/* Timeline Controls & Filters */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
              {/* Court Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setSelectedCourtFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    selectedCourtFilter === "ALL"
                      ? "bg-slate-900 dark:bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
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
                        ? "bg-slate-900 dark:bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {c.court_name}
                  </button>
                ))}
              </div>

              {/* Status Legend & Filter matching Quadra Fácil reference (Zero Orange) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    statusFilter === "ALL" 
                      ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setStatusFilter("AVAILABLE")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                    statusFilter === "AVAILABLE" 
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300" 
                      : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Livres
                </button>
                <button
                  onClick={() => setStatusFilter("BOOKED")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                    statusFilter === "BOOKED" 
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100" 
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800 dark:bg-slate-300"></span>
                  Reservados
                </button>
              </div>
            </div>
          </section>

          {/* Timeline Visual Cards Grid (Quadra Fácil Style) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            {loading ? (
              <div className="py-20 text-center text-slate-500 dark:text-slate-400 font-medium">
                Carregando timeline operacional da arena...
              </div>
            ) : filteredCourts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
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
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden"
                    >
                      {/* Court Header */}
                      <div className="bg-slate-50 dark:bg-slate-850 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{court.court_name}</h3>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase">
                              {court.sport_type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {court.surface} • {court.is_indoor ? "Coberta" : "Ao Ar Livre"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">
                            Total slots: <strong className="text-slate-900 dark:text-white">{visibleSlots.length}</strong>
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
                                    ? "bg-slate-100/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 hover:border-slate-500 dark:hover:border-slate-500 hover:shadow-md"
                                    : "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 hover:shadow-md"
                                }`}
                              >
                                {/* Accent vertical pill */}
                                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isBooked ? "bg-slate-800 dark:bg-slate-400" : "bg-emerald-500"}`} />

                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm font-black font-mono ${isBooked ? "text-slate-900 dark:text-slate-100" : "text-emerald-950 dark:text-emerald-300"}`}>
                                      {slot.hour} - {slot.end_hour}
                                    </span>
                                  </div>

                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                    isBooked 
                                      ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200" 
                                      : "bg-emerald-200 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200"
                                  }`}>
                                    {isBooked ? "Reservado" : "Livre"}
                                  </span>
                                </div>

                                <div className="mt-2 text-xs">
                                  {isBooked ? (
                                    <div>
                                      <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{slot.customer_name || "Cliente Balcão"}</p>
                                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                                        {slot.booking_type === "ONLINE_SINGLE" ? "Reserva Online (App)" : "Mensalista / Balcão"} • R$ {Number(slot.total_amount || 0).toFixed(2)}
                                      </p>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="font-medium text-emerald-900 dark:text-emerald-200">Horário Aberto para Aluguel</p>
                                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
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
        </>
      )}

      {/* TAB 2: WHATSAPP SETORIZADO */}
      {activeTab === "whatsapp" && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                    <MessageCircle className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Canais Oficiais de WhatsApp da Arena</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Configure números dedicados por setor (Reservas, Atendimento, Financeiro) com direcionamento direto via wa.me.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Arena switcher if manager has more than one */}
                {managerVenues.length > 1 && (
                  <select
                    value={selectedVenueId}
                    onChange={(e) => handleVenueChange(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  >
                    {managerVenues.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                )}

                <button
                  onClick={handleOpenAddContact}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  Novo Número de WhatsApp
                </button>
              </div>
            </div>

            {/* List of WhatsApp Contacts */}
            {whatsappLoading ? (
              <div className="py-16 text-center text-slate-500 dark:text-slate-400">
                Carregando contatos de WhatsApp...
              </div>
            ) : whatsappContacts.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Nenhum número de WhatsApp cadastrado</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                  Cadastre o WhatsApp de reservas ou atendimento da arena para que os atletas possam entrar em contato com um clique.
                </p>
                <button
                  onClick={handleOpenAddContact}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Cadastrar Primeiro Número
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {whatsappContacts.map((contact) => {
                  const waUrl = formatWhatsAppUrl(contact.phone_number, contact.custom_message || "Olá! Gostaria de falar com o atendimento da arena.");

                  return (
                    <div
                      key={contact.id}
                      className={`p-5 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between ${
                        contact.is_active
                          ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 shadow-xs"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60"
                      }`}
                    >
                      {/* Top badge row */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                            {contact.department}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {contact.is_primary && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[9px] font-black uppercase">
                                Principal
                              </span>
                            )}
                            <span className={`w-2 h-2 rounded-full ${contact.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                          </div>
                        </div>

                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {contact.label || contact.department}
                        </h4>
                        <p className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                          {contact.phone_number}
                        </p>

                        {contact.custom_message && (
                          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-300 italic line-clamp-2">
                            "{contact.custom_message}"
                          </div>
                        )}
                      </div>

                      {/* Action buttons footer */}
                      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold transition"
                          title="Abrir no WhatsApp"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Testar wa.me</span>
                        </a>

                        <div className="flex items-center gap-1">
                          {!contact.is_primary && (
                            <button
                              onClick={() => handleSetPrimaryContact(contact)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="Tornar número principal"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleContactActive(contact)}
                            className={`p-1.5 rounded-lg transition ${
                              contact.is_active 
                                ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" 
                                : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                            title={contact.is_active ? "Pausar canal" : "Ativar canal"}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditContact(contact)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Editar contato"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                            title="Excluir número"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* MODAL: ADICIONAR / EDITAR CONTATO DE WHATSAPP */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveContact}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <MessageCircle className="w-4 h-4" />
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {editingContact ? "Editar Contato WhatsApp" : "Novo Contato WhatsApp"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Setor / Departamento *
                </label>
                <select
                  value={contactForm.department}
                  onChange={(e) => setContactForm({ ...contactForm, department: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {SECTORS_LIST.map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rótulo / Nome de Identificação
                </label>
                <input
                  type="text"
                  placeholder="Ex: WhatsApp Recepção Central, Plantão Noturno"
                  value={contactForm.label || ""}
                  onChange={(e) => setContactForm({ ...contactForm, label: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Número de WhatsApp (DDD + Número) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 98888-7777"
                  value={contactForm.phone_number}
                  onChange={(e) => setContactForm({ ...contactForm, phone_number: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Validação direta: será formatado e integrado com link seguro wa.me.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mensagem Automática Inicial
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Olá, gostaria de informações sobre agendamento de horários."
                  value={contactForm.custom_message || ""}
                  onChange={(e) => setContactForm({ ...contactForm, custom_message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactForm.is_primary}
                    onChange={(e) => setContactForm({ ...contactForm, is_primary: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Número Principal</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactForm.is_active}
                    onChange={(e) => setContactForm({ ...contactForm, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ativo</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 transition"
              >
                {actionLoading ? "Salvando..." : "Salvar Contato"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: DETALHES DA RESERVA (Zero Orange, Marinho & Esmeralda) */}
      {selectedSlotDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-800 dark:bg-slate-300"></span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Detalhes da Reserva</h3>
              </div>
              <button
                onClick={() => setSelectedSlotDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300 block">Horário e Quadra</span>
                <p className="text-sm font-black">{selectedSlotDetails.hour} - {selectedSlotDetails.end_hour} • {selectedSlotDetails.courtName}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Data: {currentDate}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Cliente Titular:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{selectedSlotDetails.customer_name}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Tipo de Reserva:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedSlotDetails.booking_type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Valor Cobrado:</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-bold">R$ {Number(selectedSlotDetails.total_amount || 0).toFixed(2)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Status do Pagamento:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">PAGO (PIX)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setSelectedSlotDetails(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold text-xs transition"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESERVA RÁPIDA DE BALCÃO (Esmeralda) */}
      {quickBookingSlot && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleQuickBookingSubmit}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Reserva de Balcão / Bloqueio</h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickBookingSlot(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Horário Disponível</span>
                <p className="text-sm font-black">{quickBookingSlot.hour} às {quickBookingSlot.end_hour}</p>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">{quickBookingSlot.courtName} • {currentDate}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Cliente / Time Balcão *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Turma do Zé, Rogério Santos..."
                  value={customerNameInput}
                  onChange={(e) => setCustomerNameInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setQuickBookingSlot(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 transition"
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
