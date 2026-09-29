import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MAP_LAYERS, DEFAULT_MAP_CENTER, DEFAULT_ZOOM } from "@/lib/mapConfig";
import { Layers, Eye, MapPin, Sparkles, Crosshair, Compass } from "lucide-react";

export interface GeoPoint {
  id: string;
  name: string;
  type: string;
  color?: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  tenant_name?: string;
}

export interface TenantCluster {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  points_count: number;
  ai_queries_count: number;
  status: string;
}

interface GlobalHeatMapProps {
  points: GeoPoint[];
  tenants: TenantCluster[];
  selectedProvince?: string;
}

export const GlobalHeatMap: React.FC<GlobalHeatMapProps> = ({ points, tenants }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [activeLayer, setActiveLayer] = useState<keyof typeof MAP_LAYERS>("osmDark");
  const [viewMode, setViewMode] = useState<"heat" | "points" | "tenants">("heat");

  // Estados de Geolocalización
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<"buscando" | "activo" | "denegado">("buscando");

  // Función para capturar y volar a la ubicación del usuario
  const locateUserPosition = (shouldFly = true) => {
    if (!navigator.geolocation) {
      setGpsStatus("denegado");
      return;
    }

    setIsLocating(true);
    setGpsStatus("buscando");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        setGpsStatus("activo");
        setIsLocating(false);

        const map = mapInstanceRef.current;
        if (map) {
          if (shouldFly) {
            map.flyTo([lat, lng], 13, { duration: 1.5 });
          }

          // Remover marcador previo de usuario si existía
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          // Icono animado de pulso satelital GPS
          const gpsDivIcon = L.divIcon({
            className: "gps-superadmin-marker",
            html: `
              <div style="position: relative; width: 28px; height: 28px;">
                <div style="position: absolute; inset: 0; background: rgba(16, 185, 129, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="position: absolute; top: 4px; left: 4px; width: 20px; height: 20px; background: #059669; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.5);"></div>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const userMarker = L.marker([lat, lng], { icon: gpsDivIcon }).addTo(map);
          userMarker.bindPopup(`
            <div style="font-family: inherit; font-size: 13px; color: #f8fafc; padding: 2px;">
              <b style="color: #34d399; display: flex; align-items: center; gap: 4px; font-size: 14px;">
                📍 Tu Ubicación Actual (SuperAdmin Root)
              </b>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; font-family: monospace;">
                Coordenadas GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}
              </p>
              <p style="margin: 4px 0 0 0; font-size: 10px; color: #10b981;">● Nodo Central de Supervisión Territorial</p>
            </div>
          `);
          userMarkerRef.current = userMarker;
        }
      },
      (error) => {
        console.warn("Geolocalización denegada o no disponible:", error);
        setGpsStatus("denegado");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: DEFAULT_MAP_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        attributionControl: true,
      });

      const selectedTileConfig = MAP_LAYERS[activeLayer];
      L.tileLayer(selectedTileConfig.url, {
        attribution: selectedTileConfig.attribution,
        maxZoom: selectedTileConfig.maxZoom,
        className: selectedTileConfig.className || "",
        subdomains: selectedTileConfig.subdomains || "abc",
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;

      // Disparar geolocalización satelital al montar el mapa
      locateUserPosition(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Actualizar capa de tiles al cambiar activeLayer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remover layers existentes que sean TileLayer
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const selectedTileConfig = MAP_LAYERS[activeLayer];
    L.tileLayer(selectedTileConfig.url, {
      attribution: selectedTileConfig.attribution,
      maxZoom: selectedTileConfig.maxZoom,
      className: selectedTileConfig.className || "",
      subdomains: selectedTileConfig.subdomains || "abc",
    }).addTo(map);
  }, [activeLayer]);

  // Dibujar marcadores según el viewMode (Heatmap de uso, Puntos individuales, Cobertura de Tenants)
  useEffect(() => {
    const layerGroup = layerGroupRef.current;
    if (!layerGroup) return;

    layerGroup.clearLayers();

    // 1. MODO HEATMAP: Círculos concéntricos de calor ponderados por actividad
    if (viewMode === "heat") {
      tenants.forEach((tenant) => {
        const activityWeight = Math.max(tenant.points_count * 2 + tenant.ai_queries_count, 10);
        const radius = Math.min(Math.max(activityWeight * 2, 25), 65);

        // Halo exterior de calor
        L.circleMarker([tenant.latitude, tenant.longitude], {
          radius: radius,
          fillColor: "#10b981",
          fillOpacity: 0.18,
          color: "#10b981",
          weight: 1,
          opacity: 0.4,
        }).addTo(layerGroup);

        // Núcleo central
        const coreMarker = L.circleMarker([tenant.latitude, tenant.longitude], {
          radius: 12,
          fillColor: "#059669",
          fillOpacity: 0.85,
          color: "#ffffff",
          weight: 2,
        }).addTo(layerGroup);

        coreMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; line-height: 1.4; color: #f8fafc;">
            <p style="font-weight: 700; margin: 0 0 4px 0; color: #34d399; font-size: 14px;">${tenant.name}</p>
            <p style="margin: 0; color: #cbd5e1; font-size: 12px;">Jurisdicción: <b style="color: #fff;">${tenant.type.toUpperCase()}</b></p>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 8px 0;" />
            <div style="display: flex; gap: 12px;">
              <div>
                <span style="font-size: 11px; color: #94a3b8; display: block;">Contenedores</span>
                <b style="font-size: 15px; color: #38bdf8;">${tenant.points_count}</b>
              </div>
              <div>
                <span style="font-size: 11px; color: #94a3b8; display: block;">Consultas IA</span>
                <b style="font-size: 15px; color: #a78bfa;">${tenant.ai_queries_count}</b>
              </div>
            </div>
            <p style="margin: 8px 0 0 0; font-size: 11px; color: #10b981;">● Nodo de alta intensidad ecológica</p>
          </div>
        `);
      });
    }

    // 2. MODO PUNTOS VERDES: Todos los puntos georreferenciados en el país
    if (viewMode === "points") {
      points.forEach((point) => {
        const marker = L.circleMarker([point.latitude, point.longitude], {
          radius: 8,
          fillColor: point.color === "rojo" ? "#ef4444" : point.color === "amarillo" ? "#eab308" : point.color === "azul" ? "#3b82f6" : "#10b981",
          fillOpacity: 0.9,
          color: "#ffffff",
          weight: 1.5,
        }).addTo(layerGroup);

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; color: #f8fafc;">
            <b style="font-size: 14px; color: #6ee7b7;">${point.name}</b>
            <p style="margin: 2px 0; color: #cbd5e1; font-size: 12px;">Tipo: ${point.type}</p>
            ${point.address ? `<p style="margin: 2px 0; color: #94a3b8; font-size: 11px;">📍 ${point.address}</p>` : ""}
            <p style="margin: 6px 0 0 0; font-size: 10px; color: #a855f7;">Tenant: ${point.tenant_name || "Municipio Activo"}</p>
          </div>
        `);
      });
    }

    // 3. MODO TENANTS: Red de Jurisdicciones
    if (viewMode === "tenants") {
      tenants.forEach((tenant) => {
        const marker = L.circleMarker([tenant.latitude, tenant.longitude], {
          radius: 14,
          fillColor: "#8b5cf6",
          fillOpacity: 0.8,
          color: "#ede9fe",
          weight: 2,
        }).addTo(layerGroup);

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; color: #f8fafc;">
            <b style="font-size: 14px; color: #c084fc;">${tenant.name}</b>
            <p style="margin: 4px 0; color: #cbd5e1; font-size: 12px;">Estado: <span style="color: #4ade80;">${tenant.status.toUpperCase()}</span></p>
            <p style="margin: 0; color: #94a3b8; font-size: 11px;">Puntos asignados: ${tenant.points_count}</p>
          </div>
        `);
      });
    }
  }, [viewMode, points, tenants]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden flex flex-col relative">
      {/* Controles de Capas y Modos en Header Flotante */}
      <div className="p-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Eye className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                Mapa de Calor & Telemetría Geoespacial
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  gpsStatus === "activo"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : gpsStatus === "buscando"
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {gpsStatus === "activo"
                  ? "🟢 GPS En Línea"
                  : gpsStatus === "buscando"
                  ? "🟡 Obteniendo Satélite..."
                  : "⚪ GPS en Espera"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Visualización multi-jurisdiccional con auto-geolocalización satelital activa
            </p>
          </div>
        </div>

        {/* Acciones y Selector de Modos de Vista */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botón de Geolocalización Activa */}
          <button
            onClick={() => locateUserPosition(true)}
            disabled={isLocating}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              gpsStatus === "activo"
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
            }`}
            title="Activar geolocalización satelital y centrar mapa en mi posición física"
          >
            <Crosshair className={`h-3.5 w-3.5 ${isLocating ? "animate-spin text-emerald-400" : "text-emerald-400"}`} />
            <span>{isLocating ? "Localizando..." : "Centrar en mi GPS"}</span>
          </button>

          <div className="flex p-0.5 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setViewMode("heat")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "heat"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Densidad & Calor
            </button>
            <button
              onClick={() => setViewMode("points")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "points"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              Puntos Verdes ({points.length})
            </button>
            <button
              onClick={() => setViewMode("tenants")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "tenants"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Nodos Tenants ({tenants.length})
            </button>
          </div>

          {/* Selector de Tiles Base */}
          <select
            value={activeLayer}
            onChange={(e) => setActiveLayer(e.target.value as keyof typeof MAP_LAYERS)}
            className="text-xs rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="osmDark">Capa: OpenStreetMap Dark (Libre)</option>
            <option value="esriDark">Capa: Esri Dark Canvas</option>
            <option value="osmStandard">Capa: OpenStreetMap Estándar</option>
            <option value="esriStreet">Capa: Esri World Street</option>
          </select>
        </div>
      </div>

      {/* Contenedor del Mapa */}
      <div className="relative w-full h-[460px] bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Leyenda Flotante */}
        <div className="absolute bottom-4 left-4 z-[400] bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-2 pointer-events-auto">
          <p className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
            Leyenda de Actividad
          </p>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
            <span className="text-slate-300">Puntos de Reciclaje / EcoPuntos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-purple-500 ring-2 ring-purple-500/30" />
            <span className="text-slate-300">Sede Tenant / Municipio</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-400/30 border border-emerald-400" />
            <span className="text-slate-400">Radio de Densidad de Consultas IA</span>
          </div>
        </div>
      </div>
    </div>
  );
};
