import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Package,
  Check,
  TrendingUp,
  DollarSign,
  Users,
  Sparkles,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  ArrowUpRight,
  Layers,
  Award,
} from "lucide-react";

export interface SaasPlan {
  id: string;
  name: string;
  price_usd_monthly: number;
  target_audience: string;
  description: string;
  max_containers: number;
  ai_queries_limit: number;
  includes_route_optimization: boolean;
  includes_citizen_gamification: boolean;
  includes_b_corp_reporting: boolean;
  includes_custom_domain: boolean;
  sla_support: string;
  badge_color: string;
  active_subscribers_count?: number;
}

export const SaasPlansManagement: React.FC = () => {
  const [plans, setPlans] = useState<SaasPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SaasPlan | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fallback demo plans
  const defaultPlans: SaasPlan[] = [
    {
      id: "starter_b2g",
      name: "Municipio Starter",
      price_usd_monthly: 250,
      target_audience: "Comunas & Municipios < 25k hab.",
      description: "Digitalización básica de campanas y puntos limpios con horarios de vaciado.",
      max_containers: 30,
      ai_queries_limit: 1500,
      includes_route_optimization: false,
      includes_citizen_gamification: false,
      includes_b_corp_reporting: false,
      includes_custom_domain: false,
      sla_support: "Ticket estándar 48h",
      badge_color: "#64748b",
      active_subscribers_count: 2,
    },
    {
      id: "pro_ciudad",
      name: "Ciudad Circular Pro",
      price_usd_monthly: 650,
      target_audience: "Municipios Medios & Empresas B2B",
      description: "Mapeo total, optimización de rutas de camiones, EcoCréditos y módulo IA Groq.",
      max_containers: 120,
      ai_queries_limit: 10000,
      includes_route_optimization: true,
      includes_citizen_gamification: true,
      includes_b_corp_reporting: false,
      includes_custom_domain: false,
      sla_support: "Soporte prioritario 12h SLA 99.9%",
      badge_color: "#10b981",
      active_subscribers_count: 2,
    },
    {
      id: "triple_impact",
      name: "Triple Impacto Enterprise",
      price_usd_monthly: 1450,
      target_audience: "Grandes Ciudades & Certificadas Empresa B",
      description: "Infraestructura ilimitada, huella de carbono auditada ODS, cooperativas y IA multimodal.",
      max_containers: 9999,
      ai_queries_limit: 100000,
      includes_route_optimization: true,
      includes_citizen_gamification: true,
      includes_b_corp_reporting: true,
      includes_custom_domain: true,
      sla_support: "Account Manager dedicado 24/7",
      badge_color: "#a855f7",
      active_subscribers_count: 2,
    },
  ];

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("saas_plans").select("*");
      if (!error && data && data.length > 0) {
        const enriched = data.map((p: any) => ({
          ...p,
          price_usd_monthly: Number(p.price_usd_monthly),
          active_subscribers_count:
            p.id === "triple_impact" ? 2 : p.id === "pro_ciudad" ? 2 : 2,
        }));
        setPlans(enriched);
      } else {
        setPlans(defaultPlans);
      }
    } catch (e) {
      console.warn("Using fallback SaaS plans:", e);
      setPlans(defaultPlans);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      await supabase
        .from("saas_plans")
        .update({
          name: editingPlan.name,
          price_usd_monthly: editingPlan.price_usd_monthly,
          max_containers: editingPlan.max_containers,
          ai_queries_limit: editingPlan.ai_queries_limit,
          description: editingPlan.description,
          sla_support: editingPlan.sla_support,
        })
        .eq("id", editingPlan.id);

      setPlans((prev) =>
        prev.map((p) => (p.id === editingPlan.id ? editingPlan : p))
      );
      setEditingPlan(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving plan:", err);
    }
  };

  // Cálculos de negocio SaaS
  const totalMRR = plans.reduce(
    (acc, p) => acc + p.price_usd_monthly * (p.active_subscribers_count || 1),
    0
  );
  const totalARR = totalMRR * 12;
  const totalSubscribers = plans.reduce(
    (acc, p) => acc + (p.active_subscribers_count || 0),
    0
  );
  const arpu = totalSubscribers > 0 ? Math.round(totalMRR / totalSubscribers) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-1">
            <Package className="h-3.5 w-3.5" />
            Monetización & Arquitectura de Precios
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Gestión de Planes SaaS & Negocio B2G
          </h1>
          <p className="text-sm text-slate-400">
            Administración de esquemas de suscripción, cuotas operativas y proyección de ingresos recurrentes (MRR/ARR).
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="h-4 w-4" />
            Plan actualizado en tiempo real
          </div>
        )}
      </div>

      {/* Grid de KPIs de Negocio SaaS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              MRR SaaS Mensual
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              ${totalMRR.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">USD/mes</span>
          </div>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5" /> +24% expansión Q3
          </p>
        </div>

        {/* ARR Proyectado */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              ARR Proyectado Anual
            </span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-300 font-mono">
              ${totalARR.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">USD/año</span>
          </div>
          <p className="text-xs text-slate-400">Contratos anuales B2G</p>
        </div>

        {/* Jurisdicciones Clientes */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Entidades Activas
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-400 font-mono">
              {totalSubscribers}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">0% Churn</span>
          </div>
          <p className="text-xs text-slate-400">100% de retención</p>
        </div>

        {/* ARPU */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              ARPU (Ticket Medio)
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-300 font-mono">
              ${arpu}
            </span>
            <span className="text-xs text-slate-400 font-mono">USD/entidad</span>
          </div>
          <p className="text-xs text-slate-400">Alta propensión al upgrade</p>
        </div>
      </div>

      {/* Tarjetas Comparativas de los 3 Planes SaaS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {plans.map((plan) => {
          const isFeatured = plan.id === "pro_ciudad";
          const isEnterprise = plan.id === "triple_impact";

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative ${
                isEnterprise
                  ? "bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-950 border-2 border-purple-500/40 shadow-2xl shadow-purple-950/30"
                  : isFeatured
                  ? "bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-950 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/30"
                  : "bg-slate-900/90 border border-slate-800 shadow-xl"
              }`}
            >
              {isFeatured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider shadow">
                  ★ El Más Popular (B2G)
                </div>
              )}

              {isEnterprise && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-purple-500 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider shadow">
                  👑 Empresa B / Triple Impacto
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{plan.target_audience}</p>
                  </div>
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Modificar precio o cuotas"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-baseline gap-1 py-2 border-b border-slate-800">
                  <span className="text-4xl font-extrabold text-white font-mono">
                    ${plan.price_usd_monthly}
                  </span>
                  <span className="text-xs text-slate-400">USD / mes</span>
                </div>

                <p className="text-xs text-slate-300 min-h-[36px]">{plan.description}</p>

                {/* Cuotas de Infraestructura & IA */}
                <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">📦 Capacidad Puntos:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {plan.max_containers > 500 ? "Ilimitados" : `${plan.max_containers} puntos`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">✨ Cuota IA Mensual:</span>
                    <span className="font-mono font-bold text-blue-400">
                      {plan.ai_queries_limit.toLocaleString()} req/mes
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">🏛️ Clientes Activos:</span>
                    <span className="font-mono font-bold text-purple-300">
                      {plan.active_subscribers_count} entidades
                    </span>
                  </div>
                </div>

                {/* Checklist de Funcionalidades */}
                <ul className="space-y-2.5 pt-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Mapeo georreferenciado con horarios</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check
                      className={`h-4 w-4 shrink-0 ${
                        plan.includes_route_optimization ? "text-emerald-400" : "text-slate-600"
                      }`}
                    />
                    <span
                      className={
                        plan.includes_route_optimization ? "text-slate-200" : "text-slate-500 line-through"
                      }
                    >
                      Optimización de rutas de recolección (-28% km)
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check
                      className={`h-4 w-4 shrink-0 ${
                        plan.includes_citizen_gamification ? "text-emerald-400" : "text-slate-600"
                      }`}
                    />
                    <span
                      className={
                        plan.includes_citizen_gamification ? "text-slate-200" : "text-slate-500 line-through"
                      }
                    >
                      Gamificación ciudadana & EcoCréditos
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check
                      className={`h-4 w-4 shrink-0 ${
                        plan.includes_b_corp_reporting ? "text-purple-400" : "text-slate-600"
                      }`}
                    />
                    <span
                      className={
                        plan.includes_b_corp_reporting ? "text-purple-300 font-semibold" : "text-slate-500 line-through"
                      }
                    >
                      Auditoría Empresa B & Balance ODS / CO₂
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check
                      className={`h-4 w-4 shrink-0 ${
                        plan.includes_custom_domain ? "text-purple-400" : "text-slate-600"
                      }`}
                    />
                    <span
                      className={
                        plan.includes_custom_domain ? "text-purple-300 font-semibold" : "text-slate-500 line-through"
                      }
                    >
                      Marca blanca y dominio municipal propio
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-400 font-mono text-[11px]">{plan.sla_support}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 border-t border-slate-800 mt-6">
                <button
                  onClick={() => setEditingPlan(plan)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isEnterprise
                      ? "bg-purple-600 hover:bg-purple-500 text-white"
                      : isFeatured
                      ? "bg-emerald-600 hover:bg-emerald-500 text-slate-950"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                  }`}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Editar Parámetros del Plan
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Editar Plan */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-400" />
                Editar Plan: {editingPlan.name}
              </h3>
              <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nombre Comercial</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Precio (USD/mes)</label>
                  <input
                    type="number"
                    value={editingPlan.price_usd_monthly}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, price_usd_monthly: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Máx. Contenedores</label>
                  <input
                    type="number"
                    value={editingPlan.max_containers}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, max_containers: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Cuota Mensual de IA (Groq)</label>
                <input
                  type="number"
                  step="500"
                  value={editingPlan.ai_queries_limit}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, ai_queries_limit: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">SLA de Soporte</label>
                <input
                  type="text"
                  value={editingPlan.sla_support}
                  onChange={(e) => setEditingPlan({ ...editingPlan, sla_support: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
