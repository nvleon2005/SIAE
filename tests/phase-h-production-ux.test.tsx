import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Skeleton, SkeletonEmergencyCard, SkeletonPictogramGrid } from "../src/components/siae/Skeleton";
import { PwaInstallBanner } from "../src/components/siae/PwaInstallBanner";
import UbicacionPage from "../app/ubicacion/page";
import { playAccessibilityChime } from "../src/modules/a11y/audio-chimes";
import { SosFab } from "../src/components/siae/SosFab";
import { useEmergency } from "../src/modules/emergency/emergency-store";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

const mockGeo = {
  result: { lat: 9.7456, lng: -63.1832, accuracy: 8, source: "gps" },
  loading: false,
  error: null,
};

vi.mock("@/src/modules/geo/use-geolocation", () => ({
  useGeolocation: () => mockGeo,
}));
vi.mock("../src/modules/geo/use-geolocation", () => ({
  useGeolocation: () => mockGeo,
}));

vi.mock("@/src/modules/geo/use-reverse-geocode", () => ({
  useReverseGeocode: () => ({
    addressText: "Av. Bolívar, Maturín, Edo. Monagas",
  }),
}));
vi.mock("../src/modules/geo/use-reverse-geocode", () => ({
  useReverseGeocode: () => ({
    addressText: "Av. Bolívar, Maturín, Edo. Monagas",
  }),
}));

vi.mock("@/src/components/siae/MapPicker", () => ({
  MapPicker: () => <div data-testid="mock-map-picker">MapPicker</div>,
}));
vi.mock("../src/components/siae/MapPicker", () => ({
  MapPicker: () => <div data-testid="mock-map-picker">MapPicker</div>,
}));

describe("H.1: Skeletons & Shimmer Accessibility", () => {
  it("renders generic skeleton with status role and custom aria label", () => {
    render(<Skeleton variant="rectangular" width={200} height={40} ariaLabel="Cargando mapa..." />);
    const el = screen.getByRole("status", { name: "Cargando mapa..." });
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("animate-shimmer");
  });

  it("renders SkeletonEmergencyCard and SkeletonPictogramGrid with accessible labels", () => {
    render(<SkeletonEmergencyCard />);
    expect(screen.getByRole("status", { name: /Cargando reporte de emergencia/i })).toBeInTheDocument();

    const { container: c2 } = render(<SkeletonPictogramGrid count={4} />);
    expect(screen.getByRole("status", { name: /Cargando pictogramas/i })).toBeInTheDocument();
    expect(c2.querySelectorAll(".tipify-grid > div").length).toBe(4);
  });
});

describe("H.2: PWA Install Guided Experience", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders install prompt on Android beforeinstallprompt event", async () => {
    const { rerender } = render(<PwaInstallBanner />);

    // Simular evento beforeinstallprompt con tipado seguro
    const promptMock = vi.fn().mockResolvedValue(undefined);
    const event = Object.assign(new Event("beforeinstallprompt"), {
      prompt: promptMock,
      userChoice: Promise.resolve({ outcome: "accepted", platform: "web" }),
    });

    act(() => {
      window.dispatchEvent(event);
    });

    rerender(<PwaInstallBanner />);

    const titleEl = await screen.findByText(/Instalar SIAE — VEN 911 Maturín/i);
    expect(titleEl).toBeInTheDocument();
    const installBtn = await screen.findByRole("button", { name: /Instalar en mi teléfono/i });
    expect(installBtn).toBeInTheDocument();

    fireEvent.click(installBtn);
    expect(promptMock).toHaveBeenCalled();
  });
});

describe("H.3 & H.5: SosFab with Radial Progress and Audio Chimes", () => {
  beforeEach(() => {
    useEmergency.getState().reset();
  });

  it("plays accessibility audio chimes without throwing errors", () => {
    expect(() => {
      playAccessibilityChime("operator_connected");
      playAccessibilityChime("message_received");
      playAccessibilityChime("sos_initiated");
      playAccessibilityChime("alert_warning");
    }).not.toThrow();
  });

  it("renders SosFab and initiates radial progress on pointer down", () => {
    render(<SosFab />);

    const sosButton = screen.getByRole("button", { name: "Activar emergencia" });
    expect(sosButton).toBeInTheDocument();

    // Iniciar pulsación
    fireEvent.pointerDown(sosButton);
    expect(sosButton).toHaveClass("is-pressing");

    // Cancelar soltando el botón antes de completarse
    fireEvent.pointerUp(sosButton);
    expect(sosButton).not.toHaveClass("is-pressing");
  });
});

describe("H.4: Maturin Landmarks (POI) Quick Selection", () => {
  it("displays local landmarks and selects coordinates upon click", () => {
    render(<UbicacionPage />);

    // El encabezado visible es "Puntos de referencia en Maturín"
    expect(screen.getByText(/Puntos de referencia en Maturín/i)).toBeInTheDocument();
    // Los botones usan poi.short, no poi.name
    expect(screen.getByText("Redoma Juana")).toBeInTheDocument();
    expect(screen.getByText("Hospital HUMNT")).toBeInTheDocument();
    expect(screen.getByText("Plaza Bolívar")).toBeInTheDocument();

    const juanaBtn = screen.getByRole("button", { name: /Redoma Juana/i });
    fireEvent.click(juanaBtn);

    expect(juanaBtn).toHaveAttribute("aria-pressed", "true");
  });
});
