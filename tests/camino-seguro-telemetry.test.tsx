import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import CaminoSeguroPage from "@/app/camino-seguro/page";
import { useEmergency } from "@/src/modules/emergency/emergency-store";

// Mock del router de Next.js
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/camino-seguro",
}));

describe("INT-G.6: Camino Seguro Avanzado con Monitoreo PostGIS y Código Anti-Coacción", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockPush.mockClear();
    useEmergency.getState().reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("permite especificar un destino opcional y muestra la telemetría PostGIS al activarse", () => {
    render(<CaminoSeguroPage />);

    const destinationInput = screen.getByLabelText(/Destino o ruta aproximada/i);
    fireEvent.change(destinationInput, { target: { value: "Av. Bolívar hacia Los Guaritos" } });

    fireEvent.click(screen.getByRole("button", { name: /activar camino seguro/i }));

    // Verificación de visualización del badge de telemetría PostGIS de Maturín
    expect(screen.getByLabelText(/Telemetría GPS en tiempo real/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Monitoreo PostGIS Activo/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/9.7489° N, -63.1798° W \(Maturín, Monagas\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Av. Bolívar hacia Los Guaritos/i)).toBeInTheDocument();
  });

  it("abre el modal de código de seguridad al solicitar cancelación y permite cancelar con PIN seguro 1234", () => {
    render(<CaminoSeguroPage />);
    fireEvent.click(screen.getByRole("button", { name: /activar camino seguro/i }));

    // Clic en cancelar
    fireEvent.click(screen.getByRole("button", { name: /cancelar camino seguro/i }));

    // Modal de PIN abierto
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Código de seguridad/i)).toBeInTheDocument();

    const pinInput = screen.getByLabelText(/PIN de seguridad de 4 dígitos/i);
    fireEvent.change(pinInput, { target: { value: "1234" } });

    fireEvent.click(screen.getByRole("button", { name: /confirmar pin/i }));

    // Debe volver a la vista inicial sin activar emergencia
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /activar camino seguro/i })).toBeInTheDocument();
    expect(useEmergency.getState().flowStatus).toBe("idle");
  });

  it("eleva silenciosamente una emergencia SOS hacia VEN 911 al ingresar el Duress PIN de coacción (9999)", () => {
    render(<CaminoSeguroPage />);
    fireEvent.click(screen.getByRole("button", { name: /activar camino seguro/i }));

    fireEvent.click(screen.getByRole("button", { name: /cancelar camino seguro/i }));

    const pinInput = screen.getByLabelText(/PIN de seguridad de 4 dígitos/i);
    // Ingresar código de coacción (duress PIN)
    fireEvent.change(pinInput, { target: { value: "9999" } });

    fireEvent.click(screen.getByRole("button", { name: /confirmar pin/i }));

    // Debe activar la emergencia en el store y navegar a la sala silenciosa de auxilio
    expect(useEmergency.getState().flowStatus).toBe("activating");
    expect(mockPush).toHaveBeenCalledWith("/sala/emg-duress-silent");
  });
});
