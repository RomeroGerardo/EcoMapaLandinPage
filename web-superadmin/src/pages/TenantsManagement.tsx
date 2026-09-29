import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Building2,
  Plus,
  Search,
  Sliders,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  Clock,
  Sparkles,
  ShieldAlert,
  Inbox,
  Settings2,
  Mail,
  Globe,
  SlidersHorizontal,
} from "lucide-react";

export interface TenantRecord {
  id: string;
  name: string;
  type: string;
  subscription_tier: string;
  subscription_status: string;
  contact_email?: string;
  jurisdiction?: string;
  max_containers: number;
  ai_monthly_limit: number;
  ai_enabled: boolean;
  pickups_enabled: boolean;
  created_at: string;
}

export interface PendingRequest {
  id: string;
  entity_name: string;
  type: string;
  province: string;
  contact_name: string;
  contact_email: string;
  submitted_at: string;
  containers_projected: number;
  status: "pending" | "approved" | "rejected";
}

export const TenantsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"tenants" | "requests">("tenants");
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([
    {
      id: "req-1",
      entity_name: "Municipalidad de Río Cuarto",
      type: "municipality",
      province: "Córdoba",
      contact_name: "Dr. Carlos Varela (Sec. Ambiente)",
      contact_email: "ambiente@riocuarto.gov.ar",
      submitted_at: "2026-09-27T14:30:00Z",
      containers_projected: 45,
      status: "pending",
    },
    {
      id: "req-2",
      entity_name: "Holcim Argentina (Planta Yocsina)",
      type: "business",
      province: "Córdoba",
      contact_name: "Ing. Laura Benítez",
      contact_email: "sostenibilidad@holcim.com",
      submitted_at: "2026-09-28T09:15:00Z",
      containers_projected: 15,
      status: "pending",
    },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");

  // Modal Crear Tenant
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("municipality");
  const [newTier, setNewTier] = useState("pro");
  const [newJurisdiction, setNewJurisdiction] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Modal Límites & Permisos
  const [selectedTenantForLimits, setSelectedTenantForLimits] = useState<TenantRecord | null>(null);

  const defaultTenantsList: TenantRecord[] = [
    {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Municipalidad de Córdoba Capital",
      type: "municipality",
      subscription_tier: "triple_impact",
      subscription_status: "active",
      contact_email: "ambiente@cordoba.gov.ar",
      jurisdiction: "Córdoba Capital (Centro, Nva Cba, Alberdi)",
      max_containers: 500,
      ai_monthly_limit: 50000,
      ai_enabled: true,
      pickups_enabled: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "b3f796e6-89ac-470c-bb01-5c5df4d5b749",
      name: "Municipalidad de Villa Carlos Paz",
      type: "municipality",
      subscription_tier: "pro_ciudad",
      subscription_status: "active",
      contact_email: "modernizacion@vcp.gov.ar",
      jurisdiction: "Valle de Punilla & Cuenca San Roque",
      max_containers: 120,
      ai_monthly_limit: 10000,
      ai_enabled: true,
      pickups_enabled: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      name: "Municipalidad de Alta Gracia",
      type: "municipality",
      subscription_tier: "pro_ciudad",
      subscription_status: "active",
      contact_email: "ambiente@altagracia.gov.ar",
      jurisdiction: "Circuito Histórico y Tajamar",
      max_containers: 100,
      ai_monthly_limit: 8000,
      ai_enabled: true,
      pickups_enabled: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Holcim Argentina (Planta Yocsina - B2B)",
      type: "business",
      subscription_tier: "triple_impact",
      subscription_status: "active",
      contact_email: "sustentabilidad@holcim.com",
      jurisdiction: "Malagueño & Autovía Justiniano Posse",
      max_containers: 60,
      ai_monthly_limit: 15000,
      ai_enabled: true,
      pickups_enabled: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      name: "Cooperativa Los Cuadraditos Recicla",
      type: "cooperative",
      subscription_tier: "starter_b2g",
      subscription_status: "active",
      contact_email: "cooperativa@loscuadraditos.org",
      jurisdiction: "Red Barrial de Recuperadores Urbanos",
      max_containers: 40,
      ai_monthly_limit: 5000,
      ai_enabled: true,
      pickups_enabled: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "c45521ed-fc2c-4bb7-abe1-2fb381823173",
      name: "Municipalidad de Matorrales (Piloto)",
      type: "municipality",
      subscription_tier: "starter_b2g",
      subscription_status: "active",
      contact_email: "municipio@matorrales.gob.ar",
      jurisdiction: "Departamento Río Segundo",
      max_containers: 30,
      ai_monthly_limit: 1500,
      ai_enabled: true,
      pickups_enabled: true,
      created_at: new Date().toISOString(),
    },
  ];

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const enriched: TenantRecord[] = data.map((t: any) => ({
          id: t.id,
          name: t.name,
          type: t.type || "municipality",
          subscription_tier: t.subscription_tier || "pro_ciudad",
          subscription_status: t.subscription_status || "active",
          contact_email: t.contact_email || "contacto@jurisdiccion.gov.ar",
          jurisdiction: t.jurisdiction || "Provincia de Córdoba",
          max_containers: t.max_containers || 100,
          ai_monthly_limit: t.ai_monthly_limit || 5000,
          ai_enabled: t.ai_enabled !== false,
          pickups_enabled: t.pickups_enabled !== false,
          created_at: t.created_at || new Date().toISOString(),
        }));
        setTenants(enriched);
      } else {
        setTenants(defaultTenantsList);
      }
    } catch (e) {
      console.warn("Using fallback jurisdictions list:", e);
      setTenants(defaultTenantsList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // Crear nuevo Tenant
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const { error } = await supabase.from("tenants").insert([
        {
          name: newName.trim(),
          type: newType,
          subscription_tier: newTier,
          subscription_status: "active",
        },
      ]);

      if (!error) {
        setNewName("");
        setNewJurisdiction("");
        setNewEmail("");
        setIsCreateOpen(false);
        fetchTenants();
      }
    } catch (err) {
      console.error("Error creating tenant:", err);
    }
  };

  // Alternar Estado Activo / Pausado
  const handleToggleStatus = async (tenantId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "paused" : "active";
    await supabase.from("tenants").update({ subscription_status: nextStatus }).eq("id", tenantId);
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, subscription_status: nextStatus } : t))
    );
  };

  // Guardar Límites de un Tenant
  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantForLimits) return;

    setTenants((prev) =>
      prev.map((t) => (t.id === selectedTenantForLimits.id ? selectedTenantForLimits : t))
    );
    setSelectedTenantForLimits(null);
  };

  // Aprobar Solicitud de Onboarding
  const handleApproveRequest = async (req: PendingRequest) => {
    try {
      await supabase.from("tenants").insert([
        {
          name: req.entity_name,
          type: req.type,
          subscription_tier: "pro",
          subscription_status: "active",
        },
      ]);
      setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
      fetchTenants();
    } catch (err) {
      console.error("Error approving request:", err);
    }
  };

  // Rechazar Solicitud
  const handleRejectRequest = (reqId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.type.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.jurisdiction?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Encabezado y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-emerald-400" />
            Jurisdicciones & Red Territorial
          </h1>
          <p className="text-sm text-slate-400">
            Control de municipios, empresas B2B y cooperativas aliadas a la plataforma EcoMapa.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 text-slate-950 stroke-[3]" />
          Nueva Jurisdicción
        </button>
      </div>

      {/* Tabs de Navegación del Módulo */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab("tenants")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "tenants"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Directorio de Jurisdicciones ({tenants.length})
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "requests"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Inbox className="h-4 w-4" />
          Solicitudes de Adhesión
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: DIRECTORIO Y ABM DE TENANTS */}
      {activeTab === "tenants" && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por municipio, empresa o jurisdicción..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="text-xs text-slate-400 font-mono self-end sm:self-center">
              Mostrando {filteredTenants.length} entidades
            </div>
          </div>

          {/* Tabla de Tenants */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/80 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Entidad / Jurisdicción</th>
                    <th className="py-3.5 px-4 font-semibold">Tipo</th>
                    <th className="py-3.5 px-4 font-semibold">Plan SaaS</th>
                    <th className="py-3.5 px-4 font-semibold">Límites & IA</th>
                    <th className="py-3.5 px-4 font-semibold">Estado</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        Cargando catálogo de tenants...
                      </td>
                    </tr>
                  ) : filteredTenants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No se encontraron tenants con el criterio de búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredTenants.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                        {/* Entidad */}
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-bold text-slate-100 flex items-center gap-1.5">
                              <Building2 className="h-4 w-4 text-slate-400" />
                              {t.name}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Globe className="h-3 w-3 text-slate-500" />
                              {t.jurisdiction || "Córdoba, Argentina"}
                            </p>
                          </div>
                        </td>

                        {/* Tipo */}
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 capitalize">
                            {t.type === "municipality"
                              ? "🏛️ Municipio"
                              : t.type === "business"
                              ? "🏢 Empresa B2B"
                              : "🤝 Cooperativa"}
                          </span>
                        </td>

                        {/* Plan */}
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 rounded-md text-xs font-semibold font-mono bg-purple-500/10 border border-purple-500/30 text-purple-300 uppercase">
                            {t.subscription_tier}
                          </span>
                        </td>

                        {/* Límites & IA */}
                        <td className="py-4 px-4">
                          <div className="space-y-1 text-xs">
                            <p className="text-slate-300">
                              📦 Máx: <b className="font-mono text-emerald-400">{t.max_containers}</b> puntos
                            </p>
                            <p className="text-slate-400 flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-blue-400" />
                              IA: <b className="font-mono text-blue-300">{t.ai_monthly_limit}</b> req/m
                            </p>
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              t.subscription_status === "active"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {t.subscription_status === "active" ? "● Activo" : "⏸ Pausado"}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Botón Configurar Cuotas */}
                            <button
                              onClick={() => setSelectedTenantForLimits(t)}
                              className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1 transition-colors"
                              title="Configurar límites y cuotas"
                            >
                              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                              Cuotas
                            </button>

                            {/* Alternar Pausa / Reanudar */}
                            <button
                              onClick={() => handleToggleStatus(t.id, t.subscription_status)}
                              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                t.subscription_status === "active"
                                  ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                  : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                              }`}
                              title={t.subscription_status === "active" ? "Pausar Tenant" : "Reactivar Tenant"}
                            >
                              {t.subscription_status === "active" ? (
                                <PauseCircle className="h-4 w-4" />
                              ) : (
                                <PlayCircle className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PIPELINE DE SOLICITUDES DE ALTA */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-400" />
                  Solicitudes de Onboarding en Espera
                </h3>
                <p className="text-xs text-slate-400">
                  Municipios o empresas que han remitido su expediente para operar en la red EcoMapa.
                </p>
              </div>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-400/50 mx-auto" />
                <p className="font-semibold text-slate-300">Bandeja al día</p>
                <p className="text-xs text-slate-500">No hay solicitudes pendientes de aprobación.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-base">{req.entity_name}</span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 capitalize">
                          {req.type === "municipality" ? "Municipio" : "Empresa Privada"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Provincia: <b className="text-slate-300">{req.province}</b> · Contacto:{" "}
                        <b className="text-slate-300">{req.contact_name}</b> ({req.contact_email})
                      </p>
                      <p className="text-xs text-emerald-400">
                        Proyección inicial: {req.containers_projected} puntos de recolección diferenciada
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => handleApproveRequest(req)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Aprobar & Dar Alta
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req.id)}
                        className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL CONFIGURACIÓN DE LÍMITES Y PERMISOS POR TENANT */}
      {selectedTenantForLimits && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-emerald-400" />
                  Cuotas & Permisos: {selectedTenantForLimits.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Ajuste de límites de infraestructura y consumo de IA.
                </p>
              </div>
              <button
                onClick={() => setSelectedTenantForLimits(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLimits} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Límite Máximo de Contenedores / Puntos Verdes
                </label>
                <input
                  type="number"
                  min="5"
                  max="1000"
                  value={selectedTenantForLimits.max_containers}
                  onChange={(e) =>
                    setSelectedTenantForLimits({
                      ...selectedTenantForLimits,
                      max_containers: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
                <p className="text-[11px] text-slate-500">
                  Capacidad de digitalización en el mapa antes de requerir un upgrade de plan.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Cuota Mensual de Consultas de IA (Groq LLM)
                </label>
                <input
                  type="number"
                  min="500"
                  max="50000"
                  step="500"
                  value={selectedTenantForLimits.ai_monthly_limit}
                  onChange={(e) =>
                    setSelectedTenantForLimits({
                      ...selectedTenantForLimits,
                      ai_monthly_limit: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
                <p className="text-[11px] text-slate-500">
                  Total de clasificaciones automáticas permitidas para los vecinos de esta jurisdicción.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTenantForLimits.ai_enabled}
                    onChange={(e) =>
                      setSelectedTenantForLimits({
                        ...selectedTenantForLimits,
                        ai_enabled: e.target.checked,
                      })
                    }
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="text-xs font-medium text-slate-300">
                    Habilitar Asistente IA de Clasificación en App Móvil
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTenantForLimits.pickups_enabled}
                    onChange={(e) =>
                      setSelectedTenantForLimits({
                        ...selectedTenantForLimits,
                        pickups_enabled: e.target.checked,
                      })
                    }
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="text-xs font-medium text-slate-300">
                    Habilitar Sistema de Retiros de Residuos Voluminosos a Domicilio
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTenantForLimits(null)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Guardar Parámetros
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRO DIRECTO DE TENANT */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-400" />
                Registrar Nuevo Tenant
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Nombre de la Entidad o Municipio</label>
                <input
                  type="text"
                  placeholder="Ej. Municipalidad de Alta Gracia"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Tipo de Entidad</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="municipality">🏛️ Municipio (B2G)</option>
                    <option value="business">🏢 Empresa (B2B)</option>
                    <option value="cooperative">🤝 Cooperativa</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Plan de Suscripción</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="basic">Básico</option>
                    <option value="pro">Pro (B2G Estándar)</option>
                    <option value="enterprise">Enterprise (Ilimitado)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Crear Entidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
