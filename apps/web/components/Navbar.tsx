"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { 
  Trophy, 
  Calendar, 
  LayoutDashboard, 
  ShieldCheck, 
  User as UserIcon, 
  LogIn, 
  LogOut,
  ChevronDown,
  ExternalLink,
  Info,
  Menu,
  X,
  MessageCircle,
  Eye,
  Sparkles
} from "lucide-react";
import { api, getStoredUser, clearStoredToken } from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getOfficialSupportWhatsAppUrl, OFFICIAL_SUPPORT_PHONE_RAW } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ role: string; name: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const officialSupportUrl = getOfficialSupportWhatsAppUrl();

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    // Fecha menus ao navegar de rota
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQuickLogin = async (email: string, pass: string) => {
    setLoadingRole(true);
    try {
      const data = await api.login(email, pass);
      setUser({ role: data.role, name: data.full_name });
      setDropdownOpen(false);
      setMobileMenuOpen(false);
      window.location.reload();
    } catch (err: any) {
      alert(`Erro ao autenticar: ${err.message}`);
    } finally {
      setLoadingRole(false);
    }
  };

  const handleLogout = () => {
    clearStoredToken();
    setUser(null);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    window.location.href = "/";
  };

  // Na tela de login, não exibe navbar para preservar o layout split-screen
  if (pathname === "/login") {
    return null;
  }

  const isAdmin = user?.role === "MANAGER" || user?.role === "SUPERADMIN";
  const isSuperAdmin = user?.role === "SUPERADMIN";
  const isPlayer = user?.role === "PLAYER";
  const isGuest = !user;

  // Na página inicial ("/"), o marketplace possui seu próprio cabeçalho oficial de atleta (referência Agendei Quadras)
  if (pathname === "/") {
    if (isAdmin) {
      return (
        <div className="bg-[#0B1220] border-b border-slate-800 text-slate-300 text-xs py-1.5 px-4 sm:px-8 transition-all relative z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-white text-[11px]">Modo Gestão Ativo</span>
              <span className="text-slate-500 text-[10px] hidden sm:inline">| Visão do Marketplace</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/manager" className="text-emerald-400 hover:text-emerald-300 font-bold text-[11px] flex items-center gap-1">
                <span>Ir para Painel do Gestor</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              {isSuperAdmin && (
                <Link href="/admin" className="text-slate-400 hover:text-white font-bold text-[11px]">
                  SuperAdmin
                </Link>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  // Na tela de checkout, exibe a barra minimalista
  const isMinimalRoute = pathname.startsWith("/checkout");

  if (isMinimalRoute) {
    return (
      <div className="bg-[#0F172A] text-slate-300 text-[11px] py-1.5 px-4 border-b border-slate-800 z-50 relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <Link href="/" className="font-semibold text-slate-200 hover:text-emerald-400 transition hidden sm:inline">
            ArenaGo Marketplace
          </Link>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400">Checkout Seguro</span>
        </div>

        <div className="flex items-center gap-3 font-medium">
          {/* Suporte WhatsApp rápido no checkout */}
          <a
            href={officialSupportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            title="Dúvidas com seu pagamento? Chame a Central de Atendimento"
          >
            <MessageCircle className="w-3 h-3" />
            <span className="hidden xs:inline">Central de Atendimento</span>
          </a>

          <span className="text-slate-700 hidden xs:inline">|</span>

          <Link
            href="/sobre"
            className="text-slate-400 hover:text-slate-200 transition-colors hidden sm:inline"
          >
            Sobre
          </Link>

          {/* Somente exibe links de gestão no checkout se for administrador autenticado */}
          {isAdmin && (
            <>
              <span className="text-slate-700">|</span>
              <Link
                href="/manager"
                className="text-slate-300 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <span>Painel do Gestor</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </Link>
            </>
          )}

          {isSuperAdmin && (
            <>
              <span className="text-slate-700">|</span>
              <Link
                href="/admin"
                className="text-slate-400 hover:text-emerald-400 transition-colors hidden xs:inline"
              >
                SaaS Admin
              </Link>
            </>
          )}

          <span className="text-slate-700 hidden xs:inline">|</span>

          <ThemeToggle />

          {/* Menu de Perfil Seguro no Checkout */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-slate-300 hover:text-white flex items-center gap-1 font-semibold text-[10px] bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700 cursor-pointer"
            >
              <span>{user ? user.name : "Entrar"}</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-[#0F172A] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95">
                {user ? (
                  <>
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                        {isAdmin ? "Administração" : "Conta Atleta"}
                      </span>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">{user.name}</span>
                    </div>
                    <div className="py-1 px-1">
                      <Link
                        href="/player"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2"
                      >
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        Minhas Reservas
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/manager"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                          Painel do Gestor
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sair
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-2 space-y-1">
                    <Link
                      href="/login"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full text-center py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Fazer Login
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Definição de Links com Separação Estrita de Papéis:
  // - O Cliente (PLAYER ou VISITANTE) vê apenas visualizações de cliente (Marketplace, Agendamento, Institucional e Minhas Reservas).
  // - A Administração (GESTOR e SUPERADMIN) tem visão do todo (módulos de gestão + visão do cliente).
  const clientNavLinks = [
    { href: "/", label: "Arenas", icon: Trophy, active: pathname === "/" },
    { href: "/player", label: isPlayer ? "Minhas Reservas" : "Reservas", icon: Calendar, active: pathname.startsWith("/player") },
    { href: "/sobre", label: "Sobre o ArenaGo", icon: Sparkles, active: pathname.startsWith("/sobre") },
  ];

  const adminExtraLinks = [
    { href: "/manager", label: "Painel do Gestor", icon: LayoutDashboard, active: pathname.startsWith("/manager") },
    ...(isSuperAdmin ? [{ href: "/admin", label: "Super Admin SaaS", icon: ShieldCheck, active: pathname.startsWith("/admin") }] : []),
  ];

  const visibleNavLinks = isAdmin ? [...clientNavLinks, ...adminExtraLinks] : clientNavLinks;

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      
      {/* =========================================================================
          BARRA DE GESTÃO & ADMINISTRAÇÃO (Exclusiva para Administradores / Gestores)
          Permite que a administração acesse todo o sistema e alterne facilmente
          entre a visão operacional/administrativa e a visão pública do cliente.
         ========================================================================= */}
      {isAdmin && (
        <div className="bg-[#0B1220] border-b border-slate-800 text-slate-300 text-xs py-1.5 px-4 sm:px-8 transition-all">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-white tracking-tight">Ambiente de Administração & Gestão</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-emerald-400 font-semibold text-[11px] uppercase hidden sm:inline">
                {isSuperAdmin ? "SaaS Super Admin (Acesso Total)" : "Gestor de Complexo Esportivo"}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-xs">
              <Link
                href="/manager"
                className={`px-2.5 py-0.5 rounded-md font-semibold transition ${
                  pathname.startsWith("/manager")
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                Painel do Gestor
              </Link>

              {isSuperAdmin && (
                <Link
                  href="/admin"
                  className={`px-2.5 py-0.5 rounded-md font-semibold transition ${
                    pathname.startsWith("/admin")
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  SaaS Admin
                </Link>
              )}

              <span className="text-slate-700">|</span>

              <Link
                href="/"
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition ${
                  pathname === "/" || pathname.startsWith("/schedule") || pathname.startsWith("/sobre") || pathname.startsWith("/player")
                    ? "text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/60"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Acessar o marketplace e experiência do jogador"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xs:inline">Ver Visão do Cliente</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          BARRA DE NAVEGAÇÃO PRINCIPAL (Para todos, com conteúdo estritamente separado)
         ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-[#ff7043] flex items-center justify-center text-white shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-xl tracking-tighter">AG</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight">
                  Arena<span className="text-sports-gradient">Go</span>
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                  {isAdmin ? "admin" : "v1.0"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Sua próxima partida a um clique.
              </p>
            </div>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                    link.active
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border-b-2 border-emerald-500"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${link.active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Seletor de Tema Claro / Escuro / Sistema */}
            <ThemeToggle />

            {/* Botão Central de Atendimento no Header Desktop */}
            <a
              href={officialSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-semibold text-emerald-800 dark:text-emerald-300 transition"
              title={`Falar com a Central de Atendimento (${OFFICIAL_SUPPORT_PHONE_RAW})`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Suporte</span>
            </a>

            {!user && (
              <>
                <Link
                  href="/login?portal=admin"
                  className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#ff7043]/30 bg-[#ff7043]/10 hover:bg-[#ff7043]/20 text-xs font-semibold text-[#f4511e] dark:text-[#ff7043] transition"
                  title="Tem uma arena ou centro esportivo? Cadastre-se na plataforma"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#ff7043]" />
                  <span>Cadastre sua Quadra</span>
                </Link>

                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full btn-coral-gradient text-xs font-bold text-white transition shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </Link>
              </>
            )}

            {/* ===============================================================
                MENU DROPDOWN DO USUÁRIO COM SEPARAÇÃO RIGOROSA
                - Cliente: vê apenas perfil de cliente, reservas, sobre, suporte e logout.
                - Visitante: vê opção de login, cadastro, sobre, suporte e link discreto p/ gestores.
                - Administração: vê acesso total com módulos de gestão e ferramentas de teste.
               =============================================================== */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0F172A] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition shadow-xs cursor-pointer"
                aria-label="Abrir menu do usuário"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {user ? user.name[0].toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="font-semibold block leading-tight text-slate-900 dark:text-white max-w-[120px] truncate">
                    {user ? user.name : "Acessar Conta"}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">
                    {isAdmin ? (isSuperAdmin ? "Super Admin" : "Gestor") : isPlayer ? "Atleta" : "Visitante"}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <>
                  {/* CASO 1: CLIENTE AUTENTICADO (Jogador/Atleta) -> Visão Exclusiva de Cliente */}
                  {isPlayer && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Conta de Atleta
                          </span>
                        </div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          Área Exclusiva do Cliente
                        </p>
                      </div>

                      <div className="py-1 px-2 space-y-0.5">
                        <Link
                          href="/player"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2.5 font-medium transition"
                        >
                          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Minhas Reservas</span>
                        </Link>
                        <Link
                          href="/schedule"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2.5 font-medium transition"
                        >
                          <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Agendar Nova Partida</span>
                        </Link>
                        <Link
                          href="/sobre"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2.5 font-medium transition"
                        >
                          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Sobre o ArenaGo</span>
                        </Link>
                        <a
                          href={officialSupportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full text-left px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg flex items-center justify-between font-medium transition group"
                        >
                          <div className="flex items-center gap-2.5">
                            <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-semibold">Central de Atendimento</span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1 px-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg flex items-center gap-2.5 font-medium transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Encerrar Sessão</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CASO 2: VISITANTE NÃO AUTENTICADO -> Visão de Entrada Limpa */}
                  {isGuest && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                          Acesse sua Conta
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Entre para reservar quadras e acompanhar suas partidas.
                        </p>
                      </div>

                      <div className="p-2 space-y-1">
                        <Link
                          href="/login"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full text-center py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Entrar como Atleta</span>
                        </Link>
                        <Link
                          href="/sobre"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 font-medium transition"
                        >
                          <Info className="w-4 h-4 text-emerald-600" />
                          <span>Sobre o ArenaGo</span>
                        </Link>
                        <a
                          href={officialSupportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full text-left px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg flex items-center justify-between font-medium transition"
                        >
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-emerald-600" />
                            <span className="font-semibold">Central de Atendimento</span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>

                      {/* Link discreto para Gestor de Arena (evita poluição da visão do cliente) */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-2 mt-1 px-3 pb-1">
                        <Link
                          href="/login?portal=admin"
                          onClick={() => setDropdownOpen(false)}
                          className="text-[11px] text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition"
                        >
                          <LayoutDashboard className="w-3 h-3" />
                          <span>Área exclusiva para Gestores de Arenas</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* CASO 3: ADMINISTRAÇÃO AUTENTICADA (Gestor ou SuperAdmin) -> Visão do Todo */}
                  {isAdmin && (
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            {isSuperAdmin ? "Super Admin SaaS" : "Gestor de Arena"}
                          </span>
                        </div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5 truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Acesso Total: Painéis de Gestão + Visão do Cliente
                        </p>
                      </div>

                      {/* Painéis Administrativos */}
                      <div className="py-1 px-2 space-y-0.5">
                        <div className="px-2 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Módulos Administrativos
                        </div>
                        <Link
                          href="/manager"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full text-left px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2.5 font-semibold transition"
                        >
                          <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                          <span>Painel do Gestor (Timeline)</span>
                        </Link>
                        {isSuperAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="w-full text-left px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2.5 font-semibold transition"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>SaaS Super Admin</span>
                          </Link>
                        )}
                      </div>

                      {/* Visão do Cliente */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1 px-2 space-y-0.5">
                        <div className="px-2 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Visão do Cliente (Marketplace)
                        </div>
                        <Link
                          href="/"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2.5 transition"
                        >
                          <Trophy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Marketplace de Arenas</span>
                        </Link>
                        <Link
                          href="/player"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2.5 transition"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>Portal do Jogador (Reservas)</span>
                        </Link>
                      </div>

                      {/* Ferramentas de Testes e Alternância de Papéis (Apenas para Gestão) */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1 px-2">
                        <div className="px-2 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Simular Perfil de Testes
                        </div>
                        <div className="grid grid-cols-3 gap-1 py-1">
                          <button
                            type="button"
                            disabled={loadingRole}
                            onClick={() => handleQuickLogin("jogador@arenago.com.br", "player123")}
                            className="px-2 py-1 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 text-center transition"
                            title="Alternar para visão de Jogador"
                          >
                            Jogador
                          </button>
                          <button
                            type="button"
                            disabled={loadingRole}
                            onClick={() => handleQuickLogin("gestor@beacharena.com.br", "arena123")}
                            className="px-2 py-1 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 text-center transition"
                            title="Alternar para Gestor"
                          >
                            Gestor
                          </button>
                          <button
                            type="button"
                            disabled={loadingRole}
                            onClick={() => handleQuickLogin("admin@arenago.com.br", "admin123")}
                            className="px-2 py-1 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 text-center transition"
                            title="Alternar para Super Admin"
                          >
                            Admin
                          </button>
                        </div>
                      </div>

                      {/* Suporte & Logout */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1 px-2 space-y-0.5">
                        <a
                          href={officialSupportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full text-left px-3 py-1.5 text-xs text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg flex items-center justify-between font-medium transition"
                        >
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Central de Atendimento</span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg flex items-center gap-2 font-medium transition"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Encerrar Sessão</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Botão Hambúrguer Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition"
              aria-label="Abrir menu mobile"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Drawer de Navegação Mobile com Separação */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-3">
          {/* Seção de Links */}
          <div className="space-y-1">
            {visibleNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    link.active
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${link.active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Destaque Central de Atendimento no Mobile */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <a
              href={officialSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-semibold text-xs transition active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block leading-tight">Central de Atendimento</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    {OFFICIAL_SUPPORT_PHONE_RAW}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>

          {!user ? (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl btn-coral-gradient text-white font-bold text-xs shadow-md"
              >
                <LogIn className="w-4 h-4" />
                Acessar Plataforma / Login
              </Link>
            </div>
          ) : (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-rose-600 bg-rose-50 dark:bg-rose-950/30 font-semibold text-xs transition"
              >
                <LogOut className="w-4 h-4" />
                Encerrar Sessão ({user.name})
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
