"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Trophy, Shield, Zap, LayoutDashboard, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { getOfficialSupportWhatsAppUrl, OFFICIAL_SUPPORT_PHONE_RAW } from "@/lib/utils";
import { getStoredUser } from "@/lib/api";

export default function Footer() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ role: string; name: string } | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  if (pathname === "/login") {
    return null;
  }

  const supportUrl = getOfficialSupportWhatsAppUrl();
  const isAdmin = user?.role === "MANAGER" || user?.role === "SUPERADMIN";
  const isSuperAdmin = user?.role === "SUPERADMIN";

  return (
    <footer className="bg-[#0F172A] text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
                AG
              </div>
              <span className="font-bold text-xl text-white">
                Arena<span className="text-emerald-400">Go</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm mb-4">
              Sua próxima partida a um clique. A plataforma completa de marketplace de quadras esportivas e gestão integrada para donos de arenas.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Conexão Neon Tech PostgreSQL Ativa
              </span>
              <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/80 transition"
              >
                <span>Central de Atendimento: {OFFICIAL_SUPPORT_PHONE_RAW}</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Institucional & Atleta</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/" className="hover:text-emerald-400 transition">Centros Esportivos</Link></li>
              <li><Link href="/sobre" className="hover:text-emerald-400 transition font-medium text-slate-300">Sobre o ArenaGo</Link></li>
              <li><Link href="/schedule" className="hover:text-emerald-400 transition">Agendar Partida</Link></li>
              <li>
                <a
                  href={supportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition text-emerald-400 flex items-center gap-1.5"
                >
                  Central de Atendimento
                </a>
              </li>
              <li><Link href="/player" className="hover:text-emerald-400 transition">Minhas Reservas</Link></li>

              {/* Seção de Administração: Somente exibida aos administradores autorizados */}
              {isAdmin ? (
                <li className="pt-2 border-t border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                    Acesso de Gestão Ativo
                  </span>
                  <div>
                    <Link href="/manager" className="text-slate-300 hover:text-emerald-400 transition flex items-center gap-1">
                      <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Painel do Gestor</span>
                    </Link>
                  </div>
                  {isSuperAdmin && (
                    <div>
                      <Link href="/admin" className="text-slate-300 hover:text-emerald-400 transition flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>SaaS Super Admin</span>
                      </Link>
                    </div>
                  )}
                </li>
              ) : (
                <li className="pt-2 border-t border-slate-800">
                  <Link href="/login?portal=admin" className="text-slate-500 hover:text-slate-400 text-xs transition">
                    Área para Gestores de Arenas
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Tecnologias</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-emerald-400" /> FastAPI + Async SQLAlchemy</li>
              <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-emerald-400" /> PostgreSQL + GiST Range Exclusions</li>
              <li className="flex items-center gap-2"><Trophy className="w-3.5 h-3.5 text-emerald-400" /> Next.js 15 & Tailwind CSS</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ArenaGo. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Sua próxima partida a um clique.
          </p>
        </div>
      </div>
    </footer>
  );
}
