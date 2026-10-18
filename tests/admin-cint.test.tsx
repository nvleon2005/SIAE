import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminCintPage from "@/app/admin/cint/page";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const demand = {
  emergencia_id: "emergency-real-01",
  estado: "espera_interprete",
  tipificacion: "Asistencia requerida",
  afectado: "Alertante registrado",
  ubicacion_lat: 9.7456,
  ubicacion_lng: -63.1832,
  canales: ["video", "rtt"],
  fecha_creacion: "2026-01-01T10:00:00.000Z",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Consola CInt", () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("muestra las demandas recibidas del backend y no ofrece crear datos de ejemplo", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ demandas: [demand] })));

    render(<AdminCintPage />);

    expect(await screen.findByText("Asistencia requerida")).toBeInTheDocument();
    expect(screen.getByText(/Alertante registrado/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /simular/i })).not.toBeInTheDocument();
  });

  it("expone el error cuando el backend no está disponible", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Backend no disponible")));

    render(<AdminCintPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Backend no disponible");
  });

  it("abre únicamente la sala que identifica la respuesta real del backend", async () => {
    const fetchMock = vi.fn((_: RequestInfo | URL, init?: RequestInit) =>
      Promise.resolve(
        init?.method === "POST"
          ? jsonResponse({ sala_id: "room-real-01" })
          : jsonResponse({ demandas: [demand] }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminCintPage />);

    fireEvent.click(await screen.findByRole("button", { name: /conectar sala/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/v1/cint/demandas/emergency-real-01/asignar",
      { method: "POST" },
    );
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/sala/room-real-01?role=agente"));
  });

  it("no navega a una sala inventada si la asignación no devuelve su identificador", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_: RequestInfo | URL, init?: RequestInit) =>
        Promise.resolve(
          init?.method === "POST"
            ? jsonResponse({ asignada: true })
            : jsonResponse({ demandas: [demand] }),
        ),
      ),
    );

    render(<AdminCintPage />);

    fireEvent.click(await screen.findByRole("button", { name: /conectar sala/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("no devolvió el identificador de sala"),
    );
    expect(mockPush).not.toHaveBeenCalled();
  });
});
