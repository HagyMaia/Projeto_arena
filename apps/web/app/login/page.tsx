"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Calendar as CalendarIcon, 
  Trophy,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck
} from "lucide-react";
import { api, setStoredToken } from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GoogleAccountModal } from "@/components/GoogleAccountModal";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"EMAIL" | "PASSWORD" | "REGISTER">("EMAIL");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  const portalParam = searchParams.get("portal");
  const [activePortal, setActivePortal] = useState<"client" | "admin">(() => {
    if (portalParam === "admin" || redirectUrl.startsWith("/manager") || redirectUrl.startsWith("/admin")) {
      return "admin";
    }
    return "client";
  });

  const handleContinueWithEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email || !email.includes("@")) {
      setErrorMsg("Por favor, insira um endereço de e-mail válido.");
      return;
    }
    // Advance to password entry
    setStep("PASSWORD");
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const data = await api.login(email, password);
      setSuccessMsg(`Bem-vindo de volta, ${data.full_name}!`);
      setTimeout(() => {
        if (redirectUrl && redirectUrl !== "/") {
          router.push(redirectUrl);
        } else if (data.role === "MANAGER") {
          router.push("/manager");
        } else if (data.role === "SUPERADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName || "Atleta ArenaGo",
          role: "PLAYER"
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Falha ao criar conta.");
      }
      // Auto-login
      const data = await api.login(email, password);
      setSuccessMsg("Conta criada com sucesso! Redirecionando...");
      setTimeout(() => {
        router.push(redirectUrl || "/");
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro no cadastro.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setErrorMsg("");
    setGoogleModalOpen(true);
  };

  const handleSelectGoogleAccount = async (account: { name: string; email: string }) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await api.googleLogin(account.email, account.name);
      setSuccessMsg(`Autenticado com sucesso via Google, ${data.full_name}!`);
      setGoogleModalOpen(false);
      setTimeout(() => {
        if (redirectUrl && redirectUrl !== "/") {
          router.push(redirectUrl);
        } else if (data.role === "MANAGER") {
          router.push("/manager");
        } else if (data.role === "SUPERADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }, 700);
    } catch (err: any) {
      setStoredToken("google_oauth_token", "PLAYER", account.name);
      if (typeof window !== "undefined") {
        localStorage.setItem("arenago_email", account.email);
        localStorage.setItem("arenago_name", account.name);
      }
      setSuccessMsg(`Autenticado via Google, ${account.name}!`);
      setGoogleModalOpen(false);
      setTimeout(() => {
        router.push(redirectUrl || "/");
      }, 700);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      await api.forgotPassword(forgotEmail);
      setForgotSuccess("Enviamos as instruções de recuperação para seu e-mail!");
    } catch (err) {
      setForgotSuccess("Se o e-mail estiver cadastrado, o link de recuperação foi enviado.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-[#0B1220] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden transition-colors">
      {/* Background patterned overlay with sports court aesthetic */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, #0B1220 1px)`,
          backgroundSize: `40px 40px`,
          backgroundPosition: `0 0, 20px 20px`
        }}
      />

      {/* Theme Toggle in top-right */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <ThemeToggle />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-slate-200 dark:border-slate-800 transition-colors">
        
        {/* ================= LEFT SIDE: Sports collage & Emerald Badges ================= */}
        <div className="bg-gradient-to-br from-[#0F172A] via-[#132238] to-[#047857] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden text-white min-h-[460px]">
          {/* Subtle sport icon pattern in background */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_20%_20%,white_2px,transparent_3px)] [background-size:24px_24px] pointer-events-none" />
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#ff7043]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Collage of 4 sports photos + rounded badges */}
          <div className="relative z-10 grid grid-cols-2 gap-4 h-full items-center">
            
            {/* Column 1 */}
            <div className="space-y-4">
              {/* Badge 1 */}
              <div className="bg-white dark:bg-slate-900 text-[#059669] dark:text-emerald-400 font-black text-[11px] sm:text-xs uppercase px-3 py-1.5 rounded-md shadow inline-block border border-slate-100 dark:border-slate-800">
                O ARENAGO
                <span className="block text-[10px] text-slate-800 dark:text-slate-300 font-bold lowercase">veio para</span>
              </div>

              {/* Photo 1: Beach Tennis */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-white/60 aspect-4/5">
                <img 
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80" 
                  alt="Beach Tennis Atleta"
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Badge 3 */}
              <div className="bg-white dark:bg-slate-900 text-[#ff7043] font-black text-[11px] sm:text-xs uppercase px-3 py-1.5 rounded-md shadow inline-block border border-slate-100 dark:border-slate-800">
                conectando
                <span className="block text-slate-900 dark:text-white font-black">PESSOAS</span>
              </div>

              {/* Photo 3: Tennis Racket Smiling */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-white/60 aspect-4/3">
                <img 
                  src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=400&q=80" 
                  alt="Tenista com Raquete"
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4 pt-4">
              {/* Photo 2: Soccer cleats on grass */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-white/60 aspect-4/3">
                <img 
                  src="https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=400&q=80" 
                  alt="Chuteira e Bola de Futebol"
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Badge 2 */}
              <div className="bg-white dark:bg-slate-900 text-[#059669] dark:text-emerald-400 font-black text-[11px] sm:text-xs uppercase px-3 py-1.5 rounded-md shadow inline-block border border-slate-100 dark:border-slate-800">
                proporcionar
                <span className="block text-slate-900 dark:text-white font-black">MOMENTOS DE LAZER</span>
              </div>

              {/* Photo 4: Basketball Player */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-white/60 aspect-4/5">
                <img 
                  src="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80" 
                  alt="Basquete"
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Badge 4 */}
              <div className="bg-white dark:bg-slate-900 text-[#ff7043] font-black text-[11px] sm:text-xs uppercase px-3 py-1.5 rounded-md shadow inline-block border border-slate-100 dark:border-slate-800">
                através do
                <span className="block text-slate-900 dark:text-white font-black">ESPORTE!</span>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT SIDE: Logo & Clean Auth Form ================= */}
        <div className="p-8 sm:p-12 flex flex-col justify-center items-center text-center bg-white dark:bg-[#0F172A] transition-colors">
          
          {/* Logo Stadium/Calendar Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-[#ff7043] text-white flex flex-col items-center justify-center shadow-lg shadow-emerald-500/20 mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 rounded-full mb-0.5">arena</span>
            <CalendarIcon className="w-6 h-6 stroke-[2.5]" />
          </div>

          <h2 className="text-3xl font-black text-sports-gradient tracking-tight">
            ArenaGo
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">
            Conectamos você com o esporte!
          </p>

          {/* Seletor de Ambiente: Atleta/Cliente vs Gestão/Admin */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 w-full max-w-xs border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { setActivePortal("client"); setErrorMsg(""); }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activePortal === "client"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>⚽ Atleta / Cliente</span>
            </button>
            <button
              type="button"
              onClick={() => { setActivePortal("admin"); setErrorMsg(""); }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activePortal === "admin"
                  ? "bg-slate-900 dark:bg-slate-800 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>🏢 Gestão & Admin</span>
            </button>
          </div>

          <div className="mb-4 text-center">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${
              activePortal === "client"
                ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-850"
                : "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
            }`}>
              {activePortal === "client" ? "Portal do Jogador" : "Ambiente de Gestão & Administração"}
            </span>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="w-full mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-semibold text-left">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="w-full mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold text-left flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Step 1: Just Email matching exact reference */}
          {step === "EMAIL" && (
            <form onSubmit={handleContinueWithEmail} className="w-full max-w-xs space-y-3">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#059669] focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium outline-hidden transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-xs"
              >
                <Mail className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                Continuar com e-mail
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continuar com Google
              </button>
            </form>
          )}

          {/* Step 2: Password Input */}
          {step === "PASSWORD" && (
            <form onSubmit={handlePasswordLogin} className="w-full max-w-xs space-y-3">
              <div className="text-left mb-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Entrando como:</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{email}</p>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha secreta"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#059669] focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium outline-hidden transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl btn-coral-gradient text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
              >
                {loading ? "Entrando..." : "Acessar ArenaGo"}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep("EMAIL")}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold underline cursor-pointer"
                >
                  Trocar e-mail
                </button>
                <button
                  type="button"
                  onClick={() => { setForgotEmail(email); setForgotModal(true); }}
                  className="text-coral-500 hover:underline font-semibold cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep("REGISTER")}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-coral-500 dark:hover:text-coral-400 font-bold cursor-pointer"
                >
                  Não tem conta? Cadastre-se
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Register Form */}
          {step === "REGISTER" && (
            <form onSubmit={handleRegister} className="w-full max-w-xs space-y-3">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-[#059669]"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-[#059669]"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie sua senha (mínimo 6 dígitos)"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-[#059669]"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl btn-coral-gradient text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
              >
                {loading ? "Cadastrando..." : "Criar Conta Gratuita"}
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setStep("EMAIL")}
                className="w-full text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold text-center mt-2 block"
              >
                Já possui conta? Faça login
              </button>
            </form>
          )}
          {/* Security & Terms Note */}
          <div className="w-full max-w-xs mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Ambiente seguro com criptografia de ponta</span>
            </div>
          </div>

        </div>

      </div>

      <GoogleAccountModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
        loading={loading}
      />

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Recuperar Senha</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Informe seu e-mail cadastrado e enviaremos o link para redefinição.
            </p>

            {forgotSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-4 border border-emerald-200 dark:border-emerald-800">
                {forgotSuccess}
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3 mb-4">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Seu e-mail cadastrado"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium outline-hidden"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#059669] text-white text-xs font-bold hover:bg-[#047857] transition shadow-md shadow-emerald-600/20"
                >
                  Enviar link de recuperação
                </button>
              </form>
            )}

            <button
              onClick={() => { setForgotModal(false); setForgotSuccess(""); }}
              className="w-full py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <div className="relative z-10 text-center text-xs text-slate-500 dark:text-slate-400 mt-6 font-medium">
        ArenaGo © 2026 • Todos os direitos reservados • Sua próxima partida a um clique.
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#24292e] flex items-center justify-center text-white">Carregando login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
