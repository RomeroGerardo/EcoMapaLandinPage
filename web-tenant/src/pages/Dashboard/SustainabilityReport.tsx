import React, { useState } from "react";
import {
  FileText,
  Printer,
  TreePine,
  Truck,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export const SustainabilityReport: React.FC = () => {
  const activeTenant = useAuthStore((state) => state.activeTenant);
  const [selectedPeriod, setSelectedPeriod] = useState("Septiembre 2026");
  const tenantName = activeTenant?.name || "Municipalidad de Villa Carlos Paz";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-0">
      {/* Encabezado y Acciones de Exportación (se ocultan al imprimir con print:hidden) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Panel de Métricas e Informes de Sustentabilidad
          </h1>
          <p className="text-sm text-muted-foreground">
            Auditorías ambientales municipales, reportes de RSE y balance de economía circular según estándares GRI y ODS.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 rounded-xl border bg-background text-sm font-medium focus:outline-none"
          >
            <option value="Septiembre 2026">Período: Septiembre 2026</option>
            <option value="Agosto 2026">Período: Agosto 2026</option>
            <option value="Q3 2026">Tercer Trimestre (Q3 2026)</option>
            <option value="Anual 2026">Balance Anual 2026</option>
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 shadow hover:bg-primary/90 transition-all"
          >
            <Printer className="h-4 w-4" />
            Exportar / Imprimir PDF Oficial
          </button>
        </div>
      </div>

      {/* DOCUMENTO FORMATEADO PARA AUDITORÍA AMBIENTAL */}
      <div className="rounded-2xl border bg-card p-8 md:p-10 shadow-lg space-y-8 print-clean-page print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white print:text-black">
        {/* Membrete Oficial del Informe */}
        <div className="border-b pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                Informe Oficial de Auditoría Ambiental
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-foreground print:text-black mt-2">{tenantName}</h2>
            <p className="text-xs text-muted-foreground print:text-gray-600">
              Plataforma EcoMapa V2.1 · CivicLoop Technologies S.A.S. · Fecha de emisión: {new Date().toLocaleDateString("es-AR")}
            </p>
          </div>

          <div className="text-left sm:text-right font-mono text-xs text-muted-foreground">
            <p>ID Registro: AUD-2026-VCP-09</p>
            <p>Período Evaluado: <b className="text-foreground">{selectedPeriod}</b></p>
            <p className="text-emerald-600 font-bold">Estado: Convalidado con Trazabilidad REP</p>
          </div>
        </div>

        {/* EJE A: IMPACTO AMBIENTAL Y ECONOMÍA CIRCULAR */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-foreground border-b pb-2">
            <TreePine className="h-5 w-5 text-emerald-500" />
            <span>A. Métricas de Impacto Ambiental y Economía Circular</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold">Tonelaje Total (CRR)</p>
              <p className="text-2xl font-bold font-mono text-foreground">18.42 Tn</p>
              <p className="text-[10px] text-emerald-600">+12% vs. mes anterior</p>
            </div>

            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold">Emisiones CO₂ Mitigadas</p>
              <p className="text-2xl font-bold font-mono text-emerald-600">31.8 Tn</p>
              <p className="text-[10px] text-muted-foreground">Por desvío de vertedero</p>
            </div>

            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold">NOx Evitado en Logística</p>
              <p className="text-2xl font-bold font-mono text-teal-600">420 kg</p>
              <p className="text-[10px] text-muted-foreground">Optimización de transporte</p>
            </div>

            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold">Índice Circularidad Local</p>
              <p className="text-2xl font-bold font-mono text-primary">68.5%</p>
              <p className="text-[10px] text-muted-foreground">Reincorporado a cooperativas</p>
            </div>
          </div>

          {/* Desglose por Material Reciclado */}
          <div className="p-4 rounded-xl border bg-muted/10 space-y-2">
            <p className="text-xs font-bold text-foreground uppercase tracking-wide">
              Desglose de Materiales Recuperados en la Jurisdicción
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">🟡 Plásticos / PET:</span>{" "}
                <b className="font-mono text-foreground">6,820 kg</b>
              </div>
              <div>
                <span className="text-muted-foreground">🔵 Papel y Cartón:</span>{" "}
                <b className="font-mono text-foreground">7,140 kg</b>
              </div>
              <div>
                <span className="text-muted-foreground">🟢 Vidrio Blanco/Verde:</span>{" "}
                <b className="font-mono text-foreground">3,980 kg</b>
              </div>
              <div>
                <span className="text-muted-foreground">🔴 Pilas y RAEE:</span>{" "}
                <b className="font-mono text-foreground">480 kg</b>
              </div>
            </div>
          </div>
        </div>

        {/* EJE B: EFICIENCIA OPERATIVA Y LOGÍSTICA */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-foreground border-b pb-2">
            <Truck className="h-5 w-5 text-blue-500" />
            <span>B. Métricas de Eficiencia Operativa y Logística</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold">Llenado Promedio Contenedores</p>
              <p className="text-2xl font-bold font-mono text-foreground">64.2%</p>
              <p className="text-[10px] text-emerald-600">Umbral óptimo sin desbordes</p>
            </div>

            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold">Reducción de Kilómetros</p>
              <p className="text-2xl font-bold font-mono text-emerald-600">-28.4%</p>
              <p className="text-[10px] text-muted-foreground">412 km ahorrados este mes</p>
            </div>

            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold">Tiempo Respuesta Incidencias</p>
              <p className="text-2xl font-bold font-mono text-primary">1.2 días</p>
              <p className="text-[10px] text-muted-foreground">Promedio en reparar daños</p>
            </div>
          </div>
        </div>

        {/* EJE C: PARTICIPACIÓN Y COMPORTAMIENTO CIUDADANO */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-foreground border-b pb-2">
            <Users className="h-5 w-5 text-purple-500" />
            <span>C. Métricas de Participación y Comportamiento Ciudadano</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold">Usuarios Activos Mensuales (NUA)</p>
              <p className="text-2xl font-bold font-mono text-foreground">4,280 vecinos</p>
              <p className="text-[10px] text-emerald-600">+19% de adopción ciudadana</p>
            </div>

            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold">Tasa de Canje de Recompensas</p>
              <p className="text-2xl font-bold font-mono text-purple-600">76.4%</p>
              <p className="text-[10px] text-muted-foreground">Ecopuntos canjeados en comercios</p>
            </div>

            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold">Precisión del Asistente IA</p>
              <p className="text-2xl font-bold font-mono text-blue-600">98.2%</p>
              <p className="text-[10px] text-muted-foreground">Clasificaciones sin errores reportados</p>
            </div>
          </div>
        </div>

        {/* Firmas de Autoridad Ambiental */}
        <div className="pt-8 border-t grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-b border-muted-foreground/30 w-48 mx-auto pb-8 mb-2" />
            <p className="font-bold text-foreground">Dirección de Gestión Ambiental</p>
            <p className="text-muted-foreground">{tenantName}</p>
          </div>
          <div>
            <div className="border-b border-muted-foreground/30 w-48 mx-auto pb-8 mb-2" />
            <p className="font-bold text-foreground">Auditoría Externa de Economía Circular</p>
            <p className="text-muted-foreground">EcoMapa Certificación · CivicLoop Technologies S.A.S.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
