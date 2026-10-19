"use client";

import React from "react";
import Link from "next/link";

export interface ArenaGoLogoProps {
  /**
   * Variante de exibição da logo:
   * - "full": Ícone + texto "ArenaGo" + subtítulo/badge opcionais
   * - "mark": Apenas o símbolo gráfico (ícone do estádio/AG)
   * - "wordmark": Apenas a tipografia estilizada "ArenaGo"
   */
  variant?: "full" | "mark" | "wordmark";
  /**
   * Tamanho proporcional do elemento:
   * - "xs": 24px de altura
   * - "sm": 32px de altura
   * - "md": 40px de altura (padrão de headers)
   * - "lg": 48px de altura
   * - "xl": 64px de altura (telas de boas-vindas e login)
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Tema de contraste da tipografia:
   * - "auto": Adapta automaticamente conforme classes dark/light
   * - "light": Para fundos escuros (texto branco / esmeralda)
   * - "dark": Para fundos claros (texto azul-marinho #0F172A / esmeralda)
   */
  theme?: "auto" | "light" | "dark";
  /**
   * Tag/badge descritiva complementar (ex: "Admin", "Gestão", "Atleta", "v1.0")
   */
  badge?: string;
  /**
   * Se exibe o slogan institucional abaixo da marca
   */
  subtitle?: boolean | string;
  /**
   * Alias opcional para subtítulo (compatibilidade)
   */
  showSubtitle?: boolean;
  /**
   * Se informado, envolve o logo com tag <Link> para a rota informada
   */
  href?: string;
  /**
   * Classes CSS personalizadas adicionais
   */
  className?: string;
}

const SIZE_CONFIGS = {
  xs: { iconSize: 24, fontSize: "text-base", badgeSize: "text-[9px] px-1 py-0.2", subSize: "text-[9px]" },
  sm: { iconSize: 32, fontSize: "text-lg", badgeSize: "text-[9px] px-1.5 py-0.5", subSize: "text-[10px]" },
  md: { iconSize: 40, fontSize: "text-xl", badgeSize: "text-[10px] px-2 py-0.5", subSize: "text-[11px]" },
  lg: { iconSize: 48, fontSize: "text-2xl", badgeSize: "text-[11px] px-2 py-0.5", subSize: "text-xs" },
  xl: { iconSize: 60, fontSize: "text-3xl", badgeSize: "text-xs px-2.5 py-1", subSize: "text-xs sm:text-sm" },
};

/**
 * Ícone Vetorial Oficial ArenaGo
 * Simboliza um complexo esportivo / arena arquitetônica integrada
 * com o dinamismo vetorial de "Go" (movimento, linhas de quadra e esportes).
 * Cores oficiais da marca: Verde-esmeralda (#059669 / #10B981), Azul-marinho (#0F172A) e Branco (#FFFFFF).
 */
export function ArenaGoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  const radius = Math.round(size * 0.28);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform ${className}`}
      aria-label="ArenaGo Símbolo"
    >
      <defs>
        {/* Gradiente Oficial: Esmeralda Profundo -> Esmeralda Vibrante */}
        <linearGradient id="arenago-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Gradiente Esportivo Coral Vibrante (para o acelerador 'Go') */}
        <linearGradient id="arenago-sport-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#0D9488" />
          <stop offset="100%" stopColor="#FF7043" />
        </linearGradient>

        {/* Gradiente de fundo do escudo */}
        <linearGradient id="arenago-base-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>

        {/* Sombra suave interna do escudo */}
        <filter id="arenago-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#059669" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Escudo / Base Esportiva com bordas curvadas de precisão */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx={radius}
        fill="url(#arenago-base-grad)"
        stroke="#059669"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />

      {/* Arco Superior da Arena / Estádio (Curvatura arquitetônica de teto de complexo esportivo) */}
      <path
        d="M10 24C10 16.268 16.268 10 24 10C31.732 10 38 16.268 38 24"
        stroke="url(#arenago-emerald-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Linhas de Quadra Interna e Linha Central Esportiva */}
      <circle cx="24" cy="24" r="5" stroke="#10B981" strokeWidth="1.5" strokeOpacity="0.4" />
      <path d="M12 24H36" stroke="#10B981" strokeWidth="1.2" strokeOpacity="0.3" strokeDasharray="2 2" />

      {/* Monograma 'A' estilizado como arena e pilar esportivo */}
      <path
        d="M17 35L24 17L31 35"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 29.5H28.5"
        stroke="url(#arenago-emerald-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Símbolo dinâmico 'Go': seta / acelerador esportivo em direção ao futuro e ao gol */}
      <path
        d="M26 22L33 22L30 25"
        stroke="#FF7043"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="33" cy="22" r="1.5" fill="#FF7043" />
    </svg>
  );
}

export function ArenaGoLogo({
  variant = "full",
  size = "md",
  theme = "auto",
  badge,
  subtitle,
  href,
  className = "",
}: ArenaGoLogoProps) {
  const config = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;

  // Determinar cores da tipografia conforme o tema
  let arenaTextColor = "text-[#0F172A] dark:text-white";
  let subtitleColor = "text-slate-500 dark:text-slate-400";
  let badgeClasses = "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80";

  if (theme === "light") {
    arenaTextColor = "text-white";
    subtitleColor = "text-slate-300";
    badgeClasses = "bg-emerald-950/80 text-emerald-300 border border-emerald-800";
  } else if (theme === "dark") {
    arenaTextColor = "text-[#0F172A]";
    subtitleColor = "text-slate-600";
    badgeClasses = "bg-emerald-100 text-emerald-800 border border-emerald-200";
  }

  const defaultSubtitleText = typeof subtitle === "string" ? subtitle : "Sua próxima partida a um clique.";

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Símbolo da Marca */}
      {variant !== "wordmark" && (
        <div className="relative group-hover:scale-105 transition-transform duration-200 shrink-0">
          <ArenaGoMark size={config.iconSize} />
        </div>
      )}

      {/* Wordmark Tipográfico & Metadados */}
      {variant !== "mark" && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 leading-none">
            <span className={`font-black ${config.fontSize} tracking-tight ${arenaTextColor} transition-colors`}>
              Arena
              <span className="text-sports-gradient ml-[0.5px]">Go</span>
            </span>

            {badge && (
              <span
                className={`font-extrabold uppercase tracking-wider rounded-md ${config.badgeSize} ${badgeClasses} shadow-xs`}
              >
                {badge}
              </span>
            )}
          </div>

          {subtitle && (
            <p className={`${config.subSize} font-medium ${subtitleColor} mt-1 leading-tight hidden sm:block`}>
              {defaultSubtitleText}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-hidden" title="ArenaGo">
        {content}
      </Link>
    );
  }

  return content;
}

export default ArenaGoLogo;
