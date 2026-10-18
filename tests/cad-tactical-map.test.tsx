import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CadTacticalMap } from "@/src/components/siae/CadTacticalMap";

describe("CadTacticalMap Component", () => {
  it("renders the CAD tactical map HUD with coordinates and Cuadrante", () => {
    render(
      <CadTacticalMap
        emergencyLat={9.7489}
        emergencyLng={-63.1798}
        cuadranteId="CP-21"
        priority="P0"
      />
    );

    expect(screen.getByText(/CAD GIS · MATURÍN AVL/i)).toBeInTheDocument();
    expect(screen.getAllByText(/CP-21/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/P0/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText(/Mapa táctico CAD en tiempo real/i)).toBeInTheDocument();
  });

  it("renders zoom and recenter buttons and handles zoom click", () => {
    render(
      <CadTacticalMap
        emergencyLat={9.7489}
        emergencyLng={-63.1798}
        interactive={true}
      />
    );

    const zoomInBtn = screen.getByLabelText(/Acercar mapa/i);
    const zoomOutBtn = screen.getByLabelText(/Alejar mapa/i);
    const recenterBtn = screen.getByLabelText(/Centrar en emergencia/i);

    expect(zoomInBtn).toBeInTheDocument();
    expect(zoomOutBtn).toBeInTheDocument();
    expect(recenterBtn).toBeInTheDocument();

    fireEvent.click(zoomInBtn);
    fireEvent.click(recenterBtn);
  });
});
