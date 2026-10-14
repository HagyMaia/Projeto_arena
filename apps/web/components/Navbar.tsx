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
  ExternalLink
} from "lucide-react";
import { api, getStoredUser, clearStoredToken } from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ role: string; name: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

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
    window.location.href = "/";
  };

  // Na tela de login, não exibe navbar para preservar o layout split-screen
  if (pathname === "/login") {
    return null;
  }

  // Na tela de checkout, exibe a barra minimalista
  const isMinimalRoute = pathname.startsWith("/checkout");

  if (isMinimalRoute) {
    return (
      <div className="bg-[#0F172A] text-slate-300 text-[11px] py-1.5 px-4 border-b border-slate-800 z-50 relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-200 hidden sm:inline">ArenaGo Marketplace</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400">Checkout Seguro</span>
        </div>

        <div className="flex items-center gap-3 font-medium">
          {/* RBAC: Gestor / SuperAdmin veem seus painéis */}
          {(user?.role === "MANAGER" || user?.role === "SUPERADMIN") && (
            <Link
              href="/manager"
              className="text-slate-300 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <span>Painel do Gestor</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </Link>
          )}

          {user?.role === "SUPERADMIN" && (
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

          {/* Seletor rápido de Perfil Demo */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-slate-300 hover:text-white flex items-center gap-1 font-semibold text-[10px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
            >
              <span>{user ? user.name : "Perfil Demo"}</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-[#0F172A] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  Perfis de Demonstração
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("jogador@arenago.com.br", "player123")}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Lucas Ferreira (Jogador)</span>
                    <span className="text-[10px] text-slate-400">jogador@arenago.com.br</span>
                  </div>
                  {user?.role === "PLAYER" && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("gestor@beacharena.com.br", "arena123")}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Carlos Gestor (Arena)</span>
                    <span className="text-[10px] text-slate-400">gestor@beacharena.com.br</span>
                  </div>
                  {user?.role === "MANAGER" && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("admin@arenago.com.br", "admin123")}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Admin SaaS</span>
                    <span className="text-[10px] text-slate-400">admin@arenago.com.br</span>
                  </div>
                  {user?.role === "SUPERADMIN" && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // RBAC estrito de navegação:
  // Jogadores e visitantes só veem marketplace, agendamento e portal do jogador.
  // Gestores têm acesso adicional ao Painel do Gestor.
  // SuperAdmin tem acesso total.
  const allNavLinks = [
    { href: "/", label: "Marketplace", icon: Trophy, active: pathname === "/", roles: ["ALL"] },
    { href: "/schedule", label: "Agendar Partida", icon: Calendar, active: pathname.startsWith("/schedule"), roles: ["ALL"] },
    { href: "/player", label: "Portal do Jogador", icon: UserIcon, active: pathname.startsWith("/player"), roles: ["ALL"] },
    { href: "/manager", label: "Painel do Gestor", icon: LayoutDashboard, active: pathname.startsWith("/manager"), roles: ["MANAGER", "SUPERADMIN"] },
    { href: "/admin", label: "Super Admin SaaS", icon: ShieldCheck, active: pathname.startsWith("/admin"), roles: ["SUPERADMIN"] },
  ];

  const currentRole = user?.role || "GUEST";
  const visibleNavLinks = allNavLinks.filter((link) => {
    if (link.roles.includes("ALL")) return true;
    return link.roles.includes(currentRole);
  });

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-xl tracking-tighter">AG</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
                  Arena<span className="text-emerald-600 dark:text-emerald-400">Go</span>
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Sua próxima partida a um clique.
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {visibleNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                    link.active
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${link.active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Seletor de Tema Claro / Escuro / Sistema */}
            <ThemeToggle />

            {!user && (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-bold text-emerald-800 dark:text-emerald-300 transition shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Entrar
              </Link>
            )}

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0F172A] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {user ? user.name[0].toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="font-semibold block leading-tight text-slate-900 dark:text-white">
                    {user ? user.name : "Acessar Perfil"}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">
                    {user ? user.role : "Visitante"}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0F172A] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Alternar Perfil Demo
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Clique para testar cada perfil de acesso:
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      disabled={loadingRole}
                      onClick={() => handleQuickLogin("jogador@arenago.com.br", "player123")}
                      className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          Lucas Ferreira (Jogador)
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          jogador@arenago.com.br
                        </span>
                      </div>
                      {user?.role === "PLAYER" && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                    </button>

                    <button
                      disabled={loadingRole}
                      onClick={() => handleQuickLogin("gestor@beacharena.com.br", "arena123")}
                      className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          Carlos Mendes (Gestor Arena)
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          gestor@beacharena.com.br
                        </span>
                      </div>
                      {user?.role === "MANAGER" && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                    </button>

                    <button
                      disabled={loadingRole}
                      onClick={() => handleQuickLogin("admin@arenago.com.br", "admin123")}
                      className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          Administrador SaaS
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          admin@arenago.com.br
                        </span>
                      </div>
                      {user?.role === "SUPERADMIN" && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1 px-2 space-y-1">
                    <Link
                      href="/login"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full text-left px-2 py-1.5 text-xs text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 font-medium"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Tela de Login Completa (/login)
                    </Link>

                    {user && (
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Encerrar Sessão
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
