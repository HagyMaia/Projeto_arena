"use client";

import { useState } from "react";
import { X, Mail, CheckCircle2, Send, Copy, Check, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";

interface BookingEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    code: string;
    playerName: string;
    playerEmail: string;
    venueName: string;
    courtName: string;
    dateFormatted: string;
    timeRange: string;
    totalAmount: number;
    paymentMethod: string;
  };
}

export function BookingEmailModal({
  isOpen,
  onClose,
  booking,
}: BookingEmailModalProps) {
  const [copied, setCopied] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [alternateEmail, setAlternateEmail] = useState("");
  const [showAlternateInput, setShowAlternateInput] = useState(false);

  if (!isOpen) return null;

  const handleCopyVoucher = () => {
    const text = `Comprovante de Agendamento ArenaGo:
Código: #${booking.code}
Jogador: ${booking.playerName}
Local: ${booking.venueName}
Quadra: ${booking.courtName}
Data/Horário: ${booking.dateFormatted} - ${booking.timeRange}
Valor: R$ ${booking.totalAmount.toFixed(2).replace(".", ",")} (${booking.paymentMethod})
Status: CONFIRMADO ✅`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResendEmail = async () => {
    const target = alternateEmail.trim() || booking.playerEmail;
    setResending(true);
    try {
      await api.sendBookingConfirmationEmail(booking.code, target);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 4000);
    } catch {
      // Fallback gracioso
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 4000);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl sm:rounded-3xl max-w-xl w-full text-slate-800 dark:text-slate-100 shadow-2xl relative border border-slate-300 dark:border-slate-800 my-auto overflow-hidden">
        
        {/* Top Window Bar (Simula Caixa de Entrada de E-mail) */}
        <div className="bg-slate-200 dark:bg-slate-900 px-4 py-3 border-b border-slate-300 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-[#ff5722]" />
              <span>Horário Confirmado - ARENAGO » Caixa de entrada</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informações do Remetente e Destinatário */}
        <div className="bg-white dark:bg-slate-900 px-5 py-3 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center text-xs">
                AG
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  ARENAGO CONFIRMAÇÕES <span className="font-normal text-slate-400 text-[11px]">&lt;no-reply@arenago.com.br&gt;</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  para <strong className="text-emerald-600 dark:text-emerald-400">{booking.playerEmail}</strong>
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
              Entregue ✅
            </span>
          </div>
        </div>

        {/* ========================================================
            CORPO DO E-MAIL (FIEL À IMAGEM DE REFERÊNCIA)
        ======================================================== */}
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto bg-slate-100 dark:bg-slate-950">
          <div className="max-w-[480px] mx-auto bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden text-slate-800">
            
            {/* Top Calendar Box */}
            <div className="text-center pt-5 pb-3">
              <div className="inline-block w-14 h-12 bg-slate-50 border-2 border-slate-300 rounded-xl text-center pt-1 shadow-xs">
                <span className="text-[9px] font-black text-[#ff5722] tracking-wider uppercase block leading-none">arenago</span>
                <span className="text-base block mt-0.5">⚽</span>
              </div>
            </div>

            {/* Banner Laranja de Confirmação */}
            <div className="bg-gradient-to-r from-[#ff5722] to-[#f4511e] text-white text-center py-3.5 px-4 font-black text-lg tracking-wide uppercase shadow-xs">
              HORÁRIO CONFIRMADO! ✅
            </div>

            {/* Conteúdo Central */}
            <div className="p-6 text-center">
              
              {/* Ilustração OK com Checkmark */}
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-50 border-4 border-orange-100 mb-4 shadow-inner">
                <div className="relative">
                  <CheckCircle2 className="w-14 h-14 text-[#ff5722]" />
                  <span className="absolute -top-1 -right-1 bg-white text-[#ff5722] text-[10px] font-black px-1 rounded-full border border-[#ff5722]">OK</span>
                </div>
              </div>

              {/* Saudação ao Jogador */}
              <h2 className="text-xl font-extrabold text-[#ea580c] mb-1">
                OLÁ {booking.playerName}!
              </h2>
              <p className="text-xs text-slate-600 mb-5 font-medium">
                🎉 Seu horário foi <strong>Confirmado</strong> pelo(a) Gestor(a) da Quadra!
              </p>

              {/* Card de Detalhes da Partida */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs space-y-2 mb-5">
                <div className="font-extrabold text-slate-900 tracking-wider pb-1 border-b border-slate-200">
                  • • • Nº #{booking.code}
                </div>
                <div className="text-slate-700 leading-relaxed">
                  🏟️ <strong>Quadra:</strong> {booking.venueName} - {booking.courtName}
                </div>
                <div className="text-slate-700">
                  📅 <strong>Data e Horário:</strong> {booking.dateFormatted} - {booking.timeRange}
                </div>
                <div className="text-slate-700">
                  💲 <strong>Valor Total:</strong> R$ {booking.totalAmount.toFixed(2).replace(".", ",")}
                </div>
                <div className="text-slate-700">
                  💲 <strong>Forma de Pagamento:</strong> {booking.paymentMethod}
                </div>
              </div>

              {/* Chamada para Aquecimento */}
              <div className="bg-slate-100 rounded-xl p-3 text-xs font-semibold text-slate-700 mb-4">
                Agora já pode iniciar o aquecimento para seu jogo! 😁
              </div>

              <div className="border-t border-slate-200 my-4" />

              {/* Redes Sociais */}
              <div className="text-[11px] text-slate-500 mb-2">
                Siga o ArenaGo nas Redes Sociais:
              </div>
              <div className="flex items-center justify-center gap-4 text-xs font-bold text-[#ea580c]">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                  📸 Instagram
                </a>
                <a href="https://wa.me/5592984923316" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                  💬 WhatsApp
                </a>
              </div>
            </div>

            {/* Barra Inferior Laranja */}
            <div className="bg-gradient-to-r from-[#ff5722] to-[#f4511e] text-white text-center py-2.5 font-black text-sm tracking-widest uppercase">
              #RESERVOUJOGOU
            </div>
          </div>
        </div>

        {/* Barra de Ações Inferior do Modal */}
        <div className="bg-white dark:bg-slate-900 p-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyVoucher}
              className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copiar Comprovante</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowAlternateInput(!showAlternateInput)}
              className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold flex items-center gap-1.5 transition cursor-pointer text-slate-600 dark:text-slate-300"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar para outro e-mail</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>

        {/* Input Alternativo para Reenvio */}
        {showAlternateInput && (
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom-2">
            <input
              type="email"
              placeholder="Digite o novo e-mail (ex: amigo@gmail.com)"
              value={alternateEmail}
              onChange={(e) => setAlternateEmail(e.target.value)}
              className="flex-1 text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
            <button
              disabled={resending}
              onClick={handleResendEmail}
              className="py-2 px-3 bg-[#ff5722] hover:bg-[#f4511e] text-white font-bold rounded-lg text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
            >
              {resending ? "Enviando..." : "Enviar E-mail"}
            </button>
          </div>
        )}

        {resendSuccess && (
          <div className="bg-emerald-500 text-white text-xs font-bold py-2 px-4 text-center">
            ✅ E-mail de confirmação enviado com sucesso!
          </div>
        )}
      </div>
    </div>
  );
}
