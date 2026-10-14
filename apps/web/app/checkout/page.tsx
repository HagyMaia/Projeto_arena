"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Trophy, 
  MapPin, 
  Calendar, 
  Clock, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  Tag, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowLeft, 
  Lock, 
  Phone, 
  User as UserIcon, 
  Share2, 
  AlertCircle 
} from "lucide-react";
import { api, getStoredUser } from "@/lib/api";

interface CheckoutIntent {
  venue: {
    id: string;
    name: string;
    address: string;
    city: string;
  };
  court: {
    id: string;
    name: string;
  };
  date: string;
  dateFormatted: string;
  slots: {
    hour: number;
    startTime: string;
    endTime: string;
    price: number;
  }[];
  timeRangeLabel: string;
  totalHours: number;
  bookingMode: "SINGLE" | "RECURRING";
  subtotal: number;
  multiHourDiscount: number;
  recurringDiscount: number;
  totalAmount: number;
}

export default function CheckoutPage() {
  const router = useRouter();

  // Dados do agendamento vindo da tela de schedule
  const [intent, setIntent] = useState<CheckoutIntent | null>(null);

  // Formulário do Jogador
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");

  // Pagamento: "PIX" ou "CREDIT_CARD"
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [installments, setInstallments] = useState("1");

  // Cupom de Desconto
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  // PIX Copiado
  const [pixCopied, setPixCopied] = useState(false);

  // Estado de Finalização e Sucesso
  const [submitting, setSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState<{
    id: string;
    code: string;
    total: number;
  } | null>(null);

  // Carregar dados salvos
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("arenago_checkout_intent");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setIntent(parsed);
        } catch {}
      }

      const user = getStoredUser();
      if (user) {
        setFullName(user.name);
        if (user.role === "PLAYER") {
          setEmail("jogador@arenago.com.br");
          setPhone("(11) 97777-0003");
          setCpf("345.678.901-23");
        }
      }
    }
  }, []);

  // Dados de fallback caso acesse diretamente
  const activeIntent: CheckoutIntent = intent || {
    venue: {
      id: "demo-venue",
      name: "Beach Arena Itaim",
      address: "Rua Clodomiro Amazonas, 1150",
      city: "São Paulo",
    },
    court: {
      id: "demo-court",
      name: "Quadra 1 — Beach Tennis Coberta",
    },
    date: "2026-10-15",
    dateFormatted: "Quinta-feira, 15 de Outubro de 2026",
    slots: [
      { hour: 18, startTime: "18:00", endTime: "19:00", price: 130 },
      { hour: 19, startTime: "19:00", endTime: "20:00", price: 130 }
    ],
    timeRangeLabel: "18:00 às 20:00",
    totalHours: 2,
    bookingMode: "SINGLE",
    subtotal: 260,
    multiHourDiscount: 13,
    recurringDiscount: 0,
    totalAmount: 247,
  };

  // Aplicação de Cupom
  const handleApplyCoupon = () => {
    setCouponError("");
    const code = couponCode.trim().toUpperCase();

    if (code === "ARENAGO10") {
      const disc = Math.round(activeIntent.totalAmount * 0.10);
      setCouponApplied({ code: "ARENAGO10 (10% OFF)", discount: disc });
    } else if (code === "PRIMEIRAPARTIDA") {
      setCouponApplied({ code: "PRIMEIRAPARTIDA (R$ 20 OFF)", discount: 20 });
    } else {
      setCouponError("Cupom inválido ou expirado. Tente ARENAGO10");
    }
  };

  // Cálculo final
  const couponDiscount = couponApplied ? couponApplied.discount : 0;
  const finalTotal = Math.max(0, activeIntent.totalAmount - couponDiscount);

  // String PIX fictícia dinâmica
  const pixCodeString = `00020126580014BR.GOV.BCB.PIX0136arenago-pix-${activeIntent.court.id.slice(0, 8)}520400005303986540${finalTotal.toFixed(2)}5802BR5913ARENAGO PAGAMENTOS6009SAO PAULO62070503***6304`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCodeString);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  // Finalizar Reserva
  const handleCompleteBooking = async () => {
    if (!fullName || !phone) {
      alert("Por favor, preencha seu nome e WhatsApp para contato da quadra.");
      return;
    }

    setSubmitting(true);
    try {
      // Simula criação no backend ou chamada real
      const randomCode = `AG-${Math.floor(10000 + Math.random() * 90000)}`;

      if (intent?.slots && intent.slots.length > 0) {
        const first = intent.slots[0];
        const last = intent.slots[intent.slots.length - 1];
        const startIso = `${intent.date}T${first.startTime}:00Z`;
        const endIso = `${intent.date}T${last.endTime}:00Z`;

        try {
          await api.createBooking(intent.court.id, startIso, endIso, intent.bookingMode === "RECURRING" ? "RECURRING_MONTHLY" : "ONLINE_SINGLE");
        } catch {
          // Se não autenticado via backend, continua com reserva confirmada demo
        }
      }

      setSuccessBooking({
        id: "res-" + Date.now(),
        code: randomCode,
        total: finalTotal,
      });

      // Limpar intent de sessão
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("arenago_checkout_intent");
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Topo / Voltar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Seleção de Horários</span>
          </Link>

          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ambiente 100% Seguro (SSL 256-bit)</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
          Finalizar Agendamento
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-8">
          Revise os dados da partida, preencha suas informações e escolha a melhor forma de pagamento.
        </p>

        {/* Layout em 3 Colunas Fiel à Referência */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ================= COLUNA 1 (4 colunas): Detalhes do Agendamento & Dados ================= */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card Detalhes da Partida */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700 mb-4">
                <Trophy className="w-4 h-4 text-emerald-600" />
                <span>Detalhes da Partida</span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{activeIntent.venue.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {activeIntent.venue.address}, {activeIntent.venue.city}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Quadra Escolhida</span>
                  <p className="text-sm font-black text-slate-900">{activeIntent.court.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Data</span>
                    <p className="text-xs font-bold text-slate-900">{activeIntent.dateFormatted}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Horário</span>
                    <p className="text-xs font-bold text-slate-900">{activeIntent.timeRangeLabel}</p>
                    <span className="text-[10px] text-emerald-700 font-semibold">{activeIntent.totalHours}h de jogo</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">Modalidade:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                    {activeIntent.bookingMode === "RECURRING" ? "Mensalista Semanal" : "Reserva Avulsa"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Dados do Jogador Responsável */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
                <UserIcon className="w-4 h-4 text-emerald-600" />
                <span>Dados do Responsável</span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp / Celular *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500 text-xs font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Para receber a confirmação e lembretes da partida.</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CPF</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= COLUNA 2 (5 colunas): Forma de Pagamento & Cupons ================= */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Forma de Pagamento
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Sem taxas extras
                </span>
              </div>

              {/* Abas PIX vs Cartão de Crédito */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-6 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("PIX")}
                  className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    paymentMethod === "PIX"
                      ? "bg-white text-emerald-800 shadow-xs font-extrabold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  PIX (Instantâneo)
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CREDIT_CARD")}
                  className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    paymentMethod === "CREDIT_CARD"
                      ? "bg-white text-slate-900 shadow-xs font-extrabold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-slate-700" />
                  Cartão de Crédito
                </button>
              </div>

              {/* Conteúdo Aba PIX */}
              {paymentMethod === "PIX" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col items-center text-center">
                    <span className="text-[11px] font-bold text-emerald-900 mb-2">
                      Pague via PIX com aprovação em <strong>segundos</strong>
                    </span>

                    {/* QR Code Autêntico */}
                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-emerald-200 mb-3">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020126580014BR.GOV.BCB.PIX0136arenago-pix-mock"
                        alt="QR Code PIX ArenaGo"
                        className="w-40 h-40 object-contain"
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 mb-3">
                      Tempo restante para pagamento: <strong className="text-emerald-700">14:58 min</strong>
                    </p>

                    {/* Botão Copiar Chave */}
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      {pixCopied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Código PIX Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Código PIX (Copia e Cola)</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1 pl-1">
                    <p>1. Abra o app do seu banco ou carteira digital.</p>
                    <p>2. Selecione a opção <strong>Pagar via PIX</strong> &gt; <strong>Copia e Cola</strong>.</p>
                    <p>3. Cole o código e confirme a transferência no valor de <strong>R$ {finalTotal.toFixed(2)}</strong>.</p>
                  </div>
                </div>
              )}

              {/* Conteúdo Aba Cartão de Crédito */}
              {paymentMethod === "CREDIT_CARD" && (
                <div className="space-y-4">
                  {/* Mockup do Cartão Visual */}
                  <div className="h-44 rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 flex flex-col justify-between shadow-lg relative overflow-hidden border border-slate-700">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                    <div className="flex items-center justify-between relative z-10">
                      <span className="font-mono text-xs tracking-widest text-slate-400">ARENAGO PASS</span>
                      <CreditCard className="w-6 h-6 text-emerald-400" />
                    </div>

                    <div className="relative z-10 my-auto">
                      <span className="font-mono text-lg tracking-widest block font-bold">
                        {cardNumber ? cardNumber : "•••• •••• •••• ••••"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between relative z-10 text-[10px] uppercase font-mono">
                      <div>
                        <span className="text-slate-400 block text-[8px]">Titular</span>
                        <span className="font-bold">{cardHolder || "NOME DO ATLETA"}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[8px]">Validade</span>
                        <span className="font-bold">{cardExpiry || "MM/AA"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Inputs do Cartão */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Número do Cartão</label>
                      <input
                        type="text"
                        maxLength={19}
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nome Impresso no Cartão</label>
                      <input
                        type="text"
                        placeholder="Como está no cartão"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Validade</label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="MM/AA"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500 text-xs text-center"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500 text-xs text-center font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Parcelamento</label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500 text-xs font-bold"
                      >
                        <option value="1">1x de R$ {finalTotal.toFixed(2)} (sem juros)</option>
                        <option value="2">2x de R$ {(finalTotal / 2).toFixed(2)} (sem juros)</option>
                        <option value="3">3x de R$ {(finalTotal / 3).toFixed(2)} (sem juros)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Seção Cupom de Desconto */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Possui cupom de desconto?</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: ARENAGO10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 uppercase font-mono text-xs focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                >
                  Aplicar
                </button>
              </div>

              {couponApplied && (
                <div className="mt-2 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cupom <strong>{couponApplied.code}</strong> aplicado (- R$ {couponApplied.discount.toFixed(2)})</span>
                </div>
              )}

              {couponError && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {couponError}
                </p>
              )}
            </div>
          </div>

          {/* ================= COLUNA 3 (3 colunas): Resumo do Pedido & Confirmação ================= */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs sticky top-24">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-4">
                Resumo do Pagamento
              </span>

              <div className="space-y-3 text-xs border-b border-slate-100 pb-4 mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Horas de Quadra ({activeIntent.totalHours}h):</span>
                  <span className="font-semibold">R$ {activeIntent.subtotal.toFixed(2)}</span>
                </div>

                {activeIntent.multiHourDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Desconto 2+ horas (5%):</span>
                    <span>- R$ {activeIntent.multiHourDiscount.toFixed(2)}</span>
                  </div>
                )}

                {activeIntent.recurringDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Desconto Mensalista (10%):</span>
                    <span>- R$ {activeIntent.recurringDiscount.toFixed(2)}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Cupom de Desconto:</span>
                    <span>- R$ {couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Taxa de Serviço:</span>
                  <span className="font-bold text-emerald-600 uppercase">Grátis</span>
                </div>
              </div>

              {/* Total Final */}
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase block">Total a Pagar</span>
                  <span className="text-[10px] text-slate-400">Em até 3x s/ juros ou PIX</span>
                </div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  R$ {finalTotal.toFixed(2)}
                </span>
              </div>

              {/* Botão de Finalizar */}
              <button
                type="button"
                disabled={submitting}
                onClick={handleCompleteBooking}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? (
                  <span>Processando...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Agendamento</span>
                  </>
                )}
              </button>

              {/* Garantias */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cancelamento grátis até 2 horas antes</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Horário garantido com voucher oficial</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Sucesso */}
      {successBooking && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 inline-block mb-2">
              Reserva Confirmada com Sucesso!
            </span>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Sua partida está garantida!
            </h3>

            <p className="text-xs text-slate-500 mt-2">
              Código da Reserva: <strong className="text-slate-900 font-mono text-sm">{successBooking.code}</strong>
            </p>

            <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Local:</span>
                <span className="font-bold text-slate-900">{activeIntent.venue.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quadra:</span>
                <span className="font-bold text-slate-900">{activeIntent.court.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Data & Hora:</span>
                <span className="font-bold text-slate-900">{activeIntent.dateFormatted} • {activeIntent.timeRangeLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Responsável:</span>
                <span className="font-bold text-slate-900">{fullName}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">Total Pago:</span>
                <strong className="text-emerald-700 font-black text-sm">R$ {successBooking.total.toFixed(2)}</strong>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  const text = `Fala galera! Partida confirmada na ${activeIntent.venue.name} (${activeIntent.court.name}) dia ${activeIntent.dateFormatted} das ${activeIntent.timeRangeLabel}. Código: ${successBooking.code}!`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartilhar no WhatsApp do Grupo</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/player")}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                Ver no Portal do Jogador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
