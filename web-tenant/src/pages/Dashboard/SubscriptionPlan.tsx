import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Crown,
  Check,
  Package,
  Sparkles,
  ArrowUpRight,
  Send,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from "lucide-react";

export const SubscriptionPlan: React.FC = () => {
  const [currentTier, setCurrentTier] = useState<string>("pro_ciudad");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("active");
  const [containersCount, setContainersCount] = useState<number>(16);
  const [aiQueriesCount, setAiQueriesCount] = useState<number>(43);

  // Upgrade Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState<string>("triple_impact");
  const [upgradeReason, setUpgradeReason] = useState<string>(
    "Necesitamos certificar como Empresa B / Auditoría Ambiental ODS y optimizar más rutas."
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [requestSent, setRequestSent] = useState<boolean>(false);

  useEffect(() => {
    async function loadPlanData() {
      try {
        const { data: tenantData } = await supabase
          .from("tenants")
          .select("subscription_tier, subscription_status, max_containers, ai_monthly_limit")
          .limit(1)
          .single();

        if (tenantData) {
          setCurrentTier(tenantData.subscription_tier || "pro_ciudad");
          setSubscriptionStatus(tenantData.subscription_status || "active");
        }

        const { count: pointsCount } = await supabase
          .from("recycling_points")
          .select("*", { count: "exact", head: true });
        if (pointsCount) setContainersCount(pointsCount);

        const { count: queriesCount } = await supabase
          .from("ai_queries_log")
          .select("*", { count: "exact", head: true });
        if (queriesCount) setAiQueriesCount(queriesCount);
      } catch (err) {
        console.warn("Using fallback local data:", err);
      }
    }

    loadPlanData();
  }, []);

  const handleRequestUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Registrar estado de solicitud de upgrade en base de datos
      await supabase
        .from("tenants")
        .update({ subscription_status: "pending_upgrade" })
        .eq("id", "11111111-1111-1111-1111-111111111111");

      setSubscriptionStatus("pending_upgrade");
      setRequestSent(true);
      setTimeout(() => {
        setIsUpgradeModalOpen(false);
        setRequestSent(false);
      }, 2500);
    } catch (err) {
      console.error("Error solicitando upgrade:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cuotas según el plan actual
  const maxContainers = currentTier === "triple_impact" ? 9999 : currentTier === "pro_ciudad" ? 120 : 30;
  const maxAiQueries = currentTier === "triple_impact" ? 100000 : currentTier === "pro_ciudad" ? 10000 : 1500;
  const currentPlanPrice = currentTier === "triple_impact" ? 1450 : currentTier === "pro_ciudad" ? 650 : 250;
  const planName =
    currentTier === "triple_impact"
      ? "Triple Impacto Enterprise"
      : currentTier === "pro_ciudad"
      ? "Ciudad Circular Pro"
      : "Municipio Starter";

  const containersPercent = Math.min(Math.round((containersCount / maxContainers) * 100), 100);
  const aiQueriesPercent = Math.min(Math.round((aiQueriesCount / maxAiQueries) * 100), 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
            <Crown className="h-3.5 w-3.5" />
            Consola de Suscripción & Cuotas B2G
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Mi Suscripción & Plan Activo
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitoreo de cuotas de infraestructura, consumo de IA y solicitud de ampliación de capacidades.
          </p>
        </div>

        <button
          onClick={() => setIsUpgradeModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/20 transition-all self-start md:self-auto"
        >
          <Sparkles className="h-4 w-4" />
          Solicitar Subir de Plan (Upgrade)
        </button>
      </div>

      {/* Banner de Estado Pendiente si solicitó upgrade */}
      {subscriptionStatus === "pending_upgrade" && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-foreground">Solicitud de Upgrade en Revisión</p>
            <p className="text-xs text-muted-foreground">
              Hemos remitido tu petición al equipo de Romero Labs GovTech. Un asesor comercial activará los nuevos límites y el módulo de Triple Impacto en menos de 24 horas hábiles.
            </p>
          </div>
        </div>
      )}

      {/* Tarjeta Principal del Plan Activo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Detalles del Plan */}
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Plan Vigente para tu Jurisdicción
              </span>
              <h2 className="text-2xl font-extrabold text-foreground mt-1 flex items-center gap-2">
                {planName}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  ● Activo
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Facturación B2G con orden de compra y trazabilidad contable municipal.
              </p>
            </div>

            <div className="text-left sm:text-right font-mono">
              <span className="text-3xl font-extrabold text-foreground">${currentPlanPrice}</span>
              <span className="text-xs text-muted-foreground"> USD / mes</span>
              <p className="text-[11px] text-muted-foreground">Renovación automática anual</p>
            </div>
          </div>

          {/* Barras de Consumo de Cuotas */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-foreground">Consumo de Cuotas Operativas (Mes en Curso)</h3>

            {/* Cuota 1: Puntos de Reciclaje */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-emerald-500" />
                  Puntos de Reciclaje Digitalizados
                </span>
                <span className="font-mono font-bold text-foreground">
                  {containersCount} / {maxContainers > 500 ? "Ilimitados" : `${maxContainers} permitidos`} ({containersPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${containersPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Capacidad de contenedores georreferenciados en el mapa ciudadano.
              </p>
            </div>

            {/* Cuota 2: Consultas IA */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  Consultas al Asistente IA (Groq LLM)
                </span>
                <span className="font-mono font-bold text-foreground">
                  {aiQueriesCount} / {maxAiQueries.toLocaleString()} ({aiQueriesPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(aiQueriesPercent, 2)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Clasificaciones automáticas realizadas por los vecinos en la app móvil.
              </p>
            </div>
          </div>

          {/* Características Incluidas */}
          <div className="pt-4 border-t space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Módulos Habilitados en este Plan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Mapeo georreferenciado editable</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Optimización de rutas de camiones (-28% km)</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Módulo de Recompensas y EcoCréditos</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Retiros de voluminosos a domicilio</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Insights anónimos de dudas ciudadanas</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Soporte prioritario 12h SLA 99.9%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Upgrade Sugerido */}
        <div className="rounded-2xl border-2 border-purple-500/40 bg-gradient-to-b from-purple-500/10 via-card to-card p-6 md:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold text-xs">
              <Crown className="h-3 w-3" />
              Recomendado para tu Municipio
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-foreground">Triple Impacto Enterprise</h3>
              <p className="text-xs text-muted-foreground mt-1">
                La plataforma definitiva para municipios que lideran la economía circular y empresas con certificación B.
              </p>
            </div>

            <div className="py-2 border-y border-border/80">
              <span className="text-3xl font-extrabold font-mono text-foreground">$1,450</span>
              <span className="text-xs text-muted-foreground"> USD/mes</span>
            </div>

            <ul className="space-y-2 text-xs text-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-purple-500 shrink-0" />
                <span className="font-semibold">Puntos de reciclaje ILIMITADOS</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-purple-500 shrink-0" />
                <span className="font-semibold">100.000 consultas IA multimodales</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-purple-500 shrink-0" />
                <span className="font-semibold">Auditoría Empresa B & Balance ODS / CO₂</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-purple-500 shrink-0" />
                <span>Integración formal de Cooperativas</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-purple-500 shrink-0" />
                <span>Account Manager dedicado 24/7</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => {
                setSelectedPlanToUpgrade("triple_impact");
                setIsUpgradeModalOpen(true);
              }}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/20 transition-all"
            >
              <ArrowUpRight className="h-4 w-4" />
              Solicitar Plan Triple Impacto
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE SOLICITUD DE UPGRADE */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border shadow-2xl p-6 md:p-8 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Solicitar Upgrade de Plan
                </h3>
                <p className="text-xs text-muted-foreground">
                  Un ejecutivo de Romero Labs coordinará la ampliación de tu infraestructura.
                </p>
              </div>
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {requestSent ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-foreground">¡Solicitud Enviada con Éxito!</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Hemos notificado a la mesa de soporte corporativo de Romero Labs. Nos contactaremos con el titular de la cuenta municipal.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestUpgrade} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">Seleccionar Plan Deseado</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`p-3 rounded-xl border cursor-pointer text-xs space-y-1 transition-all ${
                        selectedPlanToUpgrade === "pro_ciudad"
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-border bg-muted/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value="pro_ciudad"
                        checked={selectedPlanToUpgrade === "pro_ciudad"}
                        onChange={() => setSelectedPlanToUpgrade("pro_ciudad")}
                        className="hidden"
                      />
                      <p className="font-bold text-foreground">Ciudad Circular Pro</p>
                      <p className="font-mono text-primary">$650 USD/mes</p>
                      <p className="text-[10px] text-muted-foreground">Hasta 120 eco-puntos</p>
                    </label>

                    <label
                      className={`p-3 rounded-xl border cursor-pointer text-xs space-y-1 transition-all ${
                        selectedPlanToUpgrade === "triple_impact"
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-border bg-muted/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value="triple_impact"
                        checked={selectedPlanToUpgrade === "triple_impact"}
                        onChange={() => setSelectedPlanToUpgrade("triple_impact")}
                        className="hidden"
                      />
                      <p className="font-bold text-foreground">Triple Impacto Enterprise</p>
                      <p className="font-mono text-purple-600 dark:text-purple-400">$1,450 USD/mes</p>
                      <p className="text-[10px] text-muted-foreground">Puntos Ilimitados + ODS</p>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Motivo o Requerimiento Específico
                  </label>
                  <textarea
                    rows={3}
                    value={upgradeReason}
                    onChange={(e) => setUpgradeReason(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Ej. Vamos a extender el servicio de campanas verdes a 50 nuevos barrios..."
                  />
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-muted-foreground/10 text-[11px] text-muted-foreground flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>
                    El cambio de plan no interrumpe el servicio en vivo ni la disponibilidad del mapa.
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsUpgradeModalOpen(false)}
                    className="px-4 py-2 rounded-xl border text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isSubmitting ? "Enviando..." : "Confirmar Solicitud de Upgrade"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
