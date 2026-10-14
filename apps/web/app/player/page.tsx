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

function PlayerPortalContent() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ role: string; name: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

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

  // Login rápido de demonstração como Jogador
  const handleQuickLoginPlayer = async () => {
    setQuickLoginLoading(true);
    try {
      await api.login("jogador@arenago.com.br", "player123");
      await loadUserData();
    } catch (err: any) {
      alert(`Falha no login: ${err.message}`);
    } finally {
      setQuickLoginLoading(false);
    }
  };

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
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-orange-500 selection:text-white pb-24">
      {/* Top Header Laranja estilo Agendei Quadras */}
      <header className="bg-[#EA580C] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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

          <div className="flex items-center gap-4 text-sm">
            <Link 
              href="/" 
              className="text-xs sm:text-sm font-semibold text-white/90 hover:text-white"
            >
              Centros Esportivos
            </Link>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-white text-orange-600 font-extrabold flex items-center justify-center text-sm shadow-sm">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sair"
                  className="text-white/80 hover:text-white p-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-full bg-white text-orange-600 font-bold text-xs shadow-sm hover:bg-orange-50 transition"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-5xl w-full mx-auto px-4 py-8 flex-1">
        
        {/* Banner de Boas-vindas / Estatísticas */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 text-2xl font-black shrink-0">
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : <UserIcon className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {currentUser ? `Olá, ${currentUser.name}` : "Portal do Jogador ArenaGo"}
                </h1>
                {currentUser && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Ativo
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {currentUser 
                  ? "Gerencie suas partidas agendadas, consulte comprovantes e faça novas reservas."
                  : "Acesse sua conta para visualizar suas partidas e reservar horários em poucos cliques."}
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="bg-[#EA580C] hover:bg-orange-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-102 flex items-center justify-center gap-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Agendar Nova Partida</span>
          </Link>
        </div>

        {/* Notificação de sucesso */}
        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Caso o Jogador NÃO esteja autenticado */}
        {!currentUser ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Acesse sua Conta de Jogador</h2>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Para conferir o histórico de agendamentos e sincronização em tempo real, faça login ou use o acesso rápido demonstrativo:
            </p>

            <div className="space-y-3">
              <button
                type="button"
                disabled={quickLoginLoading}
                onClick={handleQuickLoginPlayer}
                className="w-full bg-[#EA580C] hover:bg-orange-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
              >
                {quickLoginLoading ? "Entrando..." : "1-Clique: Entrar como Lucas Ferreira (Jogador Demo)"}
              </button>

              <Link
                href="/login"
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs block transition"
              >
                Fazer Login com Google ou Senha
              </Link>
            </div>
          </div>
        ) : (
          /* Lista de Reservas do Jogador */
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-orange-600" />
                <span>Minhas Reservas ({bookings.length})</span>
              </h2>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Carregando suas partidas...
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
                <p className="text-slate-600 font-bold">Você ainda não possui partidas agendadas.</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">Escolha uma arena no marketplace e garanta seu horário!</p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-xl transition shadow-sm"
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

                  return (
                    <div
                      key={booking.id}
                      className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
                        isCancelled ? "border-slate-200 opacity-60" : "border-slate-200 hover:border-orange-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isCancelled 
                                ? "bg-rose-100 text-rose-700" 
                                : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {isCancelled ? "Cancelado" : "Confirmado"}
                            </span>

                            <span className="text-[10px] font-bold text-slate-400">
                              Reserva #{booking.id.substring(0, 8).toUpperCase()}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900">
                            {timeFormatted}
                          </h3>

                          <p className="text-xs text-slate-500 capitalize">
                            {dateFormatted}
                          </p>

                          <p className="text-xs text-orange-600 font-semibold">
                            Pagamento: {booking.payment_status === "PAID" ? "Pago via PIX/Cartão" : "Pendente"} • R$ {Number(booking.total_amount).toFixed(2).replace(".", ",")}
                          </p>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center gap-2">
                          {!isCancelled && (
                            <button
                              type="button"
                              disabled={cancellingId === booking.id}
                              onClick={() => handleCancelBooking(booking.id)}
                              className="px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition cursor-pointer"
                            >
                              {cancellingId === booking.id ? "Cancelando..." : "Cancelar Partida"}
                            </button>
                          )}

                          <Link
                            href="/schedule?venue=arena-show"
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
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
    </div>
  );
}

export default function PlayerPortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PlayerPortalContent />
    </Suspense>
  );
}
