import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AdminTipificacionesPage from "@/app/admin/tipificaciones/page";

const mockTipificaciones = [
  {
    id: "tip-01",
    codigo: "salud.infarto",
    nombre: "Infarto de Miocardio / Dolor Torácico",
    categoria_raiz: "salud",
    prioridad_defecto: "P0",
    organismo_primario: "Salud Monagas - MPPS / HUMNT",
    sla_minutos: 8,
    activo: true,
  },
  {
    id: "tip-03",
    codigo: "bomberos.incendio",
    nombre: "Incendio de Vivienda",
    categoria_raiz: "bomberos",
    prioridad_defecto: "P0",
    organismo_primario: "Cuerpo de Bomberos",
    sla_minutos: 7,
    activo: true,
  },
];

describe("AdminTipificacionesPage", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation((url: string) => {
      if (url.includes("/v1/catalogos/tipificaciones")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ tipificaciones: mockTipificaciones }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }));
  });

  it("renders the tipificaciones management table and items", async () => {
    render(<AdminTipificacionesPage />);

    expect(screen.getByText(/Gestión de Tipificaciones y SLAs VEN 911/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("salud.infarto")).toBeInTheDocument();
      expect(screen.getByText("Infarto de Miocardio / Dolor Torácico")).toBeInTheDocument();
      expect(screen.getByText(/Salud Monagas - MPPS \/ HUMNT/i)).toBeInTheDocument();
    });
  });
});
