export interface TileLayerConfig {
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  className?: string;
  subdomains?: string;
}

export const MAP_LAYERS: Record<string, TileLayerConfig> = {
  osmDark: {
    name: "OpenStreetMap Dark (Recomendado - 100% Libre)",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    className: "osm-dark-tiles",
    subdomains: "abc",
    maxZoom: 19,
  },
  esriDark: {
    name: "Esri World Dark Canvas",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
    maxZoom: 16,
  },
  osmStandard: {
    name: "OpenStreetMap Estándar (Claro)",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: "abc",
    maxZoom: 19,
  },
  esriStreet: {
    name: "Esri World Street Map",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    maxZoom: 18,
  },
};

// Centro por defecto: Argentina / Córdoba (centro geográfico)
export const DEFAULT_MAP_CENTER: [number, number] = [-31.4201, -64.1888];
export const DEFAULT_ZOOM = 6;
