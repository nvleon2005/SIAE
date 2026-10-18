import { describe, it, expect, beforeEach } from "vitest";
import {
  searchArasaacPictograms,
  saveToArasaacCache,
  OFFLINE_EMERGENCY_PICTOGRAMS,
  type ArasaacPictogram,
} from "@/src/modules/typification/arasaac-client";

describe("G.4: Catálogo ARASAAC Dinámico con Búsqueda e IndexedDB Offline", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns all offline emergency seeds when query is empty", async () => {
    const results = await searchArasaacPictograms("");
    expect(results.length).toBeGreaterThanOrEqual(OFFLINE_EMERGENCY_PICTOGRAMS.length);
    expect(results.some((p) => p.label.toLowerCase().includes("ambulancia"))).toBe(true);
  });

  it("finds ambulance by exact or partial search term in <= 3 taps", async () => {
    const results = await searchArasaacPictograms("amb");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].label).toMatch(/Ambulancia/i);
    expect(results[0].id).toBe(2349);
  });

  it("finds fire and firefighters when querying fuego", async () => {
    const results = await searchArasaacPictograms("fuego");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((p) => p.category === "fuego")).toBe(true);
  });

  it("filters search results by category when specified", async () => {
    const results = await searchArasaacPictograms("", "seguridad");
    expect(results.length).toBeGreaterThan(0);
    results.forEach((item) => {
      expect(item.category).toBe("seguridad");
    });
  });

  it("persists dynamic pictograms to cache and retrieves them offline", async () => {
    const customItem: ArasaacPictogram = {
      id: 99999,
      label: "Desfibrilador DEA",
      category: "medica",
      keywords: ["desfibrilador", "dea", "parada", "cardiaca"],
      imageUrl: "https://static.arasaac.org/pictograms/99999/99999_500.png",
    };

    saveToArasaacCache([customItem]);

    const results = await searchArasaacPictograms("desfibrilador");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((p) => p.id === 99999)).toBe(true);
  });
});
