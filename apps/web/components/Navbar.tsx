"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Trophy, 
  Calendar, 
  LayoutDashboard, 
  ShieldCheck, 
  User as UserIcon, 
  LogIn, 
  LogOut,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { api, getStoredUser, clearStoredToken } from "@/lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ role: string; name: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
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

  const navLinks = [
    { href: "/", label: "Marketplace", icon: Trophy, active: pathname === "/" },
    { href: "/schedule", label: "Agendar Partida", icon: Calendar, active: pathname.startsWith("/schedule") },
    { href: "/player", label: "Portal do Jogador", icon: UserIcon, active: pathname.startsWith("/player") },
    { href: "/manager", label: "Painel do Gestor", icon: LayoutDashboard, active: pathname.startsWith("/manager") },
    { href: "/admin", label: "Super Admin SaaS", icon: ShieldCheck, active: pathname.startsWith("/admin") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Slogan */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-xl tracking-tighter">AG</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-slate-900 tracking-tight">Arena<span className="text-emerald-600">Go</span></span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">v1.0</span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Sua próxima partida a um clique.</p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                    link.active
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${link.active ? "text-emerald-600" : "text-slate-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth & Role Switcher */}
          <div className="flex items-center gap-2">
            {!user && (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 transition shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                Entrar
              </Link>
            )}

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {user ? user.name[0].toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="font-semibold block leading-tight">{user ? user.name : "Acessar Perfil"}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{user ? user.role : "Visitante"}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Quick switcher dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Alternar Perfil Demo</p>
                    <p className="text-xs text-slate-600 mt-0.5">Clique para testar cada perfil de acesso:</p>
                  </div>

                  <div className="py-1">
                    <button
                      disabled={loadingRole}
                      onClick={() => handleQuickLogin("jogador@arenago.com.br", "player123")}
                      className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 text-slate-700"
                    >
                      <div>
                        <span className="font-semibold text-emerald-900 block">Lucas Ferreira (Jogador)</span>
                        <span className="text-[10px] text-slate-500">jogador@arenago.com.br</span>
                      </div>
                      {user?.role === "PLAYER" && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                    </button>

                    <button
                      disabled={loadingRole}
                      onClick={() => handleQuickLogin("gestor@beacharena.com.br", "arena123")}
                      className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-orange-50 text-slate-700"
                    >
                      <div>
                        <span className="font-semibold text-orange-900 block">Carlos Mendes (Gestor Arena)</span>
                        <span className="text-[10px] text-slate-500">gestor@beacharena.com.br</span>
                      </div>
                      {user?.role === "MANAGER" && <span className="w-2 h-2 rounded-full bg-orange-500"></span>}
                    </button>

                    <button
                      disabled={loadingRole}
                      onClick={() => handleQuickLogin("admin@arenago.com.br", "admin123")}
                      className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-indigo-50 text-slate-700"
                    >
                      <div>
                        <span className="font-semibold text-indigo-900 block">Administrador SaaS</span>
                        <span className="text-[10px] text-slate-500">admin@arenago.com.br</span>
                      </div>
                      {user?.role === "SUPERADMIN" && <span className="w-2 h-2 rounded-full bg-indigo-500"></span>}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1 px-2 space-y-1">
                    <Link
                      href="/login"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full text-left px-2 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 rounded-lg flex items-center gap-2 font-medium"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Tela de Login Completa (/login)
                    </Link>

                    {user && (
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium"
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
      
      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-slate-50/80 px-2 py-1.5 text-xs">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-2 py-1 rounded font-medium ${link.active ? "text-emerald-700 font-bold bg-white shadow-xs" : "text-slate-600"}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
