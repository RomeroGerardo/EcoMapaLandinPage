export interface RecyclingPoint {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  is_approved: boolean;
}

/**
 * Valida si las coordenadas geográficas son válidas.
 * Latitud: [-90, 90]
 * Longitud: [-180, 180]
 */
export function validateCoordinates(lat: number, lng: number): boolean {
  if (typeof lat !== "number" || typeof lng !== "number") {
    return false;
  }
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return false;
  }
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Obtiene el estado legible de un punto de reciclaje según sus banderas booleanas.
 */
export function getPointStatus(point: { is_active: boolean; is_approved: boolean }): string {
  if (!point.is_approved) {
    return "Pendiente de aprobación";
  }
  return point.is_active ? "Activo" : "Inactivo";
}

/**
 * Filtra los puntos de reciclaje por búsqueda de texto (nombre o dirección) y categoría.
 */
export function filterRecyclingPoints(
  points: RecyclingPoint[],
  searchQuery: string = "",
  category: string = "all"
): RecyclingPoint[] {
  const query = searchQuery.trim().toLowerCase();

  return points.filter((p) => {
    const matchesSearch =
      query === "" ||
      p.name.toLowerCase().includes(query) ||
      p.address.toLowerCase().includes(query);

    const matchesCategory =
      category === "all" ||
      p.type.toLowerCase() === category.toLowerCase();

    return matchesSearch && matchesCategory;
  });
}
