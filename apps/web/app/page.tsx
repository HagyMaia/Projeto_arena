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
  Activity,
  Phone
} from "lucide-react";
import { api, Venue, getStoredUser } from "@/lib/api";
import { getOfficialSupportWhatsAppUrl } from "@/lib/utils";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export default function MarketplacePage() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("Todas as Cidades");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ role: string; name: string } | null>(null);

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

  // Filtro de arenas em tempo real
  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      if (selectedCity !== "Todas as Cidades") {
        const cityPrefix = selectedCity.split("/")[0].toLowerCase();
        if (!v.city.toLowerCase().includes(cityPrefix)) {
          return false;
        }
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
  }, [venues, selectedCity, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 flex flex-col relative selection:bg-emerald-500 selection:text-white transition-colors">
      {/* Pattern de fundo esportivo discreto */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: "32px 32px"
        }}
      />

      {/* Top Banner Verde-Esmeralda & Azul-Marinho */}
      <section className="bg-gradient-to-r from-[#0F172A] via-[#059669] to-[#0F172A] text-white shadow-md relative z-20 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-emerald-200 border border-white/15 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Aluguel de Quadras Esportivas em Tempo Real</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Encontre e Reserve Sua Quadra Favorita
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 max-w-xl mx-auto">
            Beach tennis, futebol society, futevôlei, vôlei e mais. Sem filas, com confirmação imediata.
          </p>
        </div>
      </section>

      {/* Conteúdo Centralizado */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 relative z-10 flex flex-col">
        {/* Card Principal */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 transition-all">
          
          {/* Cabeçalho do Card: 'Centros Esportivos' e Seletor de Cidade */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 gap-3 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Centros Esportivos
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {filteredVenues.length} {filteredVenues.length === 1 ? "arena disponível" : "arenas disponíveis"}
              </p>
            </div>

            {/* Dropdown de Cidade */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </button>

              {cityDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#0F172A] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">
                    Selecione a Cidade
                  </div>
                  {cities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setSelectedCity(city);
                        setCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors ${
                        selectedCity === city
                          ? "text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50/70 dark:bg-emerald-950/40"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span>{city}</span>
                      {selectedCity === city && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Barra de Pesquisa */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por arena, esporte ou endereço..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-emerald-600 dark:focus:border-emerald-500 focus:outline-none transition-all shadow-inner"
            />
          </div>

          {/* Lista de Arenas */}
          <div className="space-y-3.5">
            {loading ? (
              <div className="py-14 text-center text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Carregando centros esportivos...
              </div>
            ) : filteredVenues.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Nenhum centro esportivo encontrado.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Tente trocar a cidade ou o termo digitado.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity("Todas as Cidades");
                    setSearchTerm("");
                  }}
                  className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              filteredVenues.map((venue) => {
                const courtCount = venue.courts ? venue.courts.length : 0;
                const minPrice = venue.courts && venue.courts.length > 0
                  ? Math.min(...venue.courts.map(c => Number(c.default_hourly_rate)))
                  : null;

                return (
                  <Link
                    key={venue.id}
                    href={`/schedule?venue=${venue.slug || venue.id}`}
                    className="block group"
                  >
                    <div className="bg-white dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-emerald-600 dark:hover:border-emerald-500 p-4 flex items-center gap-4 transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5">
                      
                      {/* Logo / Thumbnail da Arena */}
                      <div className="w-20 h-20 sm:w-24 sm:h-22 rounded-xl bg-[#0F172A] shrink-0 overflow-hidden flex items-center justify-center p-2 relative border border-slate-700">
                        {venue.cover_image_url ? (
                          <img
                            src={venue.cover_image_url}
                            alt={venue.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-center">
                            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wider leading-none">
                              ARENA
                            </span>
                            <span className="text-white text-xs font-black uppercase tracking-widest leading-none mt-1">
                              {venue.name.slice(0, 8)}
                            </span>
                            <span className="text-[8px] text-amber-400 mt-1">⭐⭐⭐⭐⭐</span>
                          </div>
                        )}
                      </div>

                      {/* Informações da Arena */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                            {venue.name}
                          </h3>
                        </div>
                        
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {venue.description || `${venue.address}, ${venue.city}`}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span>5.0</span>
                            <span className="text-slate-400">(verificada)</span>
                          </div>

                          <span className="text-slate-300 dark:text-slate-700">•</span>

                          <span className="text-slate-600 dark:text-slate-300">
                            {courtCount} {courtCount === 1 ? "quadra" : "quadras"}
                          </span>

                          {minPrice !== null && (
                            <>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                A partir de R$ {minPrice.toFixed(0)}/h
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Botão de Agendamento com Chevron */}
                      <div className="shrink-0 flex items-center gap-2">
                        <span className="hidden sm:inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                          Ver horários
                        </span>
                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 group-hover:bg-emerald-600 flex items-center justify-center text-emerald-600 group-hover:text-white transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Divisor */}
          <div className="my-6 border-t border-slate-100 dark:border-slate-800" />

          {/* Card de Contato Suporte Geral */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Dúvidas sobre agendamento ou pagamento?
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
                  Nossa central de atendimento oficial está disponível via WhatsApp.
                </p>
              </div>
            </div>

            <a
              href={getOfficialSupportWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition shadow-sm shrink-0"
            >
              <Phone className="w-3.5 h-3.5" />
              Central de Atendimento
            </a>
          </div>

          {/* Rodapé seguro do Card */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>ArenaGo &copy; {new Date().getFullYear()}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              Conexão com Neon Tech PostgreSQL
            </span>
          </div>
        </div>
      </main>

      {/* Botão Flutuante de WhatsApp Geral da Plataforma */}
      <FloatingWhatsApp />
    </div>
  );
}
