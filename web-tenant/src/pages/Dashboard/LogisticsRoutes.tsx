import React, { useState } from "react";
import {
  Truck,
  Route,
  Fuel,
  TrendingDown,
  Navigation,
  Calendar,
  RotateCw,
} from "lucide-react";

interface CollectionRoute {
  id: string;
  name: string;
  truck_id: string;
  driver_name: string;
  zone: string;
  scheduled_days: string[];
  total_containers: number;
  critical_containers: number;
  optimized_distance_km: number;
  traditional_distance_km: number;
  fuel_saved_liters: number;
  co2_saved_kg: number;
  status: "en_curso" | "programada" | "completada";
}

export const LogisticsRoutes: React.FC = () => {
  const [routes, setRoutes] = useState<CollectionRoute[]>([
    {
      id: "route-1",
      name: "Ruta 01 - Circuito Centro & Nueva Córdoba",
      truck_id: "CAM-04 (Mercedes-Benz Atego)",
      driver_name: "Gonzalo Peralta",
      zone: "Casco Histórico y Parque",
      scheduled_days: ["Lun", "Mié", "Vie"],
      total_containers: 24,
      critical_containers: 6,
      optimized_distance_km: 18.4,
      traditional_distance_km: 26.2,
      fuel_saved_liters: 3.1,
      co2_saved_kg: 8.2,
      status: "en_curso",
    },
    {
      id: "route-2",
      name: "Ruta 02 - Corredor Alberdi & Costanera",
      truck_id: "CAM-02 (Iveco Tector)",
      driver_name: "Esteban Quiroga",
      zone: "Norte - Alberdi / Villa Páez",
      scheduled_days: ["Mar", "Jue"],
      total_containers: 16,
      critical_containers: 2,
      optimized_distance_km: 14.1,
      traditional_distance_km: 19.8,
      fuel_saved_liters: 2.3,
      co2_saved_kg: 6.0,
      status: "programada",
    },
    {
      id: "route-3",
      name: "Ruta 03 - Puntos Especiales REP & Pilas",
      truck_id: "UTIL-01 (Furgón Eléctrico Kangoo ZE)",
      driver_name: "Marcos Toledo",
      zone: "Farmacias, Supermercados y Centros Verdes",
      scheduled_days: ["Sáb"],
      total_containers: 9,
      critical_containers: 1,
      optimized_distance_km: 11.2,
      traditional_distance_km: 15.6,
      fuel_saved_liters: 4.5,
      co2_saved_kg: 11.8,
      status: "completada",
    },
  ]);

  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleRunOptimizer = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setRoutes((prev) =>
        prev.map((r) => ({
          ...r,
          optimized_distance_km: Number((r.optimized_distance_km * 0.96).toFixed(1)),
          fuel_saved_liters: Number((r.fuel_saved_liters + 0.4).toFixed(1)),
          co2_saved_kg: Number((r.co2_saved_kg + 1.1).toFixed(1)),
        }))
      );
    }, 1200);
  };

  const totalFuelSaved = routes.reduce((acc, r) => acc + r.fuel_saved_liters, 0);
  const totalCo2Saved = routes.reduce((acc, r) => acc + r.co2_saved_kg, 0);
  const avgDistanceReduction = "28.4%";

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            Logística y Optimización de Rutas de Recolección
          </h1>
          <p className="text-sm text-muted-foreground">
            Planificación inteligente de trayectos para camiones recolectores según volumen proyectado y telemetría de llenado.
          </p>
        </div>

        <button
          onClick={handleRunOptimizer}
          disabled={isOptimizing}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 shadow hover:bg-primary/90 transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          <RotateCw className={`h-4 w-4 ${isOptimizing ? "animate-spin" : ""}`} />
          {isOptimizing ? "Calculando Trayectos..." : "Reoptimizar Rutas de Hoy"}
        </button>
      </div>

      {/* Métricas de Eficiencia Logística */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Reducción de Kilómetros</span>
            <TrendingDown className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{avgDistanceReduction}</p>
          <p className="text-xs text-muted-foreground">Menor desgaste vehicular por ruta dinámica</p>
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Combustible Ahorrado</span>
            <Fuel className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{totalFuelSaved.toFixed(1)} Litros</p>
          <p className="text-xs text-muted-foreground">Ahorro semanal estimado en la flota municipal</p>
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Gases GEI Mitigados</span>
            <Navigation className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-primary">{totalCo2Saved.toFixed(1)} kg CO₂</p>
          <p className="text-xs text-muted-foreground">Evitado directamente en logística de transporte</p>
        </div>
      </div>

      {/* Listado de Rutas */}
      <div className="rounded-2xl border bg-card shadow-sm p-5 space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Route className="h-5 w-5 text-primary" />
          Circuitos Logísticos Activos
        </h3>

        <div className="space-y-3">
          {routes.map((route) => (
            <div
              key={route.id}
              className="p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-sm">{route.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      route.status === "en_curso"
                        ? "bg-blue-500/10 text-blue-600 border border-blue-500/20 animate-pulse"
                        : route.status === "programada"
                        ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    }`}
                  >
                    ● {route.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Camión: <b className="text-foreground">{route.truck_id}</b> · Chofer:{" "}
                  <b className="text-foreground">{route.driver_name}</b> · Zona: {route.zone}
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" /> Frecuencia: {route.scheduled_days.join(", ")}
                  </span>
                  <span className="font-mono text-primary">
                    📦 {route.total_containers} contenedores ({route.critical_containers} críticos)
                  </span>
                </div>
              </div>

              {/* Comparativa de Recorrido */}
              <div className="flex items-center gap-6 border-t lg:border-t-0 pt-3 lg:pt-0">
                <div className="text-left lg:text-right">
                  <p className="text-[11px] text-muted-foreground">Recorrido Optimizado</p>
                  <p className="text-base font-bold font-mono text-emerald-600">
                    {route.optimized_distance_km} km
                  </p>
                  <p className="text-[10px] text-muted-foreground line-through font-mono">
                    Tradicional: {route.traditional_distance_km} km
                  </p>
                </div>

                <div className="text-left lg:text-right">
                  <p className="text-[11px] text-muted-foreground">Impacto Ruta</p>
                  <p className="text-xs font-bold font-mono text-foreground">
                    -{route.fuel_saved_liters} L combustible
                  </p>
                  <p className="text-[10px] text-primary font-mono">
                    -{route.co2_saved_kg} kg CO₂
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
