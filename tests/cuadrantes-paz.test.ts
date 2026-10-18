import { describe, it, expect } from "vitest";
import {
  getCuadrantesList,
  getCuadranteById,
  resolveCuadranteByLocation,
  CUADRANTES_MATURIN,
} from "@/src/modules/territory/cuadrantes-paz";

describe("Catálogo Oficial de Cuadrantes de Paz — Maturín, Monagas", () => {
  it("debe contener la lista oficial de cuadrantes de paz de Maturín", () => {
    const list = getCuadrantesList();
    expect(list.length).toBeGreaterThan(5);
    expect(list.some((c) => c.id === "CP-01" && c.sectorPrincipal.includes("Casco Central"))).toBe(true);
    expect(list.some((c) => c.id === "CP-04" && c.sectorPrincipal.includes("Tipuro"))).toBe(true);
    expect(list.some((c) => c.id === "CP-12" && c.sectorPrincipal.includes("Las Cocuizas"))).toBe(true);
  });

  it("debe buscar cuadrantes por ID o número", () => {
    const cp1 = getCuadranteById("CP-01");
    expect(cp1).toBeDefined();
    expect(cp1?.numero).toBe(1);
    expect(cp1?.organismoResponsable).toContain("Policía Nacional Bolivariana");
    expect(cp1?.telefonoPatrulla).toBeDefined();

    const cp4 = getCuadranteById(4);
    expect(cp4).toBeDefined();
    expect(cp4?.id).toBe("CP-04");
    expect(cp4?.parroquia).toBe("Boquerón");
  });

  it("debe resolver dinámicamente el cuadrante correcto según el sector o dirección", () => {
    // Caso Tipuro
    const cuadTipuro = resolveCuadranteByLocation("Tipuro · Av. Alirio Ugarte Pelayo");
    expect(cuadTipuro.id).toBe("CP-04");
    expect(cuadTipuro.parroquia).toBe("Boquerón");

    // Caso Las Cocuizas / Aeropuerto
    const cuadCocuizas = resolveCuadranteByLocation("Las Cocuizas · Calle 5");
    expect(cuadCocuizas.id).toBe("CP-12");
    expect(cuadCocuizas.parroquia).toBe("Las Cocuizas");

    // Caso Casco Central
    const cuadCentro = resolveCuadranteByLocation("Maturín Centro · Av. Bolívar c/c Azcúe");
    expect(cuadCentro.id).toBe("CP-01");
    expect(cuadCentro.parroquia).toBe("San Simón");
  });

  it("debe resolver por proximidad geográfica si no hay coincidencia de texto pero sí coordenadas", () => {
    // Coordenadas cercanas a Tipuro
    const resolved = resolveCuadranteByLocation("Zona norte", { lat: 9.782, lng: -63.195 });
    expect(resolved.id).toBe("CP-04");
  });
});
