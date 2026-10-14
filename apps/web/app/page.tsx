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
  Calendar, 
  Sparkles,
  MessageCircle,
  HelpCircle,
  CheckCircle2,
  Trophy,
  Filter,
  ArrowRight,
  Activity
} from "lucide-react";
import { api, Venue, getStoredUser, clearStoredToken } from "@/lib/api";

export default function MarketplacePage() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("Manaus/AM");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"CENTROS" | "TODAS">("CENTROS");
  const [currentUser, setCurrentUser] = useState<{ role: string; name: string } | null>(null);

  // Fallback demo venues if backend is still initializing
  const fallbackVenues: Venue[] = [
    {
      id: "d402f250-1148-4865-bad9-d32a9db37388",
      name: "ARENA SHOW",
      slug: "arena-show",
      description: "Arena Esportiva com campo society sintético e quadras de vôlei e Praça de Alimentação...",
      address: "Avenida Natan Xavier, n. 1.685, Novo Aleixo",
      city: "Manaus",
      state: "AM",
      courts: [
        {
          id: "ca93dedf-cc2b-467c-b92c-c155e70caad2",
          venue_id: "d402f250-1148-4865-bad9-d32a9db37388",
          name: "Campo Rei Pelé - Arena Show - Campo Society 40 x 18 m de jogo.",
          sport_type: "FOOTBALL",
          surface: "Grama Sintética Coberta",
          is_indoor: true,
          default_hourly_rate: 120.0
        },
        {
          id: "b4bad60d-6eb8-4f9e-bac5-beb0df4f4180",
          venue_id: "d402f250-1148-4865-bad9-d32a9db37388",
          name: "Quadra de Areia 1 - 8 x 16 m de jogo.",
          sport_type: "BEACH_TENNIS",
          surface: "Areia Especial Coberta",
          is_indoor: true,
          default_hourly_rate: 60.0
        },
        {
          id: "7b13ce44-a331-4aa3-ab4e-f8e5b8aa2a3e",
          venue_id: "d402f250-1148-4865-bad9-d32a9db37388",
          name: "Quadra de Areia 2 - 8 x 16 m de jogo.",
          sport_type: "VOLLEYBALL",
          surface: "Areia Especial Coberta",
          is_indoor: true,
          default_hourly_rate: 60.0
        }
      ]
    },
    {
      id: "71cc6b7e-12bc-4159-81bb-6546398c2ea7",
      name: "Beach Arena Itaim",
      slug: "beach-arena-itaim",
      description: "Complexo esportivo premium com 3 quadras de areia climatizada, vestiários e bar lounge...",
      address: "Rua Clodomiro Amazonas, 1200",
      city: "São Paulo",
      state: "SP",
      courts: [
        {
          id: "1f303512-708c-425b-8462-0274b29cfa1c",
          venue_id: "71cc6b7e-12bc-4159-81bb-6546398c2ea7",
          name: "Quadra 1 — Beach Tennis Coberta",
          sport_type: "BEACH_TENNIS",
          surface: "Areia Especial Coberta",
          is_indoor: true,
          default_hourly_rate: 120.0
        }
      ]
    },
    {
      id: "57f128e8-79fe-428c-be68-7815618ce134",
      name: "Galaxy Futsal & Society Park",
      slug: "galaxy-futsal-society",
      description: "Centro esportivo de alto rendimento com piso de parquet profissional e grama sintética monofilamento...",
      address: "Av. Giovanni Gronchi, 3500",
      city: "São Paulo",
      state: "SP",
      courts: [
        {
          id: "ba915548-0f3a-46a2-9ada-aaee237eb056",
          venue_id: "57f128e8-79fe-428c-be68-7815618ce134",
          name: "Campo Society 1 — Grama Sintética",
          sport_type: "FOOTBALL",
          surface: "Grama Sintética FIFA Pro",
          is_indoor: true,
          default_hourly_rate: 180.0
        }
      ]
    }
  ];

  useEffect(() => {
    setCurrentUser(getStoredUser());
    async function loadVenues() {
      try {
        setLoading(true);
        const data = await api.getVenues();
        if (data && data.length > 0) {
          setVenues(data);
        } else {
          setVenues(fallbackVenues);
        }
      } catch (err) {
        setVenues(fallbackVenues);
      } finally {
        setLoading(false);
      }
    }
    loadVenues();
  }, []);

  const cities = [
    { label: "Manaus/AM", value: "Manaus" },
    { label: "São Paulo/SP", value: "São Paulo" },
    { label: "Todas as Cidades", value: "ALL" },
  ];

  // Filtro de arenas
  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      // Filtro de cidade
      if (selectedCity !== "Todas as Cidades") {
        const cityPrefix = selectedCity.split("/")[0].toLowerCase();
        if (!v.city.toLowerCase().includes(cityPrefix)) {
          return false;
        }
      }
      // Filtro de busca textual
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = v.name.toLowerCase().includes(term);
        const matchesDesc = (v.description || "").toLowerCase().includes(term);
        const matchesAddress = v.address.toLowerCase().includes(term);
        const matchesCourt = v.courts.some((c) => c.name.toLowerCase().includes(term) || c.sport_type.toLowerCase().includes(term));
        if (!matchesName && !matchesDesc && !matchesAddress && !matchesCourt) {
          return false;
        }
      }
      return true;
    });
  }, [venues, selectedCity, searchTerm]);

  return (
    <div className="min-h-screen bg-[#1F242C] text-slate-100 flex flex-col relative selection:bg-orange-500 selection:text-white">
      {/* Pattern de fundo esportivo sutil estilo Agendei Quadras */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: "32px 32px"
        }}
      />

      {/* Top Header Laranja estilo Agendei Quadras */}
      <header className="bg-[#EA580C] text-white shadow-md relative z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo ArenaGo com ícone de calendário */}
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
            <div>
              <span className="text-2xl font-black tracking-tight text-white font-sans lowercase">
                arenago
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/20 text-orange-50">
                Marketplace
              </span>
            </div>
          </Link>

          {/* Atalhos do Jogador no Topo Direito */}
          <div className="flex items-center gap-4 sm:gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-white/95">
                {currentUser ? `Olá, ${currentUser.name}` : "Olá, Visitante"}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <Link 
                href="/player" 
                title="Minhas Reservas"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
              >
                <Calendar className="w-4 h-4" />
              </Link>

              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                title="Suporte / Instagram"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              {currentUser ? (
                <Link
                  href="/player"
                  className="w-9 h-9 rounded-full bg-white text-orange-600 font-extrabold flex items-center justify-center text-sm shadow-sm hover:scale-105 transition-transform"
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </Link>
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
        </div>
      </header>

      {/* Conteúdo Centralizado no estilo 'Centros Esportivos' */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 relative z-10 flex flex-col justify-center">
        
        {/* Card Principal Branco com Bordas Arredondadas */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-800 border border-slate-200/80 transition-all">
          
          {/* Cabeçalho do Card: 'Centros Esportivos' e seletor de Cidade */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Centros Esportivos
            </h1>

            {/* Dropdown de Cidade estilo Agendei Quadras */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-700 bg-orange-50/70 hover:bg-orange-100/70 px-3 py-1.5 rounded-full border border-orange-200 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3.5 h-3.5 text-orange-600" />
              </button>

              {cityDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">
                    Selecione a Cidade
                  </div>
                  {cities.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => {
                        setSelectedCity(c.label);
                        setCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-orange-50 transition-colors ${
                        selectedCity === c.label ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-700"
                      }`}
                    >
                      <span>{c.label}</span>
                      {selectedCity === c.label && <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Barra de Pesquisa 'Pesquisar por Centro Esportivo' */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por Centro Esportivo"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-orange-500 focus:outline-hidden transition-all shadow-inner"
            />
          </div>

          {/* Lista de Cards de Arenas */}
          <div className="space-y-3.5">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Carregando centros esportivos...
              </div>
            ) : filteredVenues.length === 0 ? (
              <div className="py-10 text-center text-slate-500">
                <p className="text-sm font-semibold">Nenhum centro esportivo encontrado.</p>
                <p className="text-xs text-slate-400 mt-1">Tente trocar a cidade ou o termo de busca.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity("Todas as Cidades");
                    setSearchTerm("");
                  }}
                  className="mt-3 text-xs text-orange-600 font-bold hover:underline"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              filteredVenues.map((venue) => {
                const venueRating = 5.0;
                const venueReviews = 3;

                return (
                  <Link
                    key={venue.id}
                    href={`/schedule?venue=${venue.slug || venue.id}`}
                    className="block group"
                  >
                    <div className="bg-white rounded-xl border border-slate-200 hover:border-orange-500 p-3.5 sm:p-4 flex items-center gap-4 transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5">
                      
                      {/* Logo / Thumbnail da Arena */}
                      <div className="w-20 h-16 sm:w-24 sm:h-18 rounded-lg bg-black shrink-0 overflow-hidden flex items-center justify-center p-1.5 relative border border-slate-800">
                        {venue.slug === "arena-show" ? (
                          <div className="w-full h-full flex flex-col items-center justify-center text-center">
                            <span className="text-orange-500 text-[10px] font-black uppercase tracking-wider leading-none">ARENA</span>
                            <span className="text-white text-xs font-black uppercase tracking-widest leading-none mt-0.5">SHOW</span>
                            <span className="text-[7px] text-amber-400 mt-1">⭐⭐⭐⭐⭐</span>
                          </div>
                        ) : venue.slug === "beach-arena-itaim" ? (
                          <div className="w-full h-full flex flex-col items-center justify-center text-center">
                            <span className="text-amber-300 text-[9px] font-black uppercase tracking-wider leading-none">BEACH</span>
                            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest leading-none mt-0.5">ARENA</span>
                            <span className="text-[7px] text-slate-300 mt-1">ITAIM BIBI</span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-center">
                            <span className="text-sky-400 text-[9px] font-black uppercase tracking-wider leading-none">GALAXY</span>
                            <span className="text-white text-xs font-black uppercase tracking-widest leading-none mt-0.5">SPORTS</span>
                          </div>
                        )}
                      </div>

                      {/* Informações da Arena */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                          {venue.name}
                        </h2>
                        
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {venue.description || `${venue.address}, ${venue.city}`}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-bold text-slate-800">
                            {venueRating.toFixed(1).replace(".", ",")}
                          </span>
                          <span className="text-slate-400">
                            ({venueReviews} avaliações)
                          </span>
                        </div>
                      </div>

                      {/* Chevron Laranja */}
                      <div className="shrink-0 text-orange-500 group-hover:translate-x-1 transition-transform">
                        <ChevronRight className="w-5 h-5 text-orange-500 stroke-[2.5]" />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Divisor */}
          <div className="my-6 border-t border-slate-100" />

          {/* Card Promocional Inferior: "Não encontrou sua quadra favorita?" */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="block group"
          >
            <div className="rounded-xl border border-orange-200 bg-orange-50/40 hover:bg-orange-50 p-3 sm:p-4 flex items-center justify-between gap-3 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-orange-600">
                    Não encontrou sua quadra favorita?
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-600">
                    Manda o @ deles no nosso Instagram :D
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-orange-500 shrink-0 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* Links Rápidos de Acesso ao Painel e Gestão */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>ArenaGo &copy; {new Date().getFullYear()}</span>
            <div className="flex items-center gap-3 font-medium">
              <Link href="/manager" className="text-orange-600 hover:underline">
                Painel do Gestor
              </Link>
              <span>•</span>
              <Link href="/player" className="text-slate-600 hover:text-orange-600">
                Minhas Reservas
              </Link>
              <span>•</span>
              <Link href="/admin" className="text-slate-600 hover:text-orange-600">
                SaaS Admin
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
