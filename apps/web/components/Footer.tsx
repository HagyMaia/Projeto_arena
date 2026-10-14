"use client";

import { usePathname } from "next/navigation";
import { Trophy, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

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
              Sua próxima partida a um clique. A plataforma completa de marketplace de quadras esportivas e gestão SaaS para donos de arenas.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Conexão Neon Tech PostgreSQL Ativa
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Navegação</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/" className="hover:text-emerald-400 transition">Centros Esportivos</Link></li>
              <li><Link href="/schedule" className="hover:text-emerald-400 transition">Agendar Partida</Link></li>
              <li><Link href="/player" className="hover:text-emerald-400 transition">Portal do Jogador</Link></li>
              <li><Link href="/manager" className="hover:text-emerald-400 transition">Painel do Gestor</Link></li>
              <li><Link href="/admin" className="hover:text-emerald-400 transition">SaaS Super Admin</Link></li>
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
