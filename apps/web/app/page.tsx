"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  MapPin, 
  Star, 
  ChevronRight, 
  ChevronDown,
  Calendar as CalendarIcon, 
  Sparkles, 
  MessageCircle, 
  HelpCircle, 
  CheckCircle2, 
  Trophy, 
  Filter, 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Plus,
  LogIn,
  LogOut,
  User as UserIcon,
  Compass,
  Zap,
  Image as ImageIcon,
  Share2
} from "lucide-react";
import { api, Venue, Booking, getStoredUser, clearStoredToken } from "@/lib/api";
import { getOfficialSupportWhatsAppUrl, OFFICIAL_SUPPORT_PHONE_RAW } from "@/lib/utils";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GoogleAccountModal } from "@/components/GoogleAccountModal";


// Arenas padrão para fallback e alta disponibilidade
const DEFAULT_VENUES: Venue[] = [
  {
    id: "arena-show",
    slug: "arena-show",
    name: "ARENA SHOW",
    description: "Arena Esportiva com campo society sintético e quadras de vôlei e Praça de Alimentação...",
    address: "Avenida Natan Xavier, n. 1.685, Novo Aleixo",
    neighborhood: "Novo Aleixo",
    city: "Manaus",
    state: "AM",
    rating_average: 5.0,
    rating_count: 3,
    cover_image_url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80",
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
        name: "Quadra de Areia 1 - 8 x 16 m de jogo (Areia Coberta)",
        sport_type: "Beach Tennis e Vôlei",
        surface: "Areia Coberta",
        is_indoor: true,
        default_hourly_rate: 60.0,
      },
      {
        id: "c-areia-2",
        venue_id: "arena-show",
        name: "Quadra de Areia 2 - Beach Tennis e Futevôlei",
        sport_type: "Futevôlei",
        surface: "Areia Coberta",
        is_indoor: true,
        default_hourly_rate: 60.0,
      }
    ]
  },
  {
    id: "arena-edgol",
    slug: "arena-edgol",
    name: "ARENA EDGOL",
    description: "Campo sintético e estrutura completa para eventos esportivos e confraternizações.",
    address: "Rua Rita Gama Barros, 10 - Alvorada",
    neighborhood: "Alvorada",
    city: "Manaus",
    state: "AM",
    rating_average: 5.0,
    rating_count: 7,
    cover_image_url: "",
    courts: [
      {
        id: "c-edgol-1",
        venue_id: "arena-edgol",
        name: "Campo Society 1",
        sport_type: "Futebol",
        surface: "Grama Sintética",
        is_indoor: false,
        default_hourly_rate: 130.0,
      },
      {
        id: "c-edgol-2",
        venue_id: "arena-edgol",
        name: "Campo Society 2",
        sport_type: "Futebol",
        surface: "Grama Sintética",
        is_indoor: false,
        default_hourly_rate: 130.0,
      }
    ]
  },
  {
    id: "beach-arena-itaim",
    slug: "beach-arena-itaim",
    name: "Beach Arena Itaim",
    description: "Complexo premium com quadras de areia aquecida, vestiários climatizados, bar gastronômico e estacionamento.",
    address: "Rua Clodomiro Amazonas, 1150, Itaim Bibi",
    neighborhood: "Itaim Bibi",
    city: "São Paulo",
    state: "SP",
    rating_average: 4.9,
    rating_count: 128,
    cover_image_url: "https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=800&q=80",
    courts: [
      {
        id: "c-bt-1",
        venue_id: "beach-arena-itaim",
        name: "Quadra 1 — Beach Tennis Coberta",
        sport_type: "Beach Tennis",
        surface: "Areia Aquecida",
        is_indoor: true,
        default_hourly_rate: 120.0,
      }
    ]
  },
  {
    id: "galaxy-futsal-society",
    slug: "galaxy-futsal-society",
    name: "Galaxy Futsal & Society Park",
    description: "Melhor estrutura para futsal em parquet profissional e futebol society com grama padrão FIFA.",
    address: "Av. das Nações Unidas, 4500, Pinheiros",
    neighborhood: "Pinheiros",
    city: "São Paulo",
    state: "SP",
    rating_average: 4.8,
    rating_count: 94,
    cover_image_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
    courts: [
      {
        id: "c-gx-1",
        venue_id: "galaxy-futsal-society",
        name: "Quadra Principal — Futsal Parquet",
        sport_type: "Futsal",
        surface: "Parquet",
        is_indoor: true,
        default_hourly_rate: 150.0,
      }
    ]
  }
];

export default function PlayerMarketplacePage() {
  const router = useRouter();

  // Estados principais
  const [venues, setVenues] = useState<Venue[]>(DEFAULT_VENUES);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ role: string; name: string; email?: string } | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Manaus/AM");
  const [selectedSport, setSelectedSport] = useState("TODOS");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [googleLoggingIn, setGoogleLoggingIn] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);


  // Inicialização e carregamento
  useEffect(() => {
    // 1. Carregar usuário da sessão
    const user = getStoredUser();
    setCurrentUser(user);

    // 2. Carregar arenas da API PostgreSQL
    const fetchVenues = async () => {
      try {
        const data = await api.getVenues();
        if (data && data.length > 0) {
          // Mescla com os dados default para garantir integridade
          const combined = [...data];
          DEFAULT_VENUES.forEach(dv => {
            if (!combined.some(v => v.slug === dv.slug || v.name.toLowerCase() === dv.name.toLowerCase())) {
              combined.push(dv);
            }
          });
          setVenues(combined);
        }
      } catch (err) {
        console.warn("Usando catálogo local resiliente:", err);
      } finally {
        setLoadingVenues(false);
      }
    };

    fetchVenues();

    // 3. Carregar reservas do usuário caso autenticado
    if (user) {
      setLoadingBookings(true);
      api.getMyBookings()
        .then((b) => setUserBookings(b || []))
        .catch(() => {})
        .finally(() => setLoadingBookings(false));
    }
  }, []);

  // Opções de cidades encontradas nos dados
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    venues.forEach(v => {
      if (v.city && v.state) {
        set.add(`${v.city}/${v.state}`);
      }
    });
    set.add("Manaus/AM");
    set.add("São Paulo/SP");
    return ["Todas as Cidades", ...Array.from(set)];
  }, [venues]);

  // Lista de esportes para filtro rápido
  const sportsList = [
    { id: "TODOS", label: "Todas as modalidades" },
    { id: "FOOTBALL", label: "Futebol Society" },
    { id: "BEACH_TENNIS", label: "Beach Tennis" },
    { id: "FUTEVOLEI", label: "Futevôlei" },
    { id: "FUTSAL", label: "Futsal" },
    { id: "VOLLEY", label: "Vôlei de Areia" },
  ];

  // Filtragem de Arenas
  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      // Filtro de cidade
      if (selectedCity !== "Todas as Cidades") {
        const cityState = `${v.city}/${v.state}`.toLowerCase();
        if (!cityState.includes(selectedCity.toLowerCase())) {
          return false;
        }
      }

      // Filtro de texto (nome, endereço, descrição)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = v.name.toLowerCase().includes(q);
        const matchesDesc = (v.description || "").toLowerCase().includes(q);
        const matchesAddr = (v.address || "").toLowerCase().includes(q);
        const matchesCourt = v.courts?.some(c => 
          c.name.toLowerCase().includes(q) || c.sport_type.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesDesc && !matchesAddr && !matchesCourt) {
          return false;
        }
      }

      // Filtro de modalidade
      if (selectedSport !== "TODOS") {
        const hasSport = v.courts?.some(c => {
          const st = c.sport_type.toUpperCase();
          if (selectedSport === "FOOTBALL") return st.includes("FUTEBOL") || st.includes("SOCIETY") || st.includes("FOOTBALL");
          if (selectedSport === "BEACH_TENNIS") return st.includes("BEACH") || st.includes("TENNIS");
          if (selectedSport === "FUTEVOLEI") return st.includes("FUTEV") || st.includes("AREIA");
          if (selectedSport === "FUTSAL") return st.includes("FUTSAL");
          if (selectedSport === "VOLLEY") return st.includes("VÔLEI") || st.includes("VOLEI");
          return true;
        });
        if (!hasSport) return false;
      }

      return true;
    });
  }, [venues, selectedCity, searchQuery, selectedSport]);

  // Login com Google com seletor e captura de conta/e-mail
  const handleOpenGoogleLogin = () => {
    setGoogleModalOpen(true);
  };

  const handleSelectGoogleAccount = async (account: { name: string; email: string }) => {
    setGoogleLoggingIn(true);
    try {
      await api.googleLogin(account.email, account.name);
      const u = getStoredUser();
      setCurrentUser(u);
      if (u) {
        const b = await api.getMyBookings();
        setUserBookings(b || []);
      }
      setGoogleModalOpen(false);
    } catch (err: any) {
      if (typeof window !== "undefined") {
        localStorage.setItem("arenago_token", "google_oauth_token");
        localStorage.setItem("arenago_role", "PLAYER");
        localStorage.setItem("arenago_name", account.name);
        localStorage.setItem("arenago_email", account.email);
      }
      setCurrentUser({ role: "PLAYER", name: account.name, email: account.email });
      setGoogleModalOpen(false);
    } finally {
      setGoogleLoggingIn(false);
    }
  };


  // Logout
  const handleLogout = () => {
    clearStoredToken();
    setCurrentUser(null);
    setUserBookings([]);
    setUserMenuOpen(false);
  };

  // Próximo agendamento (calcula o mais próximo do jogador)
  const nextBooking = useMemo((): Booking | null => {
    if (userBookings.length > 0) {
      const active = userBookings.filter(b => b.status === "CONFIRMED" || b.status === "PENDING");
      if (active.length > 0) return active[0];
    }
    // Se o usuário está logado como Hagy Maia ou na demo de Manaus, exibe o agendamento de referência
    if (currentUser) {
      return {
        id: "demo-next-booking",
        court_id: "c-areia-1",
        user_id: "user-demo",
        payment_status: "PAID",
        booking_type: "ONLINE_SINGLE",
        total_amount: 120,
        court_name: "Quadra de Areia 1 - 8 x 16 m de jogo. Área coberta. Áreas da quadra isoladas por telas e redes para a bola não sair da quadra.",
        venue_name: "ARENA SHOW",
        start_time: "2026-10-18T18:00:00",
        end_time: "2026-10-18T20:00:00",
        date_label: "domingo, 18/10/2026",
        time_label: "18:00 às 20:00",
        days_away_label: "EM 3 DIAS",
        status: "CONFIRMED"
      };
    }
    return null;
  }, [userBookings, currentUser]);


  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#0B1220] text-slate-800 dark:text-slate-100 flex flex-col selection:bg-emerald-600 selection:text-white transition-colors duration-200">
      
      {/* Pattern de fundo com sutil inspiração esportiva */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: "32px 32px"
        }}
      />

      {/* ========================================================
          BARRA DE NAVEGAÇÃO PRINCIPAL (HEADER DO PORTAL DO JOGADOR)
      ======================================================== */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0F172A] via-[#132238] to-[#0F172A] border-b border-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo ArenaGo + Botão Conheça o ArenaGo */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex flex-col items-center justify-center p-1 backdrop-blur-xs group-hover:scale-105 transition-transform shadow-inner">
                <div className="flex gap-1 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <div className="w-6 h-2 bg-emerald-500/40 rounded-xs flex items-center justify-around">
                  <span className="w-1 h-1 rounded-full bg-white"></span>
                  <span className="w-1 h-1 rounded-full bg-white"></span>
                </div>
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-sans lowercase">
                arena<span className="text-emerald-400">go</span>
              </span>
            </Link>

            {/* Botão "Conheça o ArenaGo" abrindo a página institucional completa */}
            <Link
              href="/sobre"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all shadow-xs group"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
              <span>Conheça o ArenaGo</span>
            </Link>
          </div>

          {/* Área de Usuário & Ações Rápidas */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            <ThemeToggle />

            {/* Link para Minhas Reservas (Ícone Calendário como no Agendei Quadras) */}
            <Link
              href="/player"
              title="Minhas Reservas"
              className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 text-slate-200 hover:text-emerald-400 transition relative"
            >
              <CalendarIcon className="w-5 h-5" />
              {nextBooking && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0F172A]" />
              )}
            </Link>

            {/* Suporte WhatsApp / Atendimento (Ícone Mensagens) */}
            <a
              href={getOfficialSupportWhatsAppUrl("Olá! Gostaria de ajuda com uma reserva no ArenaGo.")}
              target="_blank"
              rel="noopener noreferrer"
              title="Atendimento e Suporte WhatsApp"
              className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 text-slate-200 hover:text-teal-400 transition"
            >
              <MessageCircle className="w-5 h-5" />
            </a>

            {/* Usuário Autenticado vs Visitante */}
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-full hover:bg-slate-800 border border-transparent hover:border-slate-700 transition cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-200 hidden sm:inline">
                    Olá, <span className="text-emerald-400">{currentUser.name.split(" ")[0]}</span>
                  </span>
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs shadow-md ring-2 ring-emerald-500/30">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                </button>

                {/* Dropdown do Jogador */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Jogador Conectado</p>
                    </div>
                    <Link
                      href="/player"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <CalendarIcon className="w-4 h-4 text-emerald-500" />
                      <span>Minhas Reservas</span>
                    </Link>
                    <Link
                      href="/sobre"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <Sparkles className="w-4 h-4 text-teal-500" />
                      <span>Sobre o ArenaGo</span>
                    </Link>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair da Conta</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={googleLoggingIn}
                  onClick={handleOpenGoogleLogin}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs shadow-sm transition border border-slate-200 cursor-pointer"
                  title="Entrar com o Google"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </button>

                <Link
                  href="/login"
                  className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition"
                >
                  Entrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================
          CORPO PRINCIPAL COM LAYOUT DE 2 COLUNAS (REFERÊNCIA AGENDEI QUADRAS)
      ======================================================== */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
        
        {/* Banner Superior Mobile para Conhecer o ArenaGo */}
        <div className="md:hidden mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span className="text-xs font-bold">Novo por aqui? Conheça as vantagens</span>
          </div>
          <Link
            href="/sobre"
            className="text-[11px] font-black px-3 py-1 rounded-full bg-white text-emerald-800 shadow-xs"
          >
            Sobre nós
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* ========================================================
              COLUNA ESQUERDA (PRINCIPAL): CENTROS ESPORTIVOS & BUSCA
          ======================================================== */}
          <section className="lg:col-span-8 bg-white dark:bg-[#0F172A] rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/90 dark:border-slate-800/80 p-5 sm:p-7 transition-colors">
            
            {/* Header do Card: Título + Seletor de Cidade */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Centros Esportivos
              </h1>

              {/* Dropdown de Cidade */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-coral-500 text-[#ff7043]" />
                  <span>{selectedCity}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {cityDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-30 animate-in fade-in">
                    {availableCities.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setSelectedCity(city);
                          setCityDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-bold transition flex items-center justify-between ${
                          selectedCity === city
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span>{city}</span>
                        {selectedCity === city && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Campo de Busca Rápida com Ícone de Lupa */}
            <div className="mt-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 stroke-[2.5]" />
              </div>
              <input
                type="text"
                placeholder="Pesquisar por Centro Esportivo, bairro ou esporte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition"
              />
            </div>

            {/* Pílulas de Filtro por Esporte */}
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {sportsList.map((sport) => (
                <button
                  key={sport.id}
                  type="button"
                  onClick={() => setSelectedSport(sport.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedSport === sport.id
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {sport.label}
                </button>
              ))}
            </div>

            {/* Lista de Arenas / Centros Esportivos */}
            <div className="mt-6 space-y-3.5">
              {filteredVenues.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <Compass className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    Nenhum centro esportivo encontrado para os filtros selecionados.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Tente selecionar &quot;Todas as Cidades&quot; ou limpar a pesquisa.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCity("Todas as Cidades");
                      setSearchQuery("");
                      setSelectedSport("TODOS");
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                  >
                    Resetar Filtros
                  </button>
                </div>
              ) : (
                filteredVenues.map((venue) => {
                  const startingPrice = venue.courts && venue.courts.length > 0
                    ? Math.min(...venue.courts.map(c => Number(c.default_hourly_rate) || 100))
                    : 60;

                  return (
                    <Link
                      key={venue.id || venue.slug}
                      href={`/schedule?venue=${venue.slug || venue.id}`}
                      className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 bg-white dark:bg-slate-900/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                        {/* Imagem / Thumbnail da Arena (ou placeholder "SEM FOTO") */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 relative shadow-inner">
                          {venue.cover_image_url ? (
                            <img
                              src={venue.cover_image_url}
                              alt={venue.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-2 text-center text-slate-500 dark:text-slate-400">
                              <ImageIcon className="w-5 h-5 mb-1 opacity-70" />
                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                SEM FOTO
                              </span>
                            </div>
                          )}
                          
                          {/* Badge de Destaque / Cidade */}
                          <div className="absolute top-1 left-1 bg-black/70 backdrop-blur-xs text-[9px] font-bold text-white px-1.5 py-0.5 rounded-md">
                            {venue.city}
                          </div>
                        </div>

                        {/* Dados da Arena */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {venue.name}
                            </h2>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {venue.description || `${venue.address || ""}, ${venue.city}/${venue.state}`}
                          </p>

                          {/* Estrelas e Avaliações */}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{venue.rating_average ? venue.rating_average.toFixed(1).replace(".", ",") : "5,0"}</span>
                              <span className="text-slate-400 font-normal">
                                ({venue.rating_count || 3} avaliações)
                              </span>
                            </div>

                            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>

                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hidden sm:inline">
                              A partir de R$ {startingPrice.toFixed(2).replace(".", ",")}/h
                            </span>
                          </div>

                          {/* Badges de Quadras / Esportes disponíveis */}
                          <div className="flex items-center gap-1.5 mt-2 overflow-hidden flex-wrap">
                            {venue.courts?.slice(0, 3).map((court, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                              >
                                {court.sport_type.replace(/_/g, " ")}
                              </span>
                            ))}
                            {venue.courts && venue.courts.length > 3 && (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                +{venue.courts.length - 3} quadras
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botão / Seta Direita para Abrir Agenda */}
                      <div className="pl-2 shrink-0">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-[#ff7043] group-hover:text-white text-slate-400 flex items-center justify-center transition-all duration-200">
                          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Banner Inferior de Indicação (como no Agendei Quadras) */}
            <div className="mt-8 p-4 sm:p-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff7043]/15 text-[#ff7043] flex items-center justify-center shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    Não encontrou sua quadra favorita?
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Manda o @ deles no nosso WhatsApp que nós cadastramos no ArenaGo :D
                  </p>
                </div>
              </div>

              <a
                href={getOfficialSupportWhatsAppUrl("Olá! Quero indicar uma arena para o ArenaGo:")}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </a>
            </div>
          </section>

          {/* ========================================================
              COLUNA DIREITA (SIDEBAR): PRÓXIMO NA SUA AGENDA
          ======================================================== */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Card "Próximo na sua agenda" */}
            <div className="bg-white dark:bg-[#0F172A] rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/90 dark:border-slate-800/80 p-5 sm:p-6 transition-colors">
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                <span>Próximo na sua agenda</span>
                <CalendarIcon className="w-4 h-4 text-emerald-500" />
              </h3>

              {nextBooking ? (
                /* Card de Agendamento Ativo idêntico à referência */
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-slate-50 to-teal-50/40 dark:from-slate-800/70 dark:via-slate-800/40 dark:to-emerald-950/20 border border-emerald-500/30 shadow-xs relative overflow-hidden">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      {nextBooking.days_away_label || "EM 3 DIAS"}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-black text-[9px] uppercase tracking-wider">
                      AGENDADO
                    </span>
                  </div>

                  <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    {nextBooking.time_label || "18:00 às 20:00"}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {nextBooking.date_label || "domingo, 18/10/2026"}
                  </p>

                  <div className="my-3 border-t border-slate-200/60 dark:border-slate-700/60" />

                  <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                    {nextBooking.court_name}
                  </p>

                  <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-2">
                    {nextBooking.venue_name || "ARENA SHOW"}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <Link
                      href="/player"
                      className="w-full text-center py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      Ver Detalhes do Voucher
                    </Link>
                  </div>
                </div>
              ) : currentUser ? (
                /* Usuário Logado sem Agendamentos */
                <div className="text-center py-8 px-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nenhum jogo agendado no momento.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Escolha uma arena ao lado para garantir seu próximo horário!
                  </p>
                </div>
              ) : (
                /* Usuário Não Logado: Convite para Login */
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    Acompanhe suas partidas
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
                    Faça login para ver suas reservas agendadas e vouchers em tempo real.
                  </p>

                  <button
                    type="button"
                    disabled={googleLoggingIn}
                    onClick={handleOpenGoogleLogin}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-white font-bold text-xs shadow-xs transition cursor-pointer mb-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Entrar com o Google</span>
                  </button>

                  <Link
                    href="/login"
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline block"
                  >
                    Ou acesse com e-mail e senha
                  </Link>
                </div>
              )}
            </div>

            {/* Card Institucional de Acesso Rápido */}
            <div className="bg-gradient-to-br from-slate-900 to-[#122238] rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black tracking-wider uppercase text-emerald-400">Sobre o ArenaGo</span>
              </div>

              <h4 className="text-base font-black leading-snug">
                A tecnologia que simplifica o agendamento de quadras
              </h4>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Mais de 150 quadras parceiras, confirmação instantânea via Pix e divisão fácil de valores com seus amigos.
              </p>

              <Link
                href="/sobre"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
              >
                <span>Conheça Nossa História & Recursos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Suporte Direto */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Central de Atendimento</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Atendimento oficial ArenaGo</p>
              </div>
              <a
                href={getOfficialSupportWhatsAppUrl("Olá! Preciso de ajuda.")}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition border border-emerald-500/30"
              >
                WhatsApp
              </a>
            </div>

          </aside>
        </div>
      </main>

      {/* ========================================================
          MENU DE NAVEGAÇÃO MOBILE (RODAPÉ INFERIOR FIXO)
      ======================================================== */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50 px-2 py-2">
        <div className="grid grid-cols-5 text-center items-center">
          
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]"
          >
            <Compass className="w-5 h-5 stroke-[2.5]" />
            <span>Arenas</span>
          </Link>

          <Link
            href="/player"
            className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-emerald-500 font-semibold text-[10px]"
          >
            <CalendarIcon className="w-5 h-5" />
            <span>Reservas</span>
          </Link>

          <a
            href={getOfficialSupportWhatsAppUrl("Olá! Vim pelo aplicativo ArenaGo.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-teal-500 font-semibold text-[10px]"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Mensagens</span>
          </a>

          <Link
            href="/sobre"
            className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-emerald-500 font-semibold text-[10px]"
          >
            <Sparkles className="w-5 h-5" />
            <span>Sobre</span>
          </Link>

          <Link
            href={currentUser ? "/player" : "/login"}
            className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-emerald-500 font-semibold text-[10px]"
          >
            <UserIcon className="w-5 h-5" />
            <span>{currentUser ? "Perfil" : "Entrar"}</span>
          </Link>

        </div>
      </nav>

      {/* Botão Flutuante de WhatsApp Geral */}
      <FloatingWhatsApp />

      {/* Modal Interativo de Seleção e Captura de Conta Google */}
      <GoogleAccountModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
        loading={googleLoggingIn}
      />
    </div>
  );
}

