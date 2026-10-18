import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TipifyPage from "../app/tipificar/page";
import ConfirmarPage from "../app/confirmar/page";
import OfflinePage from "../app/offline/page";
import { useEmergency } from "../src/modules/emergency/emergency-store";
import { useTypification } from "../src/modules/typification/typification-store";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock("@/src/modules/typification/arasaac-client", () => ({
  searchArasaacPictograms: vi.fn().mockImplementation(async (query: string) => {
    if (query === "fuego") {
      return [{ id: 3560, name: "Fuego / Incendio", category: "bomberos" }];
    }
    return [];
  }),
}));

describe("UI / UX: Offline Contingency Page", () => {
  it("renders the empty state and direct emergency call/sms buttons", () => {
    render(<OfflinePage />);

    expect(screen.getByText(/Estás sin conexión a internet/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Llamar directamente al 911 por teléfono tradicional/i })).toHaveAttribute("href", "tel:911");
    expect(screen.getByRole("link", { name: /Enviar SMS de emergencia al 911/i })).toHaveAttribute(
      "href",
      expect.stringContaining("sms:911")
    );
    expect(screen.getByRole("button", { name: /Comprobar conexión ahora/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Volver a la Home/i })).toHaveAttribute("href", "/");
  });

  it("checks connection status when button is clicked", async () => {
    render(<OfflinePage />);

    const checkBtn = screen.getByRole("button", { name: /Comprobar conexión ahora/i });
    fireEvent.click(checkBtn);

    await waitFor(() => {
      // En entorno jsdom navigator.onLine suele ser true o simulado
      const alert = screen.getByRole("status");
      expect(alert).toBeInTheDocument();
    });
  });
});

describe("UI / UX: Tipification with Pictograms and Confirmation Flow", () => {
  beforeEach(() => {
    useEmergency.getState().reset();
    useTypification.getState().reset();
  });

  it("renders incident categories as pictograms and debounces search", async () => {
    render(<TipifyPage />);

    // Verifica que las categorías se muestran
    expect(screen.getByText("¿Qué pasa?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Médico" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fuego" })).toBeInTheDocument();

    const searchInput = screen.getByRole("searchbox", { name: /Buscar pictograma de emergencia/i });
    fireEvent.change(searchInput, { target: { value: "fuego" } });

    // Esperar a que pase el debounce (250ms) y retorne el resultado mockeado
    await waitFor(
      () => {
        expect(screen.getByText(/1 pictograma encontrado/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    const resultBtn = screen.getByRole("button", { name: /Fuego \/ Incendio/i });
    expect(resultBtn).toBeInTheDocument();
  });

  it("displays the selected pictogram in the confirmation view when an arasaacId is set", () => {
    useEmergency.getState().setTipificacion({
      code: "arasaac-3560",
      label: "Fuego / Incendio",
      arasaacId: 3560,
    });
    useEmergency.getState().setUbicacion({
      lat: 9.7456,
      lng: -63.1832,
      accuracyM: 5,
      addressText: "Av. Bolívar, Maturín, Monagas",
      source: "gps",
    });

    render(<ConfirmarPage />);

    expect(screen.getByText("Confirmar emergencia")).toBeInTheDocument();
    expect(screen.getAllByText("Fuego / Incendio").length).toBeGreaterThan(0);
    expect(screen.getByText("Av. Bolívar, Maturín, Monagas")).toBeInTheDocument();

    // Comprueba que el PictogramCell está presente con el label adecuado
    const picCell = screen.getByRole("button", { name: "Fuego / Incendio" });
    expect(picCell).toBeInTheDocument();
  });
});
