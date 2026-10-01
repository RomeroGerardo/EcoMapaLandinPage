import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Clock,
  Trash2,
  Edit2,
  Navigation,
  Crosshair,
  Compass,
} from "lucide-react";

export interface RecyclingContainer {
  id: string;
  name: string;
  type: string;
  color: "verde" | "azul" | "amarillo" | "rojo" | "naranja" | "gris";
  status: "disponible" | "lleno" | "mantenimiento";
  capacity_liters: number;
  current_fill_percentage: number;
  latitude: number;
  longitude: number;
  address: string;
  emptying_frequency: string;
  photo_url?: string;
  last_emptied_at?: string;
}

const MATERIAL_MAP = {
  verde: { label: "Vidrio & Orgánico Seco", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40", hex: "#10b981" },
  azul: { label: "Papel & Cartón", badge: "bg-blue-500/20 text-blue-400 border-blue-500/40", hex: "#3b82f6" },
  amarillo: { label: "Plásticos & PET", badge: "bg-amber-500/20 text-amber-400 border-amber-500/40", hex: "#eab308" },
  rojo: { label: "Pilas & Residuos Peligrosos", badge: "bg-rose-500/20 text-rose-400 border-rose-500/40", hex: "#ef4444" },
  naranja: { label: "Electrónicos (RAEE) & Voluminosos", badge: "bg-orange-500/20 text-orange-400 border-orange-500/40", hex: "#f97316" },
  gris: { label: "Metales & Latas", badge: "bg-slate-500/20 text-slate-300 border-slate-500/40", hex: "#64748b" },
};

const DEFAULT_CONTAINERS: RecyclingContainer[] = [
  {
    id: "cont-1",
    name: "Punto Verde Plaza San Martín",
    type: "Plásticos & PET",
    color: "amarillo",
    status: "disponible",
    capacity_liters: 1100,
    current_fill_percentage: 42,
    latitude: -31.4167,
    longitude: -64.1833,
    address: "Plaza San Martín, Centro",
    emptying_frequency: "Lunes, Miércoles y Viernes",
  },
  {
    id: "cont-2",
    name: "Buzón Pilas & Baterías - Alberdi",
    type: "Pilas & Baterías",
    color: "rojo",
    status: "lleno",
    capacity_liters: 240,
    current_fill_percentage: 95,
    latitude: -31.412,
    longitude: -64.195,
    address: "Av. Colón 1200",
    emptying_frequency: "Martes y Jueves",
  },
  {
    id: "cont-3",
    name: "Campana Papel y Cartón Nueva Córdoba",
    type: "Papel & Cartón",
    color: "azul",
    status: "mantenimiento",
    capacity_liters: 1500,
    current_fill_percentage: 10,
    latitude: -31.428,
    longitude: -64.175,
    address: "Bv. Chacabuco y San Lorenzo",
    emptying_frequency: "Diario (Turno Noche)",
  },
  {
    id: "cont-4",
    name: "Estación Vidrio & Botellas Costanera",
    type: "Vidrio & Orgánico Seco",
    color: "verde",
    status: "disponible",
    capacity_liters: 1800,
    current_fill_percentage: 60,
    latitude: -31.405,
    longitude: -64.189,
    address: "Av. Costanera y Puente Centenario",
    emptying_frequency: "Lunes a Sábado",
  },
];

export const MapManager: React.FC = () => {
  const [containers, setContainers] = useState<RecyclingContainer[]>(DEFAULT_CONTAINERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [colorFilter, setColorFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState<RecyclingContainer | null>(null);

  // Estados de Geolocalización GPS
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"buscando" | "activo" | "denegado">("buscando");

  // Referencias de Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    color: "verde" as RecyclingContainer["color"],
    status: "disponible" as RecyclingContainer["status"],
    capacity_liters: 1100,
    current_fill_percentage: 0,
    latitude: -31.4201,
    longitude: -64.1888,
    address: "",
    emptying_frequency: "Lunes a Viernes",
    photo_url: "",
  });

  // Función para capturar y centrar en la geolocalización actual
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

        if (mapInstanceRef.current) {
          if (shouldFly) {
            mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1.5 });
          }

          // Remover marcador de usuario anterior si existía
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          // Marcador animado para la ubicación del usuario
          const gpsDivIcon = L.divIcon({
            className: "gps-user-marker",
            html: `
              <div style="position: relative; width: 28px; height: 28px;">
                <div style="position: absolute; inset: 0; background: rgba(16, 185, 129, 0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="position: absolute; top: 4px; left: 4px; width: 20px; height: 20px; background: #059669; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"></div>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const userMarker = L.marker([lat, lng], { icon: gpsDivIcon }).addTo(mapInstanceRef.current);
          userMarker.bindPopup(`
            <div style="font-family: inherit; font-size: 13px; color: #0f172a; padding: 2px;">
              <b style="color: #059669; display: flex; align-items: center; gap: 4px;">
                📍 Tu Ubicación Actual (GPS)
              </b>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b; font-family: monospace;">
                ${lat.toFixed(5)}, ${lng.toFixed(5)}
              </p>
            </div>
          `);
          userMarkerRef.current = userMarker;
        }
      },
      (error) => {
        console.warn("Geolocalización no disponible o permiso denegado:", error);
        setGpsStatus("denegado");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Inicializar Leaflet con OpenStreetMap 100% libre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = [-31.4201, -64.1888]; // Córdoba Centro
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 13,
        zoomControl: true,
      });

      // Capa de OpenStreetMap pública, libre y sin API Key
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Evento: Al hacer clic en el mapa, sugerir crear un nuevo contenedor con esas coordenadas
      map.on("click", (e: L.LeafletMouseEvent) => {
        setFormData((prev) => ({
          ...prev,
          latitude: Number(e.latlng.lat.toFixed(6)),
          longitude: Number(e.latlng.lng.toFixed(6)),
        }));
      });

      // Solicitar geolocalización automáticamente al cargar
      locateUserPosition(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Dibujar los marcadores de contenedores cuando cambian
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    if (!markersLayer) return;

    markersLayer.clearLayers();

    containers.forEach((c) => {
      const hexColor = MATERIAL_MAP[c.color]?.hex || "#10b981";

      const circle = L.circleMarker([c.latitude, c.longitude], {
        radius: 10,
        fillColor: hexColor,
        fillOpacity: 0.9,
        color: "#ffffff",
        weight: 2,
      }).addTo(markersLayer);

      circle.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; color: #0f172a; min-width: 180px;">
          <b style="font-size: 14px; color: ${hexColor};">${c.name}</b>
          <p style="margin: 3px 0; color: #475569; font-size: 12px;"><b>Material:</b> ${c.type}</p>
          <p style="margin: 2px 0; color: #64748b; font-size: 11px;">📍 ${c.address}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 6px 0;" />
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span>Llenado: <b>${c.current_fill_percentage}%</b></span>
            <span>Estado: <b>${c.status.toUpperCase()}</b></span>
          </div>
          <p style="margin: 6px 0 0 0; font-size: 10px; color: #94a3b8;">Frecuencia: ${c.emptying_frequency}</p>
        </div>
      `);
    });
  }, [containers]);

  // Capturar coordenadas GPS actuales para el formulario
  const handleCaptureCurrentGps = () => {
    locateUserPosition(false);
    if (userLocation) {
      setFormData((prev) => ({
        ...prev,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
      }));
    } else {
      navigator.geolocation?.getCurrentPosition((pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
      });
    }
  };

  const handleOpenCreateModal = () => {
    setEditingContainer(null);
    setFormData({
      name: "",
      color: "verde",
      status: "disponible",
      capacity_liters: 1100,
      current_fill_percentage: 0,
      latitude: userLocation ? userLocation.lat : -31.4201,
      longitude: userLocation ? userLocation.lng : -64.1888,
      address: "",
      emptying_frequency: "Lunes, Miércoles y Viernes",
      photo_url: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: RecyclingContainer) => {
    setEditingContainer(c);
    setFormData({
      name: c.name,
      color: c.color,
      status: c.status,
      capacity_liters: c.capacity_liters,
      current_fill_percentage: c.current_fill_percentage,
      latitude: c.latitude,
      longitude: c.longitude,
      address: c.address,
      emptying_frequency: c.emptying_frequency,
      photo_url: c.photo_url || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveContainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingContainer) {
      setContainers((prev) =>
        prev.map((c) =>
          c.id === editingContainer.id
            ? { ...c, ...formData, type: MATERIAL_MAP[formData.color].label }
            : c
        )
      );
    } else {
      const newCont: RecyclingContainer = {
        id: `cont-${Date.now()}`,
        ...formData,
        type: MATERIAL_MAP[formData.color].label,
      };
      setContainers((prev) => [newCont, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteContainer = (id: string) => {
    setContainers((prev) => prev.filter((c) => c.id !== id));
  };

  const filteredContainers = containers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesColor = colorFilter === "all" || c.color === colorFilter;
    return matchesSearch && matchesStatus && matchesColor;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Gestión de Puntos de Reciclaje (ABM Georreferenciado)
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitoreo en tiempo real, geolocalización satelital y administración de contenedores municipales.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Botón de Geolocalización Activa */}
          <button
            onClick={() => locateUserPosition(true)}
            disabled={isLocating}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              gpsStatus === "activo"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-background text-foreground hover:bg-muted"
            }`}
            title="Activar geolocalización y centrar mapa en mi posición"
          >
            <Crosshair className={`h-4 w-4 ${isLocating ? "animate-spin text-primary" : "text-emerald-500"}`} />
            <span>{isLocating ? "Localizando..." : "Centrar en mi GPS"}</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 shadow hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" />
            Nuevo Punto
          </button>
        </div>
      </div>

      {/* MAPA INTERACTIVO CON GEOLOCALIZACIÓN ACTIVADA */}
      <div className="rounded-2xl border bg-card shadow-lg overflow-hidden relative z-0 isolate">
        <div className="p-3.5 border-b flex flex-wrap items-center justify-between gap-3 bg-muted/20">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-primary" />
              Visor Georreferenciado Activo
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                gpsStatus === "activo"
                  ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                  : gpsStatus === "buscando"
                  ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                  : "bg-slate-500/15 text-slate-600 border-slate-500/30"
              }`}
            >
              {gpsStatus === "activo"
                ? "🟢 GPS En Línea"
                : gpsStatus === "buscando"
                ? "🟡 Obteniendo Satélite..."
                : "⚪ GPS en Espera"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Tip: Haz clic en el mapa para capturar coordenadas GPS automáticamente.</span>
          </div>
        </div>

        {/* Contenedor del Mapa Leaflet (aislado en z-0) */}
        <div className="relative w-full h-[380px] bg-muted/10 z-0 isolate">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Leyenda de colores flotante */}
          <div className="absolute bottom-3 left-3 z-[400] bg-background/95 backdrop-blur border p-2.5 rounded-xl shadow-md text-xs space-y-1">
            <p className="font-bold text-[10px] uppercase text-muted-foreground">Contenedores en Mapa</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Vidrio/Orgánico</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Papel/Cartón</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Plásticos/PET</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Pilas/Peligrosos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-card shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Disponibles / Operativos</p>
            <p className="text-2xl font-bold text-emerald-600">
              {containers.filter((c) => c.status === "disponible").length}
            </p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-emerald-500/30" />
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Llenos (Requieren Vaciado)</p>
            <p className="text-2xl font-bold text-rose-600">
              {containers.filter((c) => c.status === "lleno").length}
            </p>
          </div>
          <AlertTriangle className="h-8 w-8 text-rose-500/30" />
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">En Mantenimiento</p>
            <p className="text-2xl font-bold text-amber-600">
              {containers.filter((c) => c.status === "mantenimiento").length}
            </p>
          </div>
          <Wrench className="h-8 w-8 text-amber-500/30" />
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre, dirección o material..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Filtro Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Todos los estados</option>
            <option value="disponible">🟢 Disponibles</option>
            <option value="lleno">🔴 Llenos / Críticos</option>
            <option value="mantenimiento">🟡 En Mantenimiento</option>
          </select>

          {/* Filtro Material/Color */}
          <select
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Todos los materiales</option>
            <option value="verde">🟢 Vidrio / Orgánico</option>
            <option value="azul">🔵 Papel y Cartón</option>
            <option value="amarillo">🟡 Plásticos & PET</option>
            <option value="rojo">🔴 Pilas & Peligrosos</option>
            <option value="naranja">🟠 RAEE & Voluminosos</option>
            <option value="gris">⚪ Metales</option>
          </select>
        </div>
      </div>

      {/* Tabla de Puntos */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider border-b">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Contenedor / Ubicación</th>
                <th className="py-3.5 px-4 font-semibold">Material / Color</th>
                <th className="py-3.5 px-4 font-semibold">Capacidad & Llenado</th>
                <th className="py-3.5 px-4 font-semibold">Frecuencia Vaciado</th>
                <th className="py-3.5 px-4 font-semibold">Estado</th>
                <th className="py-3.5 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredContainers.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  {/* Nombre y GPS */}
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-semibold text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.address}</p>
                      <p className="text-[11px] font-mono text-primary flex items-center gap-1 mt-0.5">
                        <Navigation className="h-3 w-3" />
                        {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                      </p>
                    </div>
                  </td>

                  {/* Material & Color */}
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${MATERIAL_MAP[c.color].badge}`}>
                      {MATERIAL_MAP[c.color].label}
                    </span>
                  </td>

                  {/* Capacidad y Barra de Llenado */}
                  <td className="py-4 px-4">
                    <div className="space-y-1 w-36">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-muted-foreground">{c.capacity_liters} L</span>
                        <span className="font-bold text-foreground">{c.current_fill_percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            c.current_fill_percentage > 85
                              ? "bg-rose-500"
                              : c.current_fill_percentage > 50
                              ? "bg-amber-400"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${c.current_fill_percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Frecuencia de Vaciado */}
                  <td className="py-4 px-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      {c.emptying_frequency}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        c.status === "disponible"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : c.status === "lleno"
                          ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}
                    >
                      {c.status === "disponible"
                        ? "● Disponible"
                        : c.status === "lleno"
                        ? "⚠️ Lleno / Crítico"
                        : "🔧 En Reparación"}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(c)}
                        className="p-1.5 rounded-lg border hover:bg-muted text-foreground transition-colors"
                        title="Editar punto"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteContainer(c.id)}
                        className="p-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                        title="Dar de baja punto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORMULARIO DINÁMICO MODAL CON CAPTURA GPS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-card border shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 relative z-[10000]">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {editingContainer ? "Modificar Contenedor" : "Alta de Contenedor de Reciclaje"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Completa los datos del punto y asigna las coordenadas satelitales.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContainer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Nombre o Referencia del Contenedor</label>
                <input
                  type="text"
                  placeholder="Ej. EcoPunto Costanera Norte"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Color & Material Asignado</label>
                  <select
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value as RecyclingContainer["color"] })
                    }
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="verde">🟢 Verde - Vidrio / Orgánico</option>
                    <option value="azul">🔵 Azul - Papel & Cartón</option>
                    <option value="amarillo">🟡 Amarillo - Plásticos & PET</option>
                    <option value="rojo">🔴 Rojo - Pilas & Peligrosos</option>
                    <option value="naranja">🟠 Naranja - RAEE / Voluminosos</option>
                    <option value="gris">⚪ Gris - Metales & Latas</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Estado Operativo</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as RecyclingContainer["status"] })
                    }
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="disponible">🟢 Disponible / En Servicio</option>
                    <option value="lleno">🔴 Lleno / Vaciado Urgente</option>
                    <option value="mantenimiento">🟡 En Mantenimiento</option>
                  </select>
                </div>
              </div>

              {/* Captura de Coordenadas GPS */}
              <div className="p-3.5 rounded-xl border bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Navigation className="h-3.5 w-3.5 text-primary" />
                    Georreferenciación GPS
                  </label>
                  <button
                    type="button"
                    onClick={handleCaptureCurrentGps}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    📡 Capturar mi GPS actual
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">Latitud</span>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg border bg-background text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">Longitud</span>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg border bg-background text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Capacidad (Litros)</label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    value={formData.capacity_liters}
                    onChange={(e) => setFormData({ ...formData, capacity_liters: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Frecuencia de Vaciado</label>
                  <input
                    type="text"
                    placeholder="Ej. Martes y Jueves 08:00hs"
                    value={formData.emptying_frequency}
                    onChange={(e) => setFormData({ ...formData, emptying_frequency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Dirección o Referencia Pública</label>
                <input
                  type="text"
                  placeholder="Ej. Av. San Martín 450, frente al polideportivo"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-muted-foreground hover:bg-muted text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
                >
                  {editingContainer ? "Guardar Cambios" : "Confirmar Alta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
