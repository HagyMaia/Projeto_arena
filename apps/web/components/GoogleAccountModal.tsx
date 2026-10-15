"use client";

import { useState } from "react";
import { X, UserPlus, Check, ChevronRight } from "lucide-react";

interface GoogleAccount {
  name: string;
  email: string;
  avatarBg: string;
}

const PRESET_ACCOUNTS: GoogleAccount[] = [
  {
    name: "Hagy Maia",
    email: "hagy.barbosa@gmail.com",
    avatarBg: "bg-emerald-600",
  },
  {
    name: "Atleta ArenaGo",
    email: "atleta.arenago@gmail.com",
    avatarBg: "bg-blue-600",
  },
];

interface GoogleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: { name: string; email: string }) => Promise<void> | void;
  loading?: boolean;
}

export function GoogleAccountModal({
  isOpen,
  onClose,
  onSelectAccount,
  loading = false,
}: GoogleAccountModalProps) {
  const [useOtherAccount, setUseOtherAccount] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customError, setCustomError] = useState("");

  if (!isOpen) return null;

  const handleSelect = (account: { name: string; email: string }) => {
    onSelectAccount(account);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError("");

    const emailTrimmed = customEmail.trim();
    if (!emailTrimmed || !emailTrimmed.includes("@") || !emailTrimmed.includes(".")) {
      setCustomError("Informe um endereço de e-mail do Google válido (ex: seu.email@gmail.com).");
      return;
    }

    const nameTrimmed = customName.trim() || emailTrimmed.split("@")[0];
    onSelectAccount({
      name: nameTrimmed,
      email: emailTrimmed,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full text-slate-800 dark:text-slate-100 shadow-2xl relative border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Top Google Bar */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Fazer login com o Google
            </span>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-left mb-5">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Escolha uma conta
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              para prosseguir para o <span className="font-bold text-emerald-600 dark:text-emerald-400">ArenaGo</span> e receber a confirmação por e-mail
            </p>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Conectando à sua conta Google...
              </p>
            </div>
          ) : !useOtherAccount ? (
            <div className="space-y-2 mb-6">
              {/* Lista de Contas Disponíveis */}
              {PRESET_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelect(acc)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-full ${acc.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-xs`}>
                      {acc.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {acc.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {acc.email}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition" />
                </button>
              ))}

              {/* Botão Usar Outra Conta */}
              <button
                type="button"
                onClick={() => setUseOtherAccount(true)}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition text-left cursor-pointer mt-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 group-hover:text-emerald-500 transition" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Usar outra conta Google
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Digite seu próprio Gmail para receber comprovantes
                  </p>
                </div>
              </button>
            </div>
          ) : (
            /* Formulário para Digitar Conta Específica do Usuário */
            <form onSubmit={handleCustomSubmit} className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Seu Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Hagy Maia"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail do Google (Gmail)
                </label>
                <input
                  type="email"
                  required
                  placeholder="seu.email@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  O comprovante do agendamento com código da reserva será enviado para este e-mail.
                </p>
              </div>

              {customError && (
                <p className="text-xs font-semibold text-rose-500">{customError}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUseOtherAccount(false)}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Acessar com esta Conta</span>
                </button>
              </div>
            </form>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
            Para continuar, o Google compartilhará seu nome, endereço de e-mail e foto do perfil com o ArenaGo.
          </div>
        </div>
      </div>
    </div>
  );
}
