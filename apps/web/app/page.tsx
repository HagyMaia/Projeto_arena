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
  ChevronUp,
  Calendar, 
  Sparkles, 
  MessageCircle, 
  HelpCircle, 
  CheckCircle2, 
  Trophy, 
  Filter, 
  ArrowRight, 
  Activity, 
  Phone,
  ShieldCheck,
  Smartphone,
  Play,
  Apple,
  Users,
  CreditCard,
  Zap,
  Clock,
  Compass,
  Shuffle,
  Check,
  ExternalLink,
  Plus,
  LayoutDashboard
} from "lucide-react";
import { api, Venue, getStoredUser } from "@/lib/api";
import { getOfficialSupportWhatsAppUrl, OFFICIAL_SUPPORT_PHONE_RAW } from "@/lib/utils";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { MobileAppGallery } from "@/components/MobileAppGallery";

// Svg Icons matching the reference site screenshot
function PixDiamondIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`${className} rounded-2xl bg-teal-500/15 border border-teal-500/30 flex flex-col items-center justify-center p-2 shadow-inner shrink-0 group-hover:scale-105 transition-transform`}>
      <svg viewBox="0 0 48 48" className="w-6 h-6 text-teal-400" fill="currentColor">
        <path d="M11.6 15.6L24 3.2l12.4 12.4-5.2 5.2L24 13.6l-7.2 7.2-5.2-5.2zm24.8 16.8L24 44.8 11.6 32.4l5.2-5.2 7.2 7.2 7.2-7.2 5.2 5.2zM3.2 24l12.4-12.4 5.2 5.2L13.6 24l7.2 7.2-5.2 5.2L3.2 24zm41.6 0l-12.4 12.4-5.2-5.2 7.2-7.2-7.2-7.2 5.2-5.2L44.8 24z" />
      </svg>
      <span className="text-[9px] font-black tracking-wider text-teal-300 uppercase mt-0.5">pix</span>
    </div>
  );
}

function TacticalPitchIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`${className} rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center p-2 shadow-inner shrink-0 group-hover:scale-105 transition-transform`}>
      <svg viewBox="0 0 64 48" className="w-8 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="60" height="44" rx="4" className="stroke-emerald-400/80 fill-emerald-950/50" />
        <line x1="32" y1="2" x2="32" y2="46" />
        <circle cx="32" cy="24" r="7" />
        <rect x="2" y="13" width="9" height="22" />
        <rect x="53" y="13" width="9" height="22" />
        <circle cx="16" cy="15" r="2.5" className="fill-amber-400 stroke-none" />
        <circle cx="16" cy="33" r="2.5" className="fill-amber-400 stroke-none" />
        <circle cx="24" cy="24" r="2.5" className="fill-amber-400 stroke-none" />
        <circle cx="48" cy="15" r="2.5" className="fill-blue-400 stroke-none" />
        <circle cx="48" cy="33" r="2.5" className="fill-blue-400 stroke-none" />
        <circle cx="40" cy="24" r="2.5" className="fill-blue-400 stroke-none" />
      </svg>
    </div>
  );
}

function MatchDrawIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`${className} rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center p-2 shadow-inner shrink-0 group-hover:scale-105 transition-transform`}>
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-[9px] font-black text-slate-950 border border-amber-200 shadow-xs">
          A
        </div>
        <span className="text-[10px] font-black text-[#ff7043] tracking-tighter bg-orange-950/90 px-1 py-0.5 rounded border border-orange-500/40">
          VS
        </span>
        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[9px] font-black text-white border border-blue-300 shadow-xs">
          B
        </div>
      </div>
    </div>
  );
}

export default function MarketplaceHomePage() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("Todas as Cidades");
  const [selectedSport, setSelectedSport] = useState<string>("TODOS");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ role: string; name: string } | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    setCurrentUser(getStoredUser());
    async function loadVenues() {
      try {
        setLoading(true);
        const data = await api.getVenues();
        if (data && data.length > 0) {
          setVenues(data);
        }
      } catch (err) {
        console.error("Erro ao carregar arenas:", err);
      } finally {
        setLoading(false);
      }
    }
    loadVenues();
  }, []);

  const cities = useMemo(() => {
    const list = new Set<string>();
    venues.forEach((v) => {
      if (v.city && v.state) list.add(`${v.city}/${v.state}`);
      else if (v.city) list.add(v.city);
    });
    return ["Todas as Cidades", ...Array.from(list)];
  }, [venues]);

  // Filtro de arenas em tempo real por cidade, esporte e texto
  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      if (selectedCity !== "Todas as Cidades") {
        const cityPrefix = selectedCity.split("/")[0].toLowerCase();
        if (!v.city.toLowerCase().includes(cityPrefix)) {
          return false;
        }
      }
      if (selectedSport !== "TODOS") {
        const hasSport = (v.courts || []).some((c) =>
          c.sport_type.toLowerCase().includes(selectedSport.toLowerCase())
        );
        if (!hasSport) return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = v.name.toLowerCase().includes(term);
        const matchesDesc = (v.description || "").toLowerCase().includes(term);
        const matchesAddress = (v.address || "").toLowerCase().includes(term);
        const matchesCourt = (v.courts || []).some(
          (c) => c.name.toLowerCase().includes(term) || c.sport_type.toLowerCase().includes(term)
        );
        if (!matchesName && !matchesDesc && !matchesAddress && !matchesCourt) {
          return false;
        }
      }
      return true;
    });
  }, [venues, selectedCity, selectedSport, searchTerm]);

  const sportsOptions = [
    { label: "Todos os Esportes", value: "TODOS" },
    { label: "Beach Tennis", value: "BEACH" },
    { label: "Futebol Society", value: "FUTEBOL" },
    { label: "Futevôlei", value: "FUTEVOLEI" },
    { label: "Vôlei", value: "VOLEI" },
    { label: "Futsal", value: "FUTSAL" },
  ];

  // Deixado sem depoimentos por solicitação do usuário (ainda não há depoimentos reais cadastrados)
  const testimonials: { name: string; role: string; text: string; stars: number; avatar: string }[] = [];

  const faqItems = [
    {
      q: "Preciso pagar algo para usar a plataforma?",
      a: "Não! O ArenaGo é 100% gratuito para navegação e busca de horários. Você só paga pelo valor da locação da quadra escolhida, com desconto direto e sem taxas escondidas."
    },
    {
      q: "Preciso criar conta para consultar horários das quadras?",
      a: "Não é necessário criar conta para explorar os complexos esportivos, fotos e grade de horários livres em tempo real. Apenas quando for concluir seu agendamento solicitamos seu login ou cadastro rápido."
    },
    {
      q: "Após solicitar um horário, quanto tempo leva para confirmar?",
      a: "Se o pagamento for via PIX ou Cartão de Crédito, o horário é confirmado e travado no sistema imediatamente, com proteção nativa contra reservas duplicadas."
    },
    {
      q: "Sou Gestor de Arena, como posso cadastrar meu complexo?",
      a: "Temos uma área exclusiva para proprietários e gestores! Basta acessar nosso ambiente administrativo para cadastrar quadras, fotos, valores personalizados e gerenciar sua timeline operacional diária."
    }
  ];

  const officialSupportUrl = getOfficialSupportWhatsAppUrl();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 flex flex-col relative selection:bg-emerald-500 selection:text-white transition-colors">

      {/* =========================================================================
          1. HERO HEADER (Conheça as quadras disponíveis na sua cidade!)
          Estilo vibrante com barra de busca inteligente e chamada esportiva
         ========================================================================= */}
      <section className="relative bg-gradient-to-br from-[#0F172A] via-[#122238] to-[#0A101D] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800">
        
        {/* Glow de fundo esportivo */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ff7043]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Lado Esquerdo: Textos & Busca */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-emerald-300 border border-white/10 mb-4 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#ff7043]" />
                <span>O Melhor Portal para Agendamento de Quadras Esportivas</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-4">
                Conheça as quadras<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-[#ff7043]">
                  disponíveis na sua cidade!
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Pela sua localização você encontra a melhor quadra para jogar Beach Tennis, Futebol Society, Futevôlei ou Vôlei com horários livres atualizados em tempo real.
              </p>

              {/* Caixa de Busca Principal */}
              <div className="bg-white/10 dark:bg-slate-900/80 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-white/15 dark:border-slate-800 shadow-2xl max-w-xl mx-auto lg:mx-0">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  
                  {/* Seletor de Cidade */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                      className="w-full sm:w-auto h-12 px-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-between gap-2 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="truncate max-w-[130px]">{selectedCity}</span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>

                    {cityDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95">
                        <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">
                          Cidades Atendidas
                        </div>
                        {cities.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => {
                              setSelectedCity(city);
                              setCityDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-slate-800 transition ${
                              selectedCity === city
                                ? "text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/80 dark:bg-emerald-950/40"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <span>{city}</span>
                            {selectedCity === city && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Input de Pesquisa por Nome/Endereço */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Nome da arena, bairro ou esporte..."
                      className="w-full h-12 pl-10 pr-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm font-medium border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-none transition shadow-inner"
                    />
                  </div>

                  {/* Botão de Ação */}
                  <a
                    href="#arenas"
                    className="h-12 px-6 rounded-2xl bg-[#ff7043] hover:bg-[#f4511e] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition hover:scale-102 shrink-0 cursor-pointer"
                  >
                    <span>Buscar</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                {/* Tags de Esportes Rápidos */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-white/10 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">Filtro rápido:</span>
                  {sportsOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedSport(opt.value)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                        selectedSport === opt.value
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "bg-white/5 text-slate-300 hover:bg-white/15"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Métricas de Credibilidade */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">100%</div>
                  <div className="text-[11px] text-slate-400">Grade em Tempo Real</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#ff7043]">Pix & Card</div>
                  <div className="text-[11px] text-slate-400">Confirmação Imediata</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">Zero</div>
                  <div className="text-[11px] text-slate-400">Risco de Overbooking</div>
                </div>
              </div>
            </div>

            {/* Lado Direito: Ilustração / Mockup de Ação do App */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="relative w-full max-w-sm">
                
                {/* Cartão de Visualização Rápida de Arena */}
                <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 rounded-3xl p-5 border border-slate-700/80 shadow-2xl backdrop-blur-md relative z-10 transform hover:-translate-y-1 transition duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Disponibilidade Ao Vivo</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Hoje
                    </span>
                  </div>

                  {/* Foto de Destaque da Quadra */}
                  <div className="h-44 rounded-2xl overflow-hidden relative mb-4 border border-slate-700">
                    <img 
                      src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80" 
                      alt="Beach Tennis Arena" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                      <div>
                        <span className="px-2 py-0.5 rounded-md bg-[#ff7043] text-white text-[10px] font-black uppercase">
                          Beach Tennis & Society
                        </span>
                        <h4 className="text-white font-extrabold text-sm mt-0.5">Beach Arena Itaim</h4>
                      </div>
                    </div>
                  </div>

                  {/* Horários livres para simulação */}
                  <div className="space-y-2">
                    <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                      <span>Próximos horários disponíveis:</span>
                      <span className="text-emerald-400 font-bold">A partir de R$ 100/h</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-center text-xs font-bold text-emerald-300">
                        18:00
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-center text-xs font-bold text-emerald-300">
                        19:00
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-center text-xs font-bold text-emerald-300">
                        20:00
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/schedule"
                    className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <span>Ver Grade Completa</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Badge Flutuante Esportivo */}
                <div className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 z-20 animate-bounce duration-1000">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#ff7043] flex items-center justify-center font-black">
                    ⚽
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">+1.200 Partidas</div>
                    <div className="text-[10px] text-slate-500">Agendadas este mês</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          2. SEÇÃO PASSO A PASSO (FÁCIL E RÁPIDO PARA AGENDAR)
          Seguindo à risca a estrutura de 3 passos do site de referência
         ========================================================================= */}
      <section id="passos" className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto text-center">
          
          <div className="mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#ff7043] block mb-1">
              PASSO A PASSO
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              FÁCIL E RÁPIDO PARA AGENDAR
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
              Em menos de 1 minuto você garante o horário da sua turma na quadra oficial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Passo 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-[#ff7043]/15 text-[#ff7043] flex items-center justify-center text-3xl font-black mb-6 group-hover:scale-110 transition-transform">
                1
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-md flex items-center justify-center text-emerald-500 mb-4 border border-slate-200 dark:border-slate-700">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                Encontre a Quadra
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Pela sua localização você encontra a melhor quadra da cidade para agendar a partida!
              </p>
            </div>

            {/* Passo 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-3xl font-black mb-6 group-hover:scale-110 transition-transform">
                2
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-md flex items-center justify-center text-[#ff7043] mb-4 border border-slate-200 dark:border-slate-700">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                Escolha o Horário
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Cada quadra possui sua agenda completa, basta escolher o dia e horário que você preferir!
              </p>
            </div>

            {/* Passo 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center text-3xl font-black mb-6 group-hover:scale-110 transition-transform">
                3
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-md flex items-center justify-center text-amber-500 mb-4 border border-slate-200 dark:border-slate-700">
                <Trophy className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                Agende e Aproveite!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Fácil e rápido né!? Agora é partir para o aquecimento e dar um show na partida!
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          3. BANNER CONHEÇA O GESTOR (Seção Gestores de Quadra)
         ========================================================================= */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-[#ff7043]">ÁREA DO GESTOR DE ARENA</span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Possui uma Quadra Esportiva? Temos a Solução Ideal para Você!
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                Automatize a grade operacional, acabe com conflitos de horários no WhatsApp e receba pagamentos via Pix direto na sua conta.
              </p>
            </div>
          </div>

          <Link
            href="/login?portal=admin&redirect=/manager"
            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-[#ff7043] font-black text-xs sm:text-sm shadow-xl transition-all shrink-0 hover:scale-105 active:scale-95"
          >
            Conheça o Gestor ArenaGo
          </Link>
        </div>
      </section>


      {/* =========================================================================
          4. NOVIDADES: O QUE TEM DE NOVO NO ARENAGO
          EXATAMENTE CONFORME A CAPTURA DE TELA ENVIADA PELO USUÁRIO!
          Fundo escuro com marca d'água de ícones de esporte, títulos em coral/laranja,
          três itens ilustrados (Pagamento Online, Organização de Partida, Sorteio dos Times)
          e mockup 3D de smartphone com atletas e botão flutuante coral (+)!
         ========================================================================= */}
      <section 
        id="novidades" 
        className="relative py-20 px-4 sm:px-6 lg:px-8 text-white overflow-hidden border-b border-slate-800"
        style={{
          backgroundColor: "#161B22",
          backgroundImage: `radial-gradient(circle at 10% 20%, rgba(255, 112, 67, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(5, 150, 105, 0.08) 0%, transparent 40%), url("data:image/svg+xml,%3Csvg width='70' height='70' viewBox='0 0 70 70' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'%3E%3Cpath d='M15 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-1a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm40 40a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-1a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM50 14h-3v-2a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v2h-3a2 2 0 0 0-2 2v3a5 5 0 0 0 4 4.9V26h-2a2 2 0 0 0 0 3h8a2 2 0 0 0 0-3h-2v-2.1a5 5 0 0 0 4-4.9v-3a2 2 0 0 0-2-2zm-2 5a3 3 0 0 1-3 3 3 3 0 0 1-3-3v-3h6v3zM14 50h3v2a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-2h3a2 2 0 0 0 2-2v-3a5 5 0 0 0-4-4.9V38h2a2 2 0 0 0 0-3h-8a2 2 0 0 0 0 3h2v2.1a5 5 0 0 0-4 4.9v3a2 2 0 0 0 2 2zm2-5a3 3 0 0 1 3-3 3 3 0 0 1 3 3v3h-6v-3z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "cover, cover, 60px 60px"
        }}
      >
        <div className="max-w-6xl mx-auto">
          
          {/* Cabeçalho de Título da Seção */}
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
              NOVIDADES
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#ff7043]">
              O QUE TEM DE NOVO NO ARENAGO
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Coluna Esquerda: As 3 Funcionalidades Chave */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Item 1: Pagamento Online (PIX / Cartão) */}
              <div className="flex items-start gap-5 group">
                <PixDiamondIcon className="w-14 h-14" />
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#ff7043] group-hover:text-orange-400 transition-colors">
                    Pagamento Online
                  </h3>
                  <p className="text-sm font-semibold text-white mt-1">
                    A praticidade tão pedida chegou!
                  </p>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Pague seu horário com PIX ou Cartão de Crédito com conciliação automática.
                  </p>
                </div>
              </div>

              {/* Linha Divisória Sutil */}
              <div className="border-t border-slate-700/60" />

              {/* Item 2: Organização de Partida */}
              <div className="flex items-start gap-5 group">
                <TacticalPitchIcon className="w-14 h-14" />
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#ff7043] group-hover:text-orange-400 transition-colors">
                    Organização de Partida
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                    Convide seus amigos para participarem da partida!
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Compartilhe o link do jogo pelo WhatsApp e acompanhe quem já confirmou presença.
                  </p>
                </div>
              </div>

              {/* Linha Divisória Sutil */}
              <div className="border-t border-slate-700/60" />

              {/* Item 3: Sorteio dos Times */}
              <div className="flex items-start gap-5 group">
                <MatchDrawIcon className="w-14 h-14" />
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#ff7043] group-hover:text-orange-400 transition-colors">
                    Sorteio dos Times
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                    Chega de perder tempo da partida para escolher o time, o ArenaGo faz isso para você! 😉
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Equilíbrio automático por posições ou sorteio randômico em 1 clique.
                  </p>
                </div>
              </div>

            </div>

            {/* Coluna Direita: Mockup do Smartphone 3D com atletas saindo da tela */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="relative w-full max-w-[320px] sm:max-w-[360px]">
                
                {/* Glow circular de destaque coral atrás do telefone */}
                <div className="absolute inset-0 bg-[#ff7043]/20 rounded-full blur-3xl transform scale-110 pointer-events-none" />

                {/* Corpo do Celular estilo 3D */}
                <div className="relative rounded-[40px] p-3.5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-4 border-slate-600/70 shadow-2xl overflow-visible">
                  
                  {/* Notch superior do smartphone */}
                  <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
                    <div className="w-8 h-1 bg-slate-700 rounded-full" />
                  </div>

                  {/* Tela interna com a interface do ArenaGo */}
                  <div className="rounded-[30px] overflow-hidden bg-gradient-to-b from-[#ff7043] via-[#ff5722] to-slate-900 p-4 min-h-[460px] flex flex-col justify-between relative shadow-inner">
                    
                    {/* Topo da Tela do App */}
                    <div className="flex items-center justify-between text-white text-xs font-bold pb-2 border-b border-white/20">
                      <span>ArenaGo App</span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Partida 19h</span>
                    </div>

                    {/* Composição Atlética Dinâmica (Atletas 'Saindo' da Tela) */}
                    <div className="relative my-4 flex-1 flex flex-col items-center justify-center">
                      
                      {/* Atleta de Futebol / Society */}
                      <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/80 shadow-2xl relative z-10">
                        <img 
                          src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80" 
                          alt="Atleta em Ação ArenaGo"
                          className="w-full h-full object-cover transform scale-110 hover:scale-125 transition duration-500"
                        />
                      </div>

                      {/* Bola de Futebol Flutuante 3D (Canto superior esquerdo) */}
                      <div className="absolute -top-3 -left-2 w-12 h-12 rounded-full bg-white text-2xl flex items-center justify-center shadow-2xl border-2 border-slate-200 animate-bounce duration-1000 z-20">
                        ⚽
                      </div>

                      {/* Bola de Basquete Flutuante (Canto superior direito) */}
                      <div className="absolute top-8 -right-3 w-10 h-10 rounded-full bg-orange-500 text-xl flex items-center justify-center shadow-xl border-2 border-orange-300 z-20">
                        🏀
                      </div>

                      {/* Bola de Vôlei / Beach Tennis Flutuante */}
                      <div className="absolute bottom-6 -left-3 w-9 h-9 rounded-full bg-amber-400 text-lg flex items-center justify-center shadow-lg border-2 border-amber-200 z-20">
                        🏐
                      </div>

                      {/* Botão Flutuante 3D Coral com Sinal '+' (Exatamente como no print!) */}
                      <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-3xl bg-[#ff7043] text-white flex items-center justify-center text-3xl font-black shadow-2xl shadow-orange-600/80 border-4 border-white z-30 transform hover:scale-110 active:scale-95 transition cursor-pointer">
                        <Plus className="w-9 h-9 stroke-[3]" />
                      </div>
                    </div>

                    {/* Rodapé da tela do app */}
                    <div className="bg-slate-900/90 rounded-2xl p-2.5 text-center text-[11px] text-white font-bold backdrop-blur-sm border border-white/10">
                      Quadra Reservada • Confirmação Instantânea
                    </div>

                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          GALERIA: CONHEÇA O APP ARENAGO (Display Triplo de Smartphones com Movimento)
          Fiel à captura de tela enviada pelo usuário com os 3 celulares e movimentos
         ========================================================================= */}
      <MobileAppGallery />


      {/* =========================================================================
          5. FAIXA BAIXE O APP GRÁTIS! (Cor Laranja / Coral Vibrante)
          Fiel ao layout do aplicativo de referência com badges das lojas
         ========================================================================= */}
      <section className="bg-gradient-to-r from-[#ff7043] via-[#ff5722] to-[#ff7043] text-white py-10 px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          <div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-white">
              BAIXE O APP GRÁTIS!
            </h3>
            <p className="text-xs sm:text-sm text-orange-100 mt-1 max-w-md">
              Disponível para Android, iOS ou acesse direto pelo navegador sem instalar nada com tecnologia PWA.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            
            {/* Google Play Button */}
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 hover:bg-black text-white text-xs font-bold border border-white/20 shadow-md transition hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block leading-none">Disponível no</span>
                <span className="text-xs font-black">Google Play</span>
              </div>
            </a>

            {/* App Store Button */}
            <a
              href="https://apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 hover:bg-black text-white text-xs font-bold border border-white/20 shadow-md transition hover:scale-105"
            >
              <Apple className="w-4 h-4 fill-white text-white" />
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block leading-none">Baixar na</span>
                <span className="text-xs font-black">App Store</span>
              </div>
            </a>

            {/* Acessar Web App Direto */}
            <a
              href="#arenas"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-[#ff7043] text-xs font-black shadow-md hover:bg-orange-50 transition hover:scale-105"
            >
              <Smartphone className="w-4 h-4" />
              <span>Usar no Navegador</span>
            </a>

          </div>

        </div>
      </section>


      {/* =========================================================================
          6. SEÇÃO CENTROS ESPORTIVOS (MARKETPLACE E BUSCA INTERATIVA)
          Grade completa de complexos com filtros, fotos reais e agendamento
         ========================================================================= */}
      <section id="arenas" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Cabeçalho da Seção de Arenas */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
              COMPLEXOS CREDENCIADOS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Centros Esportivos com Horários Abertos
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filteredVenues.length} {filteredVenues.length === 1 ? "arena disponível" : "arenas disponíveis"} para reserva imediata.
            </p>
          </div>

          {/* Seletor rápido de cidade */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filtrando por:</span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {selectedCity}
            </span>
          </div>
        </div>

        {/* Grade de Arenas */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Carregando centros esportivos credenciados...
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/50 text-[#ff7043] flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Nenhuma arena encontrada com estes filtros.
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Tente selecionar &quot;Todas as Cidades&quot; ou limpar o termo digitado.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCity("Todas as Cidades");
                setSelectedSport("TODOS");
                setSearchTerm("");
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition cursor-pointer"
            >
              Limpar Todos os Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => {
              const courtCount = venue.courts ? venue.courts.length : 0;
              const minPrice = venue.courts && venue.courts.length > 0
                ? Math.min(...venue.courts.map(c => Number(c.default_hourly_rate)))
                : null;

              return (
                <div
                  key={venue.id}
                  className="bg-white dark:bg-[#0F172A] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col group"
                >
                  {/* Foto de Capa da Arena */}
                  <div className="h-48 w-full bg-slate-900 relative overflow-hidden">
                    {venue.cover_image_url ? (
                      <img 
                        src={venue.cover_image_url} 
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-900 to-slate-800">
                        <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">ARENA OFICIAL</span>
                        <span className="text-lg font-black text-white uppercase mt-1">{venue.name}</span>
                      </div>
                    )}

                    {/* Badges sobre a foto */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold border border-white/20 flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>5.0</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold">
                        Verificada
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3">
                      <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-300 text-xs font-black border border-emerald-500/30">
                        {courtCount} {courtCount === 1 ? "quadra" : "quadras"}
                      </span>
                    </div>
                  </div>

                  {/* Detalhes da Arena */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-[#ff7043] shrink-0" />
                        <span className="truncate">{venue.city}, {venue.state}</span>
                      </div>

                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {venue.name}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                        {venue.description || `${venue.address}, ${venue.city} - ${venue.state}`}
                      </p>

                      {/* Modalidades das Quadras */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(venue.courts || []).slice(0, 3).map((court, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {court.sport_type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Preço e Botão de Agendamento */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Tarifa Base
                        </span>
                        <div className="text-base font-black text-slate-900 dark:text-white">
                          {minPrice ? `R$ ${minPrice.toFixed(0)}/h` : "Sob Consulta"}
                        </div>
                      </div>

                      <Link
                        href={`/schedule?venue=${venue.slug || venue.id}`}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all hover:scale-102"
                      >
                        <span>Ver Horários</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>


      {/* =========================================================================
          7. SEÇÃO DEPOIMENTOS
          Deixado sem depoimentos por solicitação do usuário (ainda não há depoimentos reais)
         ========================================================================= */}
      <section id="depoimentos" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100 dark:bg-[#0D1527] border-t border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="mb-8">
            <span className="text-xs font-black uppercase tracking-widest text-[#ff7043] block mb-1">
              DEPOIMENTOS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              O QUE FALAM DO ARENAGO
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-lg mx-auto">
              Avaliações autênticas da nossa comunidade de atletas e gestores parceiros.
            </p>
          </div>

          {/* Estado sem depoimentos cadastrados */}
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0F172A] border border-dashed border-slate-300 dark:border-slate-800 shadow-xs max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <Star className="w-7 h-7 fill-emerald-500/20" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Ainda não temos depoimentos publicados
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Estamos colhendo os primeiros relatos reais de atletas e arenas. Agende sua partida e seja um dos primeiros a avaliar sua experiência!
            </p>
            <div className="mt-6">
              <Link
                href="/schedule"
                className="btn-coral-gradient inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition hover:scale-105 active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar Minha Primeira Partida</span>
              </Link>
            </div>
          </div>

        </div>
      </section>


      {/* =========================================================================
          8. SEÇÃO FAQ (PERGUNTAS FREQUENTES)
          Perguntas diretas sobre pagamento, criação de conta e gestores
         ========================================================================= */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            PERGUNTAS FREQUENTES
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tire suas principais dúvidas sobre o funcionamento do ArenaGo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqItems.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full text-left flex items-start justify-between gap-3 font-bold text-slate-900 dark:text-white text-xs sm:text-sm cursor-pointer"
                >
                  <span>&ldquo;{item.q}&rdquo;</span>
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500">
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {isOpen && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 leading-relaxed animate-in fade-in duration-200">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>


      {/* =========================================================================
          9. CENTRAL DE ATENDIMENTO OFICIAL NO WHATSAPP
         ========================================================================= */}
      <section className="bg-emerald-50/70 dark:bg-emerald-950/20 border-t border-emerald-200 dark:border-emerald-900/60 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Central de Atendimento Oficial ArenaGo
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Dúvidas sobre reservas, comprovantes ou parcerias? Fale pelo WhatsApp ({OFFICIAL_SUPPORT_PHONE_RAW}).
              </p>
            </div>
          </div>

          <a
            href={officialSupportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </section>

      {/* Botão Flutuante de WhatsApp Oficial */}
      <FloatingWhatsApp />

    </div>
  );
}
