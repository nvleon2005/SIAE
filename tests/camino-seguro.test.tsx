import { act, fireEvent, render, screen } from "@testing-library/react";
import CaminoSeguroPage from "@/app/camino-seguro/page";
import { useEmergency } from "@/src/modules/emergency/emergency-store";

describe("Camino Seguro", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useEmergency.getState().reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("activa y permite confirmar que el usuario está bien", () => {
    render(<CaminoSeguroPage />);
    fireEvent.click(screen.getByRole("radio", { name: "30 minutos" }));
    fireEvent.click(screen.getByRole("button", { name: /activar camino seguro/i }));

    expect(screen.getByRole("heading", { name: /camino seguro activo/i })).toBeInTheDocument();
    expect(screen.getByRole("timer")).toHaveTextContent("30:00");
    fireEvent.click(screen.getByRole("button", { name: /estoy bien/i }));
    expect(screen.getByRole("button", { name: /activar camino seguro/i })).toBeInTheDocument();
  });

  it("activa una emergencia al expirar el temporizador", async () => {
    render(<CaminoSeguroPage />);
    fireEvent.click(screen.getByRole("button", { name: /activar camino seguro/i }));

    await act(async () => {
      for (let second = 0; second <= 10 * 60; second += 1) {
        vi.advanceTimersByTime(1000);
        await Promise.resolve();
      }
    });

    expect(useEmergency.getState().flowStatus).toBe("activating");
    expect(screen.getByRole("alert")).toHaveTextContent(/activando una emergencia/i);
  });

  it("avisa cinco minutos antes de terminar", async () => {
    render(<CaminoSeguroPage />);
    fireEvent.click(screen.getByRole("button", { name: /activar camino seguro/i }));

    await act(async () => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    expect(screen.getAllByText(/quedan 5 minutos de camino seguro/i)[0]).toBeVisible();
  });
});