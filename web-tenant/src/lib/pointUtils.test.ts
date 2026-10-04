import { describe, it, expect } from "vitest";
import {
  validateCoordinates,
  getPointStatus,
  filterRecyclingPoints,
  type RecyclingPoint,
} from "./pointUtils";

describe("pointUtils - Pruebas Unitarias de EcoMapa", () => {
  describe("validateCoordinates()", () => {
    it("debe retornar true para coordenadas geográficas válidas", () => {
      // Coordenadas válidas (ejemplo: Córdoba, Argentina)
      const isValid = validateCoordinates(-31.412, -64.195);
      expect(isValid).toBe(true);
    });

    it("debe retornar false si la latitud excede el rango (-90 a 90)", () => {
      expect(validateCoordinates(95.5, -64.195)).toBe(false);
      expect(validateCoordinates(-91.0, -64.195)).toBe(false);
    });

    it("debe retornar false si la longitud excede el rango (-180 a 180)", () => {
      expect(validateCoordinates(-31.412, 185.0)).toBe(false);
      expect(validateCoordinates(-31.412, -181.0)).toBe(false);
    });

    it("debe retornar false si algún valor es NaN", () => {
      expect(validateCoordinates(NaN, -64.195)).toBe(false);
      expect(validateCoordinates(-31.412, NaN)).toBe(false);
    });
  });

  describe("getPointStatus()", () => {
    it("debe retornar 'Pendiente de aprobación' si is_approved es false", () => {
      const status = getPointStatus({ is_active: true, is_approved: false });
      expect(status).toBe("Pendiente de aprobación");
    });

    it("debe retornar 'Activo' si está aprobado y activo", () => {
      const status = getPointStatus({ is_active: true, is_approved: true });
      expect(status).toBe("Activo");
    });

    it("debe retornar 'Inactivo' si está aprobado pero no está activo", () => {
      const status = getPointStatus({ is_active: false, is_approved: true });
      expect(status).toBe("Inactivo");
    });
  });

  describe("filterRecyclingPoints()", () => {
    const mockPoints: RecyclingPoint[] = [
      {
        id: "1",
        name: "EcoPunto Costanera Norte",
        type: "Plásticos",
        address: "Av. Costanera 1420",
        latitude: -31.412,
        longitude: -64.195,
        is_active: true,
        is_approved: true,
      },
      {
        id: "2",
        name: "Campana Verde Plaza Central",
        type: "Vidrio",
        address: "Calle San Martín 200",
        latitude: -31.416,
        longitude: -64.183,
        is_active: true,
        is_approved: true,
      },
      {
        id: "3",
        name: "Contenedor Universitario",
        type: "Plásticos",
        address: "Av. Valparaíso s/n",
        latitude: -31.435,
        longitude: -64.191,
        is_active: false,
        is_approved: true,
      },
    ];

    it("debe devolver todos los puntos cuando no hay filtro de búsqueda ni de categoría", () => {
      const result = filterRecyclingPoints(mockPoints, "", "all");
      expect(result).toHaveLength(3);
    });

    it("debe filtrar correctamente por nombre ignorando mayúsculas y minúsculas", () => {
      const result = filterRecyclingPoints(mockPoints, "costanera", "all");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("EcoPunto Costanera Norte");
    });

    it("debe filtrar correctamente por dirección", () => {
      const result = filterRecyclingPoints(mockPoints, "San Martín", "all");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("debe filtrar correctamente por categoría de material", () => {
      const result = filterRecyclingPoints(mockPoints, "", "Vidrio");
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("Vidrio");
    });

    it("debe retornar un arreglo vacío si ningún punto coincide con la búsqueda", () => {
      const result = filterRecyclingPoints(mockPoints, "Inexistente", "all");
      expect(result).toHaveLength(0);
    });
  });
});
