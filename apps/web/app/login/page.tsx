"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Trophy, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  User, 
  ShieldCheck, 
  Sparkles,
  Zap,
  CalendarCheck
} from "lucide-react";
import { api, setStoredToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isRegister) {
        // Mock registration or standard login fallback
        setSuccessMsg("Conta criada com sucesso! Redirecionando...");
        setStoredToken("demo_token_player", "PLAYER", fullName || "Novo Jogador");
        setTimeout(() => {
          router.push("/player");
        }, 1000);
      } else {
        const data = await api.login(email, password);
        setSuccessMsg(`Bem-vindo, ${data.full_name}!`);
        setTimeout(() => {
          if (data.role === "MANAGER") router.push("/manager");
          else if (data.role === "SUPERADMIN") router.push("/admin");
          else router.push("/player");
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao realizar autenticação.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string, roleName: string) => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const data = await api.login(demoEmail, demoPass);
      setSuccessMsg(`Entrando como ${data.full_name} (${roleName})...`);
      setTimeout(() => {
        if (data.role === "MANAGER") router.push("/manager");
        else if (data.role === "SUPERADMIN") router.push("/admin");
        else router.push("/player");
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Falha ao entrar com usuário demo.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    // Simula autenticação Google OAuth
    setTimeout(() => {
      setStoredToken("google_oauth_token", "PLAYER", "Lucas Silva (Google)");
      setSuccessMsg("Autenticado com sucesso via Google!");
      setTimeout(() => {
        router.push("/player");
      }, 800);
    }, 1000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-slate-950">
      {/* Lado Esquerdo: Visual Esportivo e Branding (Split Screen) */}
      <div className="lg:w-1/2 relative bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
        {/* Fundo com efeito de luz e malha */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.2),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.12),transparent_50%)] pointer-events-none"></div>

        {/* Topo: Logo & Selo */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/25">
              AG
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">
                Arena<span className="text-emerald-400">Go</span>
              </span>
              <p className="text-xs text-emerald-400 font-semibold tracking-wide uppercase">
                Sua próxima partida a um clique
              </p>
            </div>
          </Link>

          <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            +500 Quadras
          </span>
        </div>

        {/* Centro: Chamada e Benefícios */}
        <div className="relative z-10 my-10 lg:my-auto max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            A maior plataforma de esportes do Brasil
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            Reserve sua quadra favorita em <span className="text-emerald-400 underline decoration-emerald-500/40">segundos</span>.
          </h1>

          <p className="text-slate-400 text-sm sm:text-base mt-4 leading-relaxed">
            Beach Tennis, Futebol Society, Futsal, Vôlei de Areia e Padel. Agende horários avulsos ou mensais, pague com PIX instantâneo e jogue com seus amigos sem complicação.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>Disponibilidade de horários atualizada em <strong>tempo real</strong></span>
            </div>

            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>Confirmação instantânea com chave <strong>PIX Copia & Cola</strong></span>
            </div>

            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>Cancelamento flexível grátis até <strong>2 horas antes</strong></span>
            </div>
          </div>
        </div>

        {/* Rodapé do Banner: Depoimento / Avaliação */}
        <div className="relative z-10 bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-800/80 max-w-lg">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center border-2 border-slate-900">LF</div>
              <div className="w-8 h-8 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center border-2 border-slate-900">CM</div>
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center border-2 border-slate-900">AB</div>
            </div>
            <div>
              <p className="text-xs font-bold text-white">Mais de 45.000 partidas agendadas</p>
              <p className="text-[11px] text-slate-400">Avaliação média 4.9/5 ★ pelos jogadores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito: Formulário de Autenticação */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-white">
        <div className="w-full max-w-md">
          {/* Header do Form */}
          <div className="text-center sm:text-left mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isRegister ? "Crie sua conta no ArenaGo" : "Acesse sua conta"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isRegister 
                ? "Junte-se a milhares de atletas e comece a jogar hoje." 
                : "Entre com suas credenciais ou continue com o Google."}
            </p>
          </div>

          {/* Abas Alternadoras: Entrar / Cadastrar */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setErrorMsg(""); setSuccessMsg(""); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                !isRegister ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setErrorMsg(""); setSuccessMsg(""); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                isRegister ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Botão Oficial Google OAuth */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center gap-3 transition shadow-xs active:scale-[0.99] disabled:opacity-50"
          >
            {/* Ícone Google multi-color oficial */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar com o Google</span>
          </button>

          {/* Divisor */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">ou com e-mail</span>
            </div>
          </div>

          {/* Mensagens de Sucesso ou Erro */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {successMsg}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Nome Completo</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Lucas Silva"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">WhatsApp / Celular</label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Senha</label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => alert("Digite o e-mail de recuperação cadastrado para receber o link.")}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 transition flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <span>Aguarde...</span>
              ) : (
                <>
                  <span>{isRegister ? "Criar Conta & Continuar" : "Entrar na Conta"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Seção de Demonstração com 1-Clique (Perfis Rápidos) */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Atalhos Rápidos de Demonstração
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">1 Clique</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("jogador@arenago.com.br", "player123", "Jogador")}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-left transition group"
              >
                <span className="block text-[11px] font-black text-emerald-900 group-hover:text-emerald-950">Atleta</span>
                <span className="text-[10px] text-emerald-700 block">Lucas S.</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("gestor@beacharena.com.br", "arena123", "Gestor")}
                className="p-2.5 rounded-xl border border-orange-200 bg-orange-50/60 hover:bg-orange-100 text-left transition group"
              >
                <span className="block text-[11px] font-black text-orange-900 group-hover:text-orange-950">Gestor</span>
                <span className="text-[10px] text-orange-700 block">Beach Arena</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("admin@arenago.com.br", "admin123", "Super Admin")}
                className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-left transition group"
              >
                <span className="block text-[11px] font-black text-indigo-900 group-hover:text-indigo-950">Admin</span>
                <span className="text-[10px] text-indigo-700 block">SaaS Global</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
