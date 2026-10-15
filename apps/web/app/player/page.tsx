"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  MapPin,
  Trophy,
  User as UserIcon,
  LogOut,
  LogIn,
  XCircle,
  PlusCircle,
  ArrowRight,
  ExternalLink,
  Receipt
} from "lucide-react";
import { api, Booking, getStoredUser, clearStoredToken } from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

function PlayerPortalContent() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ role: string; name: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Carregar usuário e reservas
  const loadUserData = async () => {
    setLoading(true);
    const user = getStoredUser();
    setCurrentUser(user);

    if (user) {
      try {
        const data = await api.getMyBookings();
        setBookings(data);
      } catch (err: any) {
        console.error("Erro ao carregar reservas:", err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // Logout
  const handleLogout = () => {
    clearStoredToken();
    setCurrentUser(null);
    setBookings([]);
  };

  // Cancelar reserva
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Tem certeza que deseja cancelar esta reserva? O valor será estornado conforme as regras.")) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await api.cancelBooking(bookingId);
      setMessage("Reserva cancelada com sucesso!");
      setTimeout(() => setMessage(null), 4000);
      await loadUserData();
    } catch (err: any) {
      alert(`Erro ao cancelar: ${err.message}`);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] flex flex-col selection:bg-emerald-600 selection:text-white pb-24 transition-colors duration-200">
      {/* Conteúdo Principal */}
      <main className="max-w-5xl w-full mx-auto px-4 py-8 flex-1">
        
        {/* Banner exclusivo para Gestores/Admins navegando na visão de atleta */}
        {(currentUser?.role === "MANAGER" || currentUser?.role === "SUPERADMIN") && (
          <div className="mb-6 p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Você está conectado com perfil de <strong>{currentUser.role === "SUPERADMIN" ? "Super Admin" : "Gestor"}</strong> navegando na visão de cliente.</span>
            </div>
            <Link
              href={currentUser.role === "SUPERADMIN" ? "/admin" : "/manager"}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition text-center shrink-0"
            >
              Voltar ao Painel Administrativo
            </Link>
          </div>
        )}

        {/* Banner de Boas-vindas / Estatísticas */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-[#ff7043]" />
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-[#ff7043]/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-black shrink-0">
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : <UserIcon className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-sports-gradient">
                  {currentUser ? `Olá, ${currentUser.name}` : "Portal do Jogador ArenaGo"}
                </h1>
                {currentUser && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                    Ativo
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {currentUser 
                  ? "Gerencie suas partidas agendadas, consulte comprovantes e faça novas reservas."
                  : "Acesse sua conta para visualizar suas partidas e reservar horários em poucos cliques."}
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="btn-coral-gradient font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Agendar Nova Partida</span>
          </Link>
        </div>

        {/* Notificação de sucesso */}
        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Caso o Jogador NÃO esteja autenticado */}
        {!currentUser ? (
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center max-w-md mx-auto transition-colors relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-[#ff7043]" />
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Acesse sua Conta de Jogador</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Para conferir o histórico de agendamentos e sincronização em tempo real, entre com sua conta:
            </p>

            <div>
              <Link
                href="/login?redirect=/player"
                className="w-full btn-coral-gradient font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition block text-center"
              >
                Entrar com Google ou E-mail
              </Link>
            </div>
          </div>
        ) : (
          /* Lista de Reservas do Jogador */
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Minhas Reservas ({bookings.length})</span>
              </h2>
            </div>

            {loading ? (
              <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Carregando suas partidas...
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-700 dark:text-slate-300 font-bold">Você ainda não possui partidas agendadas.</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-4">Escolha uma arena no marketplace e garanta seu horário!</p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition shadow-sm"
                >
                  Explorar Centros Esportivos
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const startDate = new Date(booking.start_time);
                  const endDate = new Date(booking.end_time);

                  const dateFormatted = startDate.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                  });

                  const timeFormatted = `${String(startDate.getHours()).padStart(2, "0")}:00 às ${String(endDate.getHours()).padStart(2, "0")}:00`;

                  const isCancelled = booking.status === "CANCELLED";
                  const isPaid = booking.payment_status === "PAID" || booking.status === "CONFIRMED";
                  const isPendingPayment = (booking.status === "PENDING" || booking.payment_status === "PENDING") && !isCancelled;
                  const isExpired = booking.status === "EXPIRED" || booking.payment_status === "EXPIRED";
                  const isRefunded = booking.payment_status === "REFUNDED";

                  return (
                    <div
                      key={booking.id}
                      className={`bg-white dark:bg-[#0F172A] rounded-2xl border p-5 transition-all shadow-xs ${
                        isCancelled || isExpired ? "border-slate-200 dark:border-slate-800 opacity-60" : "border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {isPaid && (
                              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                                Confirmado • Pago
                              </span>
                            )}
                            {isPendingPayment && (
                              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Aguardando Pagamento
                              </span>
                            )}
                            {isExpired && (
                              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                Tempo Expirado
                              </span>
                            )}
                            {isRefunded && (
                              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300">
                                Estornado
                              </span>
                            )}
                            {isCancelled && !isExpired && (
                              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300">
                                Cancelado
                              </span>
                            )}

                            <span className="text-[10px] font-bold text-slate-400 font-mono">
                              #{booking.id.substring(0, 8).toUpperCase()}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {timeFormatted}
                          </h3>

                          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                            {dateFormatted}
                          </p>

                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            {isPaid ? "Pago via Mercado Pago" : isPendingPayment ? "Cobrança Pix/Cartão gerada" : "Valor"}: R$ {Number(booking.total_amount).toFixed(2).replace(".", ",")}
                          </p>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center gap-2">
                          {isPendingPayment && (
                            <Link
                              href="/checkout"
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
                            >
                              Concluir Pix
                            </Link>
                          )}
                          {!isCancelled && !isExpired && (
                            <button
                              type="button"
                              disabled={cancellingId === booking.id}
                              onClick={() => handleCancelBooking(booking.id)}
                              className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold transition cursor-pointer"
                            >
                              {cancellingId === booking.id ? "Cancelando..." : "Cancelar Partida"}
                            </button>
                          )}

                          <Link
                            href="/schedule?venue=arena-show"
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                          >
                            Ver Agenda
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Botão flutuante de WhatsApp geral da plataforma */}
      <FloatingWhatsApp />
    </div>
  );
}

export default function PlayerPortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PlayerPortalContent />
    </Suspense>
  );
}
