"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Filter, 
  Star, 
  SlidersHorizontal, 
  Map as MapIcon, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Flame,
  Award
} from "lucide-react";
import { api, Venue, Court } from "@/lib/api";

const SPORTS = [
  { id: "ALL", label: "Todos os Esportes", icon: "🏆" },
  { id: "BEACH_TENNIS", label: "Beach Tennis", icon: "🏖️" },
  { id: "FOOTBALL", label: "Society (Futebol 7)", icon: "⚽" },
  { id: "FUTSAL", label: "Futsal", icon: "🥅" },
  { id: "PADEL", label: "Padel", icon: "🎾" },
  { id: "VOLLEYBALL", label: "Vôlei de Praia", icon: "🏐" },
  { id: "BASKETBALL", label: "Basquete", icon: "🏀" },
];

export default function MarketplacePage() {
  const [selectedSport, setSelectedSport] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [selectedCourtForMap, setSelectedCourtForMap] = useState<string | null>(null);

  // Fallback demo data if API is loading or empty
  const defaultVenues: Venue[] = [
    {
      id: "v1",
      name: "Beach Arena Itaim",
      slug: "beach-arena-itaim",
      description: "Complexo esportivo premium no coração do Itaim Bibi com 4 quadras de areia de alta absorção e vestiários climatizados.",
      address: "Rua Clodomiro Amazonas, 1200",
      city: "São Paulo",
      state: "SP",
      latitude: -23.5855,
      longitude: -46.6789,
      courts: [
        {
          id: "c1",
          venue_id: "v1",
          name: "Quadra Central 1 (Areia Coberta)",
          sport_type: "BEACH_TENNIS",
          surface: "Areia Especial Climatizada",
          is_indoor: true,
          default_hourly_rate: 150.0,
          images: [{ id: "img1", image_url: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80", is_cover: true }]
        },
        {
          id: "c2",
          venue_id: "v1",
          name: "Quadra 2 Externa Sol & Brisa",
          sport_type: "BEACH_TENNIS",
          surface: "Areia Branca Tratada",
          is_indoor: false,
          default_hourly_rate: 130.0,
          images: [{ id: "img2", image_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80", is_cover: true }]
        }
      ]
    },
    {
      id: "v2",
      name: "Galaxy Sports Morumbi",
      slug: "galaxy-sports-morumbi",
      description: "O maior polo society de São Paulo com grama sintética padrão FIFA Pro e iluminação LED para jogos noturnos.",
      address: "Av. Giovanni Gronchi, 3500",
      city: "São Paulo",
      state: "SP",
      latitude: -23.6120,
      longitude: -46.7260,
      courts: [
        {
          id: "c3",
          venue_id: "v2",
          name: "Campo Society A (Futebol 7)",
          sport_type: "FOOTBALL",
          surface: "Grama Sintética Monofilamento 50mm",
          is_indoor: true,
          default_hourly_rate: 220.0,
          images: [{ id: "img3", image_url: "https://images.unsplash.com/photo-1529900248673-982855519db1?auto=format&fit=crop&w=800&q=80", is_cover: true }]
        },
        {
          id: "c4",
          venue_id: "v2",
          name: "Ginásio Futsal Pro",
          sport_type: "FUTSAL",
          surface: "Piso Vinílico Amortecido Taraflex",
          is_indoor: true,
          default_hourly_rate: 180.0,
          images: [{ id: "img4", image_url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80", is_cover: true }]
        }
      ]
    },
    {
      id: "v3",
      name: "Padel Club Pinheiros",
      slug: "padel-club-pinheiros",
      description: "Quadras panorâmicas de vidro temperado e piso de última geração importado da Espanha.",
      address: "Rua dos Pinheiros, 850",
      city: "São Paulo",
      state: "SP",
      latitude: -23.5670,
      longitude: -46.6890,
      courts: [
        {
          id: "c5",
          venue_id: "v3",
          name: "Quadra Panorâmica 1",
          sport_type: "PADEL",
          surface: "Grama Texturizada Pro WPT",
          is_indoor: true,
          default_hourly_rate: 190.0,
          images: [{ id: "img5", image_url: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80", is_cover: true }]
        }
      ]
    }
  ];

  useEffect(() => {
    async function fetchVenues() {
      try {
        setLoading(true);
        const data = await api.getVenues({
          sport: selectedSport !== "ALL" ? selectedSport : undefined,
          city: cityFilter || undefined,
          max_price: maxPrice,
        });
        if (data && data.length > 0) {
          setVenues(data);
        } else {
          setVenues(defaultVenues);
        }
      } catch (err) {
        // Fallback gracefully
        setVenues(defaultVenues);
      } finally {
        setLoading(false);
      }
    }
    fetchVenues();
  }, [selectedSport, cityFilter, maxPrice]);

  // Flatten courts for card rendering matching Ngeball reference
  const displayedCourts = venues.flatMap(v => 
    v.courts.map(c => ({
      ...c,
      venueName: v.name,
      venueAddress: `${v.address}, ${v.city} - ${v.state}`,
      city: v.city,
    }))
  ).filter(c => {
    if (selectedSport !== "ALL" && c.sport_type !== selectedSport) return false;
    if (c.default_hourly_rate > maxPrice) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner with Search Bar */}
      <section className="bg-linear-to-r from-slate-950 via-slate-900 to-emerald-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3 tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Sua próxima partida a um clique
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
              Encontre e reserve a quadra perfeita em segundos.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base">
              Disponibilidade em tempo real com confirmação imediata e proteção anti-overbooking.
            </p>
          </div>

          {/* Quick Search Floating Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-2.5 sm:p-4 shadow-2xl border border-slate-200/80 text-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-4 flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/60">
              <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="w-full">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Cidade ou Bairro</label>
                <input
                  type="text"
                  placeholder="Ex: São Paulo, Itaim..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-3 flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/60">
              <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="w-full">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Data do Jogo</label>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-3 flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/60">
              <SlidersHorizontal className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="w-full">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Preço Máx: R$ {maxPrice}</label>
                <input
                  type="range"
                  min="80"
                  max="400"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <button className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all">
                <Search className="w-4 h-4" />
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sport Category Pills - Horizontal Scrollable */}
      <section className="bg-white border-b border-slate-200 py-3 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {SPORTS.map((sport) => (
              <button
                key={sport.id}
                onClick={() => setSelectedSport(sport.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  selectedSport === sport.id
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold scale-102"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <span>{sport.icon}</span>
                <span>{sport.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content: Filters + Courts Grid + Interactive Map Mockup */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Quadras Disponíveis
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Mostrando <strong className="text-slate-800">{displayedCourts.length}</strong> opções prontas para reserva imediata
            </p>
          </div>

          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <MapIcon className="w-4 h-4 text-emerald-600" />
            {showMap ? "Ocultar Mapa" : "Exibir no Mapa"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Court Cards Grid (Ngeball style) */}
          <div className={showMap ? "lg:col-span-7 space-y-5" : "lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
            {loading ? (
              <div className="p-12 text-center text-slate-500 col-span-full">
                Carregando quadras disponíveis...
              </div>
            ) : displayedCourts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 col-span-full">
                <p className="text-slate-500 font-medium">Nenhuma quadra encontrada para os filtros selecionados.</p>
                <button
                  onClick={() => { setSelectedSport("ALL"); setCityFilter(""); setMaxPrice(400); }}
                  className="mt-3 text-xs text-emerald-600 font-semibold hover:underline"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              displayedCourts.map((court) => (
                <div
                  key={court.id}
                  onMouseEnter={() => setSelectedCourtForMap(court.id)}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Photo & Badges */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                    <img
                      src={court.images?.[0]?.image_url || "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80"}
                      alt={court.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    
                    {/* Sport Tag */}
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider shadow">
                        {court.sport_type.replace("_", " ")}
                      </span>
                      {court.is_indoor ? (
                        <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-200 text-[11px] font-medium">
                          Coberta
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-600/80 backdrop-blur-md text-white text-[11px] font-medium">
                          Ao Ar Livre
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-slate-800 text-xs font-bold flex items-center gap-1 shadow">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      4.9 <span className="text-[10px] text-slate-400 font-normal">(94)</span>
                    </div>

                    {/* Venue Title & Subtitle */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">{court.venueName}</p>
                      <h3 className="text-base sm:text-lg font-bold leading-snug line-clamp-1">{court.name}</h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{court.venueAddress}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">Piso: {court.surface}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">Estacionamento</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">Vestiários</span>
                      </div>
                    </div>

                    {/* Card Footer: Price & Direct Booking Link */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">A partir de</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-extrabold text-slate-900">R$ {court.default_hourly_rate.toFixed(0)}</span>
                          <span className="text-xs text-slate-500 font-medium">/hora</span>
                        </div>
                      </div>

                      <Link
                        href={`/player?court_id=${court.id}&venue_name=${encodeURIComponent(court.venueName)}&court_name=${encodeURIComponent(court.name)}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition group-hover:translate-x-0.5"
                      >
                        Reservar
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Simulated Map with Interactive Pins (Matching Ngeball reference) */}
          {showMap && (
            <div className="lg:col-span-5 sticky top-28 bg-slate-100 rounded-3xl border border-slate-300/80 overflow-hidden shadow-inner h-[620px] flex flex-col">
              {/* Map simulated header */}
              <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs z-10">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Região Metropolitana de São Paulo
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {displayedCourts.length} arenas no mapa
                </span>
              </div>

              {/* Map background mockup with SVG streets and styled pins */}
              <div className="relative flex-1 bg-slate-200/90 overflow-hidden">
                {/* Simulated Street Grid Lines */}
                <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#94a3b8" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {/* Diagonal avenues */}
                  <line x1="0" y1="50" x2="600" y2="400" stroke="#cbd5e1" strokeWidth="6" />
                  <line x1="100" y1="0" x2="300" y2="600" stroke="#cbd5e1" strokeWidth="8" />
                  <line x1="450" y1="50" x2="100" y2="550" stroke="#cbd5e1" strokeWidth="5" />
                  {/* River representation */}
                  <path d="M 50 0 Q 200 300 450 600" fill="none" stroke="#93c5fd" strokeWidth="16" opacity="0.6" />
                </svg>

                {/* Map Interactive Pins matching Ngeball Reference */}
                <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="group relative cursor-pointer">
                    <div className="px-3 py-1.5 bg-slate-900 text-white font-black text-xs rounded-full shadow-xl border-2 border-emerald-400 hover:scale-110 transition flex items-center gap-1">
                      <span>R$ 150</span>
                    </div>
                    <div className="w-2 h-2 bg-emerald-400 rotate-45 mx-auto -mt-1"></div>
                    <div className="hidden group-hover:block absolute bottom-8 left-1/2 -translate-x-1/2 bg-white text-slate-800 p-2 rounded-lg shadow-xl text-[11px] whitespace-nowrap z-20">
                      <strong>Beach Arena Itaim</strong>
                      <span className="block text-slate-500">Itaim Bibi</span>
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 left-2/3 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="group relative cursor-pointer">
                    <div className="px-3 py-1.5 bg-emerald-600 text-white font-black text-xs rounded-full shadow-xl border-2 border-white hover:scale-110 transition flex items-center gap-1">
                      <span>R$ 220</span>
                    </div>
                    <div className="w-2 h-2 bg-emerald-600 rotate-45 mx-auto -mt-1"></div>
                    <div className="hidden group-hover:block absolute bottom-8 left-1/2 -translate-x-1/2 bg-white text-slate-800 p-2 rounded-lg shadow-xl text-[11px] whitespace-nowrap z-20">
                      <strong>Galaxy Sports Morumbi</strong>
                      <span className="block text-slate-500">Morumbi</span>
                    </div>
                  </div>
                </div>

                <div className="absolute top-2/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="group relative cursor-pointer">
                    <div className="px-3 py-1.5 bg-slate-900 text-white font-black text-xs rounded-full shadow-xl border-2 border-emerald-400 hover:scale-110 transition flex items-center gap-1">
                      <span>R$ 190</span>
                    </div>
                    <div className="w-2 h-2 bg-emerald-400 rotate-45 mx-auto -mt-1"></div>
                    <div className="hidden group-hover:block absolute bottom-8 left-1/2 -translate-x-1/2 bg-white text-slate-800 p-2 rounded-lg shadow-xl text-[11px] whitespace-nowrap z-20">
                      <strong>Padel Club Pinheiros</strong>
                      <span className="block text-slate-500">Pinheiros</span>
                    </div>
                  </div>
                </div>

                {/* Map Card Preview at bottom of map */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600">Localização em Destaque</span>
                    <h4 className="text-xs font-bold text-slate-800">Zona Sul e Oeste de São Paulo</h4>
                    <p className="text-[11px] text-slate-500">Navegue pelas quadras com melhor avaliação</p>
                  </div>
                  <Link
                    href="/player"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow hover:bg-emerald-500"
                  >
                    Ver Todas
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
