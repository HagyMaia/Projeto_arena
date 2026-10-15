"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  MessageCircle, 
  ExternalLink, 
  Search, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  BarChart3, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Zap, 
  Activity,
  Phone,
  Flame,
  LayoutDashboard
} from "lucide-react";
import { getOfficialSupportWhatsAppUrl, OFFICIAL_SUPPORT_PHONE_RAW } from "@/lib/utils";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

interface FAQItem {
  question: string;
  category: "Cadastro" | "Reservas" | "Pagamentos" | "Cancelamentos" | "Atendimento";
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    category: "Cadastro",
    question: "Preciso pagar ou criar uma conta para consultar os horários das arenas?",
    answer: "Não! A busca de complexos esportivos, consulta de fotos, quadras e grade de horários livres é 100% aberta e pública. Você só precisará entrar com sua conta (via Google ou e-mail/senha) no momento de concluir sua reserva."
  },
  {
    category: "Reservas",
    question: "Como tenho certeza de que meu horário reservado não será duplicado?",
    answer: "O ArenaGo possui arquitetura de concorrência com bloqueio inteligente de sobreposição de horários. Quando você seleciona e confirma uma reserva, o slot é travado no sistema da arena em tempo real, impedindo overbooking."
  },
  {
    category: "Reservas",
    question: "Posso agendar mais de 1 hora consecutiva no mesmo dia?",
    answer: "Sim! Nossa grade interativa permite selecionar múltiplos horários seguidos para a mesma quadra (por exemplo, das 19h às 21h), calculando automaticamente a tarifa total com eventuais descontos aplicados."
  },
  {
    category: "Pagamentos",
    question: "Quais métodos de pagamento são aceitos na plataforma?",
    answer: "Oferecemos checkout seguro com suporte a Pix Instantâneo (com confirmação automatizada) e Cartão de Crédito. O comprovante e recibo ficam salvos no seu Portal do Jogador."
  },
  {
    category: "Cancelamentos",
    question: "Como funciona a política de cancelamento de uma reserva?",
    answer: "Você pode solicitar o cancelamento diretamente no seu Portal do Jogador (/player). Ao cancelar, a reserva é atualizada no histórico e o horário volta a ficar imediatamente disponível para outros atletas na grade pública da arena."
  },
  {
    category: "Atendimento",
    question: "Como posso falar com o suporte do ArenaGo ou com a arena escolhida?",
    answer: `Nossa Central de Atendimento oficial funciona diretamente via WhatsApp no número ${OFFICIAL_SUPPORT_PHONE_RAW}. Além disso, cada arena credenciada possui seus próprios números diretos de recepção e bar cadastrados na plataforma.`
  }
];

const SPORT_MODALITIES = [
  {
    name: "Futebol Society",
    tag: "Grama Sintética",
    description: "Campos padrão oficial com grama monofilamento, refletores de LED e área de aquecimento.",
    badge: "Mais Popular"
  },
  {
    name: "Beach Tennis",
    tag: "Areia Tratada",
    description: "Quadras com areia branca premium, redes de competição e área de convivência integrada.",
    badge: "Em Alta"
  },
  {
    name: "Futsal",
    tag: "Parquet & Modular",
    description: "Pisos profissionais de alto amortecimento para torneios, treinos e rachões competitivos.",
    badge: "Indoor"
  },
  {
    name: "Futevôlei",
    tag: "Areia Aquecida",
    description: "Estrutura completa com bolas oficiais, duchas externas e arquibancadas para sua turma.",
    badge: "Treino & Lazer"
  },
  {
    name: "Vôlei de Praia & Quadra",
    tag: "Multiesporte",
    description: "Espaços adaptados para duplas ou quartetos com marcação oficial de linhas e antenas.",
    badge: "Competitivo"
  },
  {
    name: "Padel & Tênis",
    tag: "Vidro Panorâmico",
    description: "Quadras modernas com vidro temperado, piso em grama sintética azul e isolamento acústico.",
    badge: "Premium"
  }
];

export default function SobrePage() {
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0);
  const supportUrl = getOfficialSupportWhatsAppUrl();

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* 1. HERO SECTION - Apresentação */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#0D192E] to-[#0B1220] text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Glow de fundo decorativo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 animate-in fade-in slide-in-from-top-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>O Futuro do Esporte Conectado</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Arena<span className="text-emerald-400">Go</span>
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-300 mt-2">
              Sua próxima partida a um clique.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
            O marketplace definitivo que une atletas apaixonados aos melhores complexos esportivos. 
            Agendamentos 100% online, confirmação instantânea e uma plataforma completa de gestão para donos de arenas.
          </p>

          {/* Botões de Ação Principais (CTAs) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5"
            >
              <Search className="w-4 h-4" />
              <span>Encontrar arenas</span>
            </Link>

            <Link
              href="/manager"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 font-semibold text-sm transition"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Sou gestor de arena</span>
            </Link>

            <a
              href={supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/80 font-semibold text-sm transition group"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Falar com suporte</span>
            </a>
          </div>

          {/* Indicadores rápidos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-10 border-t border-slate-800/80 text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Disponibilidade</p>
                <p className="text-sm font-bold text-white">24 horas / 7 dias</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Confirmação</p>
                <p className="text-sm font-bold text-white">Instantânea via Pix</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Segurança</p>
                <p className="text-sm font-bold text-white">Anti-Overbooking</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Atendimento</p>
                <p className="text-sm font-bold text-white">WhatsApp Oficial</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMO FUNCIONA (3 Passos) */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            Simples, Rápido e Descomplicado
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Como funciona o ArenaGo
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
            Organizar a partida com a sua turma nunca foi tão fácil. Em apenas três passos você já está pronto para o jogo:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Linha conectora desktop */}
          <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-emerald-500/40 via-emerald-500 to-emerald-500/40 -translate-y-8 z-0" />

          {/* Passo 1 */}
          <div className="relative z-10 bg-white dark:bg-[#0F172A] rounded-2xl p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl mb-5 shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Encontre uma arena
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Explore o catálogo de complexos esportivos por cidade, confira fotos reais das instalações, comodidades (estacionamento, bar, churrasqueira) e avaliações de outros jogadores.
            </p>
          </div>

          {/* Passo 2 */}
          <div className="relative z-10 bg-white dark:bg-[#0F172A] rounded-2xl p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl mb-5 shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Escolha quadra, data e horários
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Visualize a grade de horários atualizada em tempo real. Filtre pelo tipo de quadra (areia, sintético, parquet) e selecione um ou mais horários desejados sem surpresas de indisponibilidade.
            </p>
          </div>

          {/* Passo 3 */}
          <div className="relative z-10 bg-white dark:bg-[#0F172A] rounded-2xl p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl mb-5 shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Reserve e finalize o pagamento
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Pague com segurança via Pix com confirmação imediata ou cartão de crédito. Receba o voucher com instruções e acompanhe o status diretamente pelo seu Portal do Jogador.
            </p>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm hover:underline"
          >
            <span>Ver grade interativa de agendamento</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 3. MODALIDADES ESPORTIVAS */}
      <section className="py-16 bg-white dark:bg-[#0D1527] border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              Variedade para todos os atletas
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Modalidades Esportivas no ArenaGo
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
              Não importa o seu esporte preferido. Conectamos você às melhores estruturas do país:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPORT_MODALITIES.map((mod, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/80 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {mod.tag}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {mod.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {mod.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {mod.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BENEFÍCIOS (JOGADORES vs. GESTORES) */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            Vantagens Exclusivas
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Feito para quem joga e para quem administra
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
            Eliminamos o atrito de reservas manuais por mensagens e elevamos a gestão de arenas a um patamar profissional.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card Benefícios para Jogadores */}
          <div className="rounded-3xl p-8 bg-gradient-to-br from-white to-emerald-50/40 dark:from-[#0F172A] dark:to-[#08201D] border border-emerald-200 dark:border-emerald-900/60 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Para Jogadores
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  Praticidade, autonomia e conveniência
                </p>
              </div>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    Consulta 24/7 sem esperar no WhatsApp
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Veja horários livres em tempo real a qualquer momento, inclusive de madrugada ou feriados.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    Reservas instantâneas com múltiplos horários
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Agende 1, 2 ou mais horas consecutivas com cálculo automático do valor.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    Portal do Jogador completo (/player)
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Histórico de reservas passadas, partidas agendadas, vouchers e cancelamento rápido.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    Pagamento seguro via Pix ou Cartão
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Sem taxas ocultas, confirmação automática e sem risco de perder o horário para outro grupo.
                  </span>
                </div>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-emerald-100 dark:border-emerald-950/60">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                <span>Explorar arenas agora</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card Benefícios para Gestores */}
          <div className="rounded-3xl p-8 bg-gradient-to-br from-white to-blue-50/30 dark:from-[#0F172A] dark:to-[#0A1628] border border-blue-200 dark:border-blue-900/40 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Para Gestores de Arena
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Controle operacional, financeiro e zero overbooking
                </p>
              </div>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    Timeline operacional em tempo real
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Visão cronológica de todas as quadras do seu complexo com ocupação de hora em hora.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    Preços dinâmicos, descontos e promoções
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Configure tarifas diferenciadas, percentuais de desconto e badges promocionais em horários ociosos.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    Gestão de mensalistas e avulsos
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Cadastre turmas fixas recorrentes e bloqueie quadras para manutenção com total flexibilidade.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    Canais dedicados de WhatsApp por setor
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Configure números diretos para Reservas, Bar e Recepção, preservando sua autonomia.
                  </span>
                </div>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-blue-100 dark:border-blue-950/60">
              <Link
                href="/manager"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
              >
                <span>Acessar Painel do Gestor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 5. RECURSOS EFETIVOS DA PLATAFORMA */}
      <section className="py-16 bg-white dark:bg-[#0D1527] border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              Tecnologia de Ponta
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Recursos Efetivamente Disponíveis no ArenaGo
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
              Todas as ferramentas abaixo estão plenamente integradas e funcionais no ecossistema ArenaGo:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Pagamentos Pix & Cartão
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Fluxo de checkout transparente com processamento imediato e atualização instantânea de status de pagamento.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Agendamento Multi-Horas
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Seleção dinâmica de múltiplos slots por data, com suporte a reservas avulsas e turmas fixas de mensalistas.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Integração WhatsApp
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Central oficial de suporte ({OFFICIAL_SUPPORT_PHONE_RAW}) mais contatos setoriais independentes para cada arena.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Controle RBAC Completo
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Papeis definidos com segurança para Jogadores, Gestores de Arena e Administradores SaaS da plataforma.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PERGUNTAS FREQUENTES (FAQ ACCORDION) */}
      <section className="py-16 lg:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            Tire suas dúvidas
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Perguntas Frequentes (FAQ)
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
            Respostas diretas sobre cadastro, reservas, pagamentos, cancelamento e canais de suporte:
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFAQIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden transition shadow-xs"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.category}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                      {item.question}
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 animate-in fade-in duration-150">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Card de Atendimento Direto no Rodapé do FAQ */}
        <div className="mt-10 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Ainda tem alguma dúvida específica?
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Fale agora com a nossa Central de Atendimento pelo WhatsApp oficial ({OFFICIAL_SUPPORT_PHONE_RAW}).
              </p>
            </div>
          </div>

          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shrink-0 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Falar com Suporte</span>
          </a>
        </div>
      </section>

      {/* 7. BANNER CTA FINAL */}
      <section className="bg-gradient-to-r from-[#0F172A] via-[#0D1D30] to-[#0F172A] text-white py-14 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Pronto para entrar em campo?
          </h3>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-8">
            Encontre a quadra perfeita para a sua próxima partida ou cadastre seu complexo esportivo no ArenaGo hoje mesmo.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition"
            >
              <Search className="w-4 h-4" />
              <span>Encontrar arenas</span>
            </Link>

            <Link
              href="/login?portal=admin&redirect=/manager"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Sou gestor de arena</span>
            </Link>

            <a
              href={supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 font-semibold text-sm transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Falar com suporte</span>
            </a>
          </div>
        </div>
      </section>

      {/* Botão flutuante de WhatsApp Geral */}
      <FloatingWhatsApp />
    </div>
  );
}
