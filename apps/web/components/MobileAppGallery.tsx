"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Check, 
  Star, 
  MapPin, 
  HelpCircle, 
  Wallet, 
  Search, 
  Share2, 
  ShieldCheck, 
  ArrowLeft,
  Sparkles,
  Zap,
  Trophy,
  CheckCircle2,
  QrCode
} from "lucide-react";

interface ScreenData {
  id: string;
  tag: string;
  title: string;
  description: string;
}

const SCREENS: ScreenData[] = [
  {
    id: "schedule",
    tag: "GRADE EM TEMPO REAL",
    title: "Agendamento em 3 Cliques",
    description: "Escolha o dia, veja horários livres em tempo real e selecione com feedback instantâneo."
  },
  {
    id: "venue",
    tag: "CENTRO ESPORTIVO",
    title: "Detalhes e Quadras Disponíveis",
    description: "Fotos reais da estrutura, modalidades (Beach Tennis, Society, Vôlei) e localização."
  },
  {
    id: "onboarding",
    tag: "ACESSO INSTANTÂNEO",
    title: "#ClicouAgendou",
    description: "Acesse sua conta ou faça checkout rápido sem burocracia nem formulários cansativos."
  },
  {
    id: "checkout",
    tag: "PAGAMENTO & VOUCHER",
    title: "Pix Imediato & Voucher",
    description: "Garantia de horário sem filas nem conflitos, com voucher digital salvo na hora."
  }
];

export function MobileAppGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedSlotHour, setSelectedSlotHour] = useState("17:00");
  const [selectedDate, setSelectedDate] = useState(17);

  // Auto-play timer for smooth screen movements
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SCREENS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % SCREENS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + SCREENS.length) % SCREENS.length);
  };

  // Helper to render screen UI inside phone mockup
  const renderPhoneScreen = (screenIndex: number, isCenter: boolean = false) => {
    switch (screenIndex) {
      // TELA 0: Grade de Horários (Exatamente como o celular central do print!)
      case 0:
        return (
          <div className="h-full flex flex-col justify-between bg-white text-slate-800 text-[11px] select-none font-sans">
            {/* Header da Tela do App */}
            <div className="bg-white border-b border-slate-100 px-3 pt-3 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[#ff7043] font-bold">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="text-slate-800 font-black text-xs">Quadra 1</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <HelpCircle className="w-3.5 h-3.5 text-[#ff7043]" />
                <Wallet className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </div>

            {/* Mês e Tira de Dias */}
            <div className="px-2 pt-2 bg-slate-50/70 border-b border-slate-100">
              <div className="text-[10px] text-center font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                novembro 2026
              </div>
              <div className="flex items-center justify-between pb-2 text-[9px] font-semibold text-slate-500">
                {[
                  { d: "SEG", n: 14 },
                  { d: "TER", n: 15 },
                  { d: "QUA", n: 16 },
                  { d: "QUI", n: 17 },
                  { d: "SEX", n: 18 },
                  { d: "SÁB", n: 19 },
                  { d: "DOM", n: 20 },
                ].map((item) => {
                  const isSel = item.n === selectedDate;
                  return (
                    <button
                      key={item.n}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(item.n);
                      }}
                      className={`flex flex-col items-center py-1 px-1.5 rounded-lg transition ${
                        isSel
                          ? "bg-[#ff7043] text-white shadow-xs font-bold scale-105"
                          : "hover:bg-slate-200/60 text-slate-600"
                      }`}
                    >
                      <span className="text-[7px] leading-tight opacity-80">{item.d}</span>
                      <span className="text-[10px] font-black">{item.n}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lista de Horários (Scrollable & Interativa) */}
            <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1.5 divide-y divide-slate-100">
              {[
                { time: "10:00 às 11:00", status: "LIVRE", type: "free" },
                { time: "11:00 às 12:00", status: "LIVRE", type: "free" },
                { time: "12:00 às 13:00", status: "LIVRE", type: "free" },
                { time: "13:00 às 14:00", status: "LIVRE", type: "free" },
                { time: "14:00 às 15:00", status: "AGENDADO", type: "busy" },
                { time: "15:00 às 16:00", status: "LIVRE", type: "free" },
                { time: "16:00 às 17:00", status: "LIVRE", type: "free" },
                { time: "17:00 às 18:00", status: "AGENDEI", type: "selected" },
                { time: "18:00 às 19:00", status: "SOLICITADO", type: "busy" },
                { time: "19:00 às 20:00", status: "LIVRE", type: "nobre", isNobre: true },
                { time: "20:00 às 21:00", status: "LIVRE", type: "nobre", isNobre: true },
                { time: "21:00 às 22:00", status: "LIVRE", type: "nobre", isNobre: true },
              ].map((slot, sIdx) => {
                const isSelected = selectedSlotHour === slot.time.split(" ")[0];
                return (
                  <div
                    key={sIdx}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (slot.type !== "busy") {
                        setSelectedSlotHour(slot.time.split(" ")[0]);
                      }
                    }}
                    className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-[10px] cursor-pointer transition ${
                      isSelected || slot.type === "selected"
                        ? "bg-emerald-500 text-white font-bold shadow-xs"
                        : slot.type === "busy"
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed opacity-80"
                        : "hover:bg-emerald-50/80 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {(isSelected || slot.type === "selected" || slot.type === "nobre") && (
                        <Check className="w-3 h-3 text-emerald-300" />
                      )}
                      <span className="font-semibold">{slot.time}</span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span
                        className={`text-[9px] font-black uppercase ${
                          isSelected || slot.type === "selected"
                            ? "text-white"
                            : slot.type === "busy"
                            ? "text-slate-400"
                            : "text-emerald-600"
                        }`}
                      >
                        {slot.status}
                      </span>
                      {slot.isNobre && !(isSelected || slot.type === "selected") && (
                        <span className="text-[7.5px] text-[#ff7043] font-bold">
                          Horário nobre 🔥
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Barra Flutuante Inferior (Fiel ao print: 1 HORÁRIO SELECIONADO com botão de calendário) */}
            <div className="p-2.5 bg-white border-t border-slate-100">
              <div className="bg-[#ff7043] hover:bg-[#ff5722] text-white rounded-2xl p-2 px-3 flex items-center justify-between shadow-md transition transform active:scale-98">
                <span className="font-black text-[10px] uppercase tracking-wider">
                  1 HORÁRIO SELECIONADO
                </span>
                <div className="w-6 h-6 rounded-full bg-white text-[#ff7043] flex items-center justify-center shadow-xs">
                  <CalendarIcon className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        );

      // TELA 1: Centro Esportivo (Exatamente como o celular da esquerda no print!)
      case 1:
        return (
          <div className="h-full flex flex-col justify-between bg-slate-50 text-slate-800 text-[11px] select-none font-sans">
            {/* Topbar */}
            <div className="bg-white border-b border-slate-100 px-3 pt-3 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                <ArrowLeft className="w-3.5 h-3.5 text-[#ff7043]" />
                <span className="text-xs font-black">Centro esportivo</span>
              </div>
              <Search className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Conteúdo do Centro Esportivo */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Banner Verde com Nome da Arena */}
              <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md relative overflow-hidden flex flex-col items-center justify-center text-center">
                <div className="text-[9px] uppercase tracking-widest text-emerald-200 font-bold">
                  COMPLEXO OFICIAL
                </div>
                <div className="text-sm font-black tracking-tight uppercase mt-0.5">
                  ARENA ESPORTES
                </div>
                <div className="text-[9px] text-emerald-100 mt-0.5">
                  Arena Poliesportiva & Beach Club
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-[8px] font-bold">
                    Super avaliado
                  </span>
                  <span className="bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full text-[8px] font-black">
                    ★ 5,0 (27 avaliações)
                  </span>
                </div>
              </div>

              {/* Título: 5 Quadras */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase text-[#ff7043] tracking-wider">
                  5 QUADRAS
                </span>
                <span className="text-[9px] text-slate-400">Ver todas</span>
              </div>

              {/* Card de Quadra com Foto e Botão Agendar */}
              <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-xs space-y-2">
                <div className="h-24 rounded-xl overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=600&q=80"
                    alt="Quadra Beach Tennis"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[8px] font-black">
                    Quadra 1 • Beach Tennis
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1 text-[9px] text-slate-500">
                    <MapPin className="w-3 h-3 text-[#ff7043]" />
                    <span className="truncate">AVENIDA BRASIL, 123, CENTRO</span>
                  </div>
                  <div className="text-xs font-black text-slate-800 mt-0.5">
                    R$ 90,00 <span className="text-[9px] text-slate-400 font-normal">/hora</span>
                  </div>
                </div>

                <div className="bg-[#ff7043] hover:bg-[#ff5722] text-white py-1.5 rounded-xl font-bold text-[10px] text-center uppercase tracking-wider shadow-xs cursor-pointer">
                  Agendar
                </div>
              </div>
            </div>
          </div>
        );

      // TELA 2: Onboarding / Boas-vindas (Exatamente como o celular da direita no print!)
      case 2:
        return (
          <div className="h-full flex flex-col justify-between text-white text-[11px] select-none font-sans relative overflow-hidden bg-[#ff5722]">
            {/* Foto de Fundo Vermelha/Coral com Quadra Esportiva */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
              style={{
                backgroundImage: `url("https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=600&q=80")`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#ff7043]/90 via-[#ff5722]/95 to-slate-950/95" />

            {/* Topo: Logo Arenago */}
            <div className="relative z-10 pt-8 px-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg mb-2">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div className="font-black text-lg tracking-tight uppercase">
                arenago
              </div>
              <div className="text-[9px] font-bold text-orange-200 tracking-wider">
                #ClicouAgendou
              </div>
            </div>

            {/* Centro: Chamada de Ação */}
            <div className="relative z-10 px-5 text-center my-auto">
              <p className="text-xs font-bold leading-snug">
                Falta pouco para você começar a agendar!
              </p>
              <p className="text-[10px] text-orange-100 mt-1">
                Como deseja continuar?
              </p>
            </div>

            {/* Rodapé: Botões de Autenticação & Entrada */}
            <div className="relative z-10 p-4 space-y-2">
              <div className="w-full py-2 bg-white text-[#ff7043] rounded-xl font-black text-[10px] text-center uppercase tracking-wider shadow-md hover:bg-orange-50 transition cursor-pointer">
                Acessar minha conta
              </div>
              <div className="w-full py-2 bg-[#ff7043] border border-white/40 text-white rounded-xl font-black text-[10px] text-center uppercase tracking-wider shadow-md hover:bg-[#ff5722] transition cursor-pointer">
                Criar nova conta
              </div>
              <div className="text-center pt-1">
                <span className="text-[9px] text-white/70 hover:text-white transition cursor-pointer">
                  Criar conta depois
                </span>
              </div>
              <div className="text-center text-[7.5px] text-white/50 pt-1">
                Possui uma quadra? <span className="underline text-white">Clique aqui</span>
              </div>
            </div>
          </div>
        );

      // TELA 3: Confirmação & Voucher Pix
      case 3:
      default:
        return (
          <div className="h-full flex flex-col justify-between bg-slate-900 text-white text-[11px] select-none font-sans p-3">
            {/* Topo Voucher */}
            <div className="pt-2 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-1.5 shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                RESERVA CONFIRMADA
              </div>
              <div className="text-xs font-black text-white mt-0.5">
                Voucher Digital #AG-8821
              </div>
            </div>

            {/* Box com QR Code e Dados da Reserva */}
            <div className="bg-slate-800/90 rounded-2xl p-3 border border-slate-700/80 my-2 space-y-2">
              <div className="flex items-center justify-between text-[9px] text-slate-300 pb-1.5 border-b border-slate-700">
                <span>Beach Arena Itaim</span>
                <span className="font-bold text-emerald-400">PAGO VIA PIX</span>
              </div>

              <div className="flex items-center justify-center p-2 bg-white rounded-xl">
                <QrCode className="w-20 h-20 text-slate-900" />
              </div>

              <div className="text-center text-[9px] text-slate-400">
                Apresente este QR Code na portaria da arena para liberação imediata da quadra.
              </div>
            </div>

            {/* Rodapé Ações */}
            <div className="space-y-1.5 pb-1">
              <div className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-[10px] text-center shadow-md cursor-pointer transition">
                Abrir Comprovante
              </div>
              <div className="w-full py-1.5 bg-slate-800 text-slate-300 rounded-xl font-semibold text-[9px] text-center cursor-pointer hover:bg-slate-700 transition">
                Compartilhar com o Time
              </div>
            </div>
          </div>
        );
    }
  };

  const prevIndex = (activeIndex - 1 + SCREENS.length) % SCREENS.length;
  const nextIndex = (activeIndex + 1) % SCREENS.length;

  return (
    <section 
      id="galeria-app"
      className="relative py-20 px-4 sm:px-6 lg:px-8 text-white overflow-hidden border-b border-slate-800 transition-colors"
      style={{
        backgroundColor: "#111827",
        backgroundImage: `
          radial-gradient(circle at 15% 25%, rgba(255, 112, 67, 0.12) 0%, transparent 45%),
          radial-gradient(circle at 85% 75%, rgba(16, 185, 129, 0.12) 0%, transparent 45%),
          url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.035' fill-rule='evenodd'%3E%3Cpath d='M20 20a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-2a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm40 40a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-2a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM60 16h-4v-2a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2h-4a2 2 0 0 0-2 2v4a6 6 0 0 0 5 5.9V30h-2a2 2 0 0 0 0 4h10a2 2 0 0 0 0-4h-2v-2.1a6 6 0 0 0 5-5.9v-4a2 2 0 0 0-2-2zm-2 6a4 4 0 0 1-4 4 4 4 0 0 1-4-4v-4h8v4zM16 60h4v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2h4a2 2 0 0 0 2-2v-4a6 6 0 0 0-5-5.9V46h2a2 2 0 0 0 0-4H19a2 2 0 0 0 0 4h2v2.1a6 6 0 0 0-5 5.9v4a2 2 0 0 0 2 2zm2-6a4 4 0 0 1 4-4 4 4 0 0 1 4 4v4h-8v-4z'/%3E%3C/g%3E%3C/svg%3E")
        `,
        backgroundSize: "cover, cover, 70px 70px"
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-6xl mx-auto">
        
        {/* Cabeçalho da Seção Fiel ao Print: GALERIA / CONHEÇA O APP ARENAGO */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-[#ff7043] block mb-2">
            GALERIA
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#ff7043] uppercase">
            CONHEÇA O APP ARENAGO
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            Design responsivo, grade interativa e agendamento instantâneo em qualquer tela.
          </p>
        </div>

        {/* Display Triplo de Smartphones (Esquerda, Centro Destaque, Direita) */}
        <div className="relative flex items-center justify-center gap-4 sm:gap-8 lg:gap-10 py-6 min-h-[540px]">
          
          {/* Celular da Esquerda (Preview Secundário com Transição Suave) */}
          <div 
            onClick={handlePrev}
            className="hidden md:block w-[240px] lg:w-[260px] h-[480px] lg:h-[500px] shrink-0 transform -rotate-2 scale-90 opacity-80 hover:opacity-100 hover:scale-95 transition-all duration-500 cursor-pointer select-none group"
            title="Clique para ver tela anterior"
          >
            {/* Moldura do Celular */}
            <div className="relative w-full h-full rounded-[40px] p-2.5 bg-gradient-to-b from-slate-600 via-slate-800 to-slate-900 border-4 border-slate-600/60 shadow-2xl overflow-hidden group-hover:border-emerald-500/50 transition-colors">
              {/* Notch / Ilha Superior */}
              <div className="w-20 h-3.5 bg-black rounded-full mx-auto mb-1.5 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800 mr-1.5" />
                <div className="w-5 h-0.5 bg-slate-700 rounded-full" />
              </div>
              {/* Tela do Celular */}
              <div className="w-full h-[calc(100%-20px)] rounded-[32px] overflow-hidden shadow-inner">
                {renderPhoneScreen(prevIndex, false)}
              </div>
            </div>
          </div>

          {/* Celular Central (Destaque Principal com Escala Maior e Sombra Profunda) */}
          <div className="relative w-[280px] sm:w-[310px] lg:w-[330px] h-[540px] sm:h-[570px] lg:h-[600px] shrink-0 z-20 transform hover:scale-[1.02] transition-all duration-500 select-none">
            
            {/* Glow de ambient light atrás do celular ativo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#ff7043]/30 via-emerald-500/20 to-teal-500/30 rounded-full blur-3xl transform scale-110 pointer-events-none" />

            {/* Moldura Metálica Premium do Smartphone */}
            <div className="relative w-full h-full rounded-[44px] p-3 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 border-4 border-slate-500/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden">
              
              {/* Notch Dinâmico com alto-falante e câmera */}
              <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-center shadow-inner">
                <div className="w-2 h-2 rounded-full bg-slate-800 mr-2" />
                <div className="w-6 h-1 bg-slate-700 rounded-full" />
              </div>

              {/* Tela Interna Renderizada */}
              <div className="w-full h-[calc(100%-24px)] rounded-[34px] overflow-hidden shadow-inner relative">
                {renderPhoneScreen(activeIndex, true)}
              </div>
            </div>

            {/* Botões de Navegação Flutuantes nas Laterais do Celular Central */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/90 hover:bg-[#ff7043] border border-slate-700 text-white flex items-center justify-center shadow-xl transition transform hover:scale-110 active:scale-95 cursor-pointer z-30"
              aria-label="Tela anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/90 hover:bg-[#ff7043] border border-slate-700 text-white flex items-center justify-center shadow-xl transition transform hover:scale-110 active:scale-95 cursor-pointer z-30"
              aria-label="Próxima tela"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

          </div>

          {/* Celular da Direita (Preview Secundário com Transição Suave) */}
          <div 
            onClick={handleNext}
            className="hidden md:block w-[240px] lg:w-[260px] h-[480px] lg:h-[500px] shrink-0 transform rotate-2 scale-90 opacity-80 hover:opacity-100 hover:scale-95 transition-all duration-500 cursor-pointer select-none group"
            title="Clique para ver próxima tela"
          >
            {/* Moldura do Celular */}
            <div className="relative w-full h-full rounded-[40px] p-2.5 bg-gradient-to-b from-slate-600 via-slate-800 to-slate-900 border-4 border-slate-600/60 shadow-2xl overflow-hidden group-hover:border-emerald-500/50 transition-colors">
              {/* Notch / Ilha Superior */}
              <div className="w-20 h-3.5 bg-black rounded-full mx-auto mb-1.5 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800 mr-1.5" />
                <div className="w-5 h-0.5 bg-slate-700 rounded-full" />
              </div>
              {/* Tela do Celular */}
              <div className="w-full h-[calc(100%-20px)] rounded-[32px] overflow-hidden shadow-inner">
                {renderPhoneScreen(nextIndex, false)}
              </div>
            </div>
          </div>

        </div>

        {/* Indicadores de Paginação do Carrossel (Exatamente 4 pílulas como no print!) */}
        <div className="flex flex-col items-center justify-center gap-4 mt-8">
          
          <div className="flex items-center gap-2.5">
            {SCREENS.map((screen, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={screen.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isActive
                      ? "w-9 h-2.5 bg-[#ff7043] shadow-md shadow-orange-500/30"
                      : "w-6 h-2 bg-slate-600/70 hover:bg-slate-500"
                  }`}
                  aria-label={`Ver tela ${screen.title}`}
                />
              );
            })}
          </div>

          {/* Descrição da Tela Ativa */}
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
              {SCREENS[activeIndex].tag}
            </span>
            <div className="text-sm font-bold text-white mt-0.5">
              {SCREENS[activeIndex].title}
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-0.5">
              {SCREENS[activeIndex].description}
            </p>
          </div>

          {/* Botão de Agendamento Rápido */}
          <div className="pt-2">
            <Link
              href="/schedule"
              className="btn-coral-gradient px-6 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Experimentar Agendamento no App</span>
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
