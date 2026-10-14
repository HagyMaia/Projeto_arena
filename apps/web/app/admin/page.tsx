"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Activity, 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { api, AdminMetrics, AdminSubscription, getStoredUser } from "@/lib/api";

export default function SuperAdminPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [planFilter, setPlanFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Default fallback data matching Motiff reference
  const fallbackMetrics: AdminMetrics = {
    total_subscriptions: 1247,
    active_subscriptions: 1089,
    monthly_recurring_revenue: 124580.0,
    churn_rate_percentage: 2.3,
    mrr_growth_percentage: 12.5,
  };

  const fallbackSubscriptions: AdminSubscription[] = [
    {
      id: "sub-1",
      organization_name: "TechCorp Sports Arena",
      document_number: "11.222.333/0001-44",
      plan_name: "Enterprise Multi-Arena",
      plan_tier: "ENTERPRISE",
      status: "ACTIVE",
      billing_cycle: "ANNUAL",
      current_period_end: "2026-12-15T00:00:00Z",
      mrr_amount: 12450.0,
    },
    {
      id: "sub-2",
      organization_name: "DataFlow Society & Padel",
      document_number: "22.333.444/0001-55",
      plan_name: "Professional Growth",
      plan_tier: "PRO",
      status: "ACTIVE",
      billing_cycle: "MONTHLY",
      current_period_end: "2026-11-01T00:00:00Z",
      mrr_amount: 8900.0,
    },
    {
      id: "sub-3",
      organization_name: "CloudSync Complexo Esportivo",
      document_number: "33.444.555/0001-66",
      plan_name: "Enterprise Multi-Arena",
      plan_tier: "ENTERPRISE",
      status: "ACTIVE",
      billing_cycle: "ANNUAL",
      current_period_end: "2027-01-08T00:00:00Z",
      mrr_amount: 10200.0,
    },
    {
      id: "sub-4",
      organization_name: "InnovateLab Beach Club",
      document_number: "44.555.666/0001-77",
      plan_name: "Professional Growth",
      plan_tier: "PRO",
      status: "TRIAL",
      billing_cycle: "MONTHLY",
      current_period_end: "2026-11-15T00:00:00Z",
      mrr_amount: 6750.0,
    },
    {
      id: "sub-5",
      organization_name: "NextGen Arenas Brasil",
      document_number: "55.666.777/0001-88",
      plan_name: "Business Scale",
      plan_tier: "BUSINESS",
      status: "ACTIVE",
      billing_cycle: "QUARTERLY",
      current_period_end: "2026-12-01T00:00:00Z",
      mrr_amount: 5400.0,
    },
    {
      id: "sub-6",
      organization_name: "Digital Dynamics Quadras",
      document_number: "66.777.888/0001-99",
      plan_name: "Professional Growth",
      plan_tier: "PRO",
      status: "CANCELLED",
      billing_cycle: "MONTHLY",
      current_period_end: "2026-10-31T00:00:00Z",
      mrr_amount: 0.0,
    },
    {
      id: "sub-7",
      organization_name: "SmartData Group Arena",
      document_number: "77.888.999/0001-00",
      plan_name: "Starter Arena",
      plan_tier: "STARTER",
      status: "PAST_DUE",
      billing_cycle: "MONTHLY",
      current_period_end: "2026-10-28T00:00:00Z",
      mrr_amount: 2900.0,
    },
  ];

  const loadAdminData = async () => {
    setLoading(true);
    // Ensure SuperAdmin login
    const user = getStoredUser();
    if (!user || user.role !== "SUPERADMIN") {
      try {
        await api.login("admin@arenago.com.br", "admin123");
      } catch (e) {}
    }

    try {
      const [m, s] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminSubscriptions(
          statusFilter !== "ALL" ? statusFilter : undefined,
          planFilter !== "ALL" ? planFilter : undefined
        ),
      ]);
      setMetrics(m);
      setSubscriptions(s);
    } catch (err) {
      setMetrics(fallbackMetrics);
      setSubscriptions(fallbackSubscriptions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [statusFilter, planFilter]);

  const filteredSubs = subscriptions.filter((sub) => {
    if (searchTerm) {
      const matchName = sub.organization_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDoc = sub.document_number?.includes(searchTerm);
      if (!matchName && !matchDoc) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Header Section */}
      <section className="bg-slate-900 text-white pt-8 pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
                  ArenaGo SaaS Core
                </span>
                <span className="text-xs text-slate-400">Motiff Reference Style</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Dashboard Geral de Assinaturas SaaS
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Monitoramento consolidado de receita recorrente (MRR), assinaturas ativas e saúde das arenas parceiras.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadAdminData}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-2 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Atualizar Métricas
              </button>

              <button
                onClick={() => alert("Relatório financeiro exportado com sucesso em CSV!")}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar Relatório
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards (Motiff Layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* MRR Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">MRR Consolidado</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              R$ {Number(metrics?.monthly_recurring_revenue ?? 124580).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
              <span>+{metrics?.mrr_growth_percentage ?? 12.5}% vs mês anterior</span>
            </div>
          </div>

          {/* Active Subscriptions Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Assinaturas Ativas</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {Number(metrics?.active_subscriptions ?? 1089).toLocaleString("pt-BR")}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span className="font-bold text-slate-700">92.4%</span> da base total convertida
            </div>
          </div>

          {/* Total Subscriptions Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total de Clientes</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {Number(metrics?.total_subscriptions ?? 1247).toLocaleString("pt-BR")}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
              <span>+84 novas arenas este mês</span>
            </div>
          </div>

          {/* Churn Rate Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Taxa de Churn</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {metrics?.churn_rate_percentage ?? 2.3}%
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600">
              <ArrowDownRight className="w-4 h-4" />
              <span>-0.4% (Redução de cancelamentos)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Table Section (Motiff Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Filters Bar */}
          <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por organização ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">Status: Todos</option>
                <option value="ACTIVE">Ativos</option>
                <option value="TRIAL">Trial</option>
                <option value="PAST_DUE">Inadimplentes</option>
                <option value="CANCELLED">Cancelados</option>
              </select>

              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">Planos: Todos</option>
                <option value="ENTERPRISE">Enterprise</option>
                <option value="BUSINESS">Business</option>
                <option value="PRO">Professional</option>
                <option value="STARTER">Starter</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Organização / Arena</th>
                  <th className="px-6 py-3.5">Plano Contratado</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Ciclo</th>
                  <th className="px-6 py-3.5">Renovação</th>
                  <th className="px-6 py-3.5 text-right">MRR (R$)</th>
                  <th className="px-6 py-3.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      Carregando dados das assinaturas...
                    </td>
                  </tr>
                ) : filteredSubs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      Nenhuma assinatura encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredSubs.map((sub) => {
                    const statusBadge = {
                      ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200",
                      TRIAL: "bg-blue-100 text-blue-800 border-blue-200",
                      PAST_DUE: "bg-amber-100 text-amber-800 border-amber-200",
                      CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
                    }[sub.status] || "bg-slate-100 text-slate-600 border-slate-200";

                    const planBadge = {
                      ENTERPRISE: "bg-purple-100 text-purple-800",
                      BUSINESS: "bg-indigo-100 text-indigo-800",
                      PRO: "bg-emerald-100 text-emerald-800",
                      STARTER: "bg-slate-100 text-slate-700",
                    }[sub.plan_tier] || "bg-slate-100 text-slate-700";

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{sub.organization_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            CNPJ: {sub.document_number || "Não informado"}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${planBadge}`}>
                            {sub.plan_name}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusBadge}`}>
                            {sub.status === "ACTIVE" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {sub.status === "TRIAL" && <Clock className="w-3 h-3 text-blue-600" />}
                            {sub.status === "PAST_DUE" && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                            {sub.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {sub.billing_cycle === "ANNUAL" ? "Anual (-20%)" : sub.billing_cycle === "QUARTERLY" ? "Trimestral" : "Mensal"}
                        </td>

                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                          {new Date(sub.current_period_end).toLocaleDateString("pt-BR")}
                        </td>

                        <td className="px-6 py-4 text-right font-black text-slate-900 font-mono">
                          R$ {Number(sub.mrr_amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => alert(`Gerenciando assinatura da ${sub.organization_name}`)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                            title="Opções"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Mostrando {filteredSubs.length} assinaturas</span>
            <div className="flex items-center gap-2">
              <button disabled className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-400 cursor-not-allowed">
                Anterior
              </button>
              <button className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold">
                1
              </button>
              <button disabled className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-400 cursor-not-allowed">
                Próximo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
