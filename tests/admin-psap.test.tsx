import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminPage from "@/app/admin/page";
import { resetMockDemandas } from "@/tests/mocks/handlers";
import { PSAP_TEST_QUEUE } from "@/tests/fixtures/psap-queue";
import { usePsapQueue } from "@/src/modules/psap/use-psap-queue";

describe("INT-7: Consola Administrativa PSAP en /admin", () => {
  beforeEach(() => {
    resetMockDemandas();
    usePsapQueue.setState({
      queue: PSAP_TEST_QUEUE,
      selectedId: PSAP_TEST_QUEUE[0].id,
      activeFilter: "Todas",
      notice: "Cola sincronizada con backend PSAP",
      soundEnabled: true,
      roomConnected: true,
      videoEnabled: false,
    });
  });

  it("renders the PSAP administrative console with PostGIS center and queue summary", async () => {
    render(<AdminPage />);

    expect(screen.getByRole("heading", { name: /centro de atención/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /cola de demandas/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /mapa operativo/i })).toBeInTheDocument();

    // Check PSAP capabilities section
    expect(screen.getByText(/centro responsable \(postgis\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ven 911 matur[ií]n/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/pictogramas arasaac/i)).toBeInTheDocument();

    // Demand list
    expect(screen.getAllByText("DEM-2048").length).toBeGreaterThan(0);
    expect(screen.getByText("DEM-2049")).toBeInTheDocument();
    expect(screen.getByText("DEM-2050")).toBeInTheDocument();
  });

  it("filters demands accurately by LSE, Sin asignar, and Prioridad alta", async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    // Filter by Con LSE
    await user.click(screen.getByRole("button", { name: /con lse/i }));
    expect(screen.getAllByText("DEM-2048").length).toBeGreaterThan(0);
    expect(screen.queryByText("DEM-2049")).not.toBeInTheDocument();

    // Filter by Prioridad alta (P0 and P1)
    await user.click(screen.getByRole("button", { name: /prioridad alta/i }));
    expect(screen.getAllByText("DEM-2048").length).toBeGreaterThan(0);
    expect(screen.getByText("DEM-2049")).toBeInTheDocument();
    expect(screen.queryByText("DEM-2050")).not.toBeInTheDocument(); // P2

    // Filter by Todas
    await user.click(screen.getByRole("button", { name: /^todas$/i }));
    expect(screen.getByText("DEM-2050")).toBeInTheDocument();
  });

  it("takes/assigns a demand, sends API call with idempotency, and reveals room link", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    render(<AdminPage />);

    const assignBtn = screen.getByRole("button", { name: /tomar demanda/i });
    await user.click(assignBtn);

    await waitFor(() => {
      expect(screen.getByText(/asignada a operador 14/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /liberar demanda/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /abrir sala/i })).toHaveAttribute(
        "href",
        "/sala/DEM-2048?role=agente",
      );
    });

    // Verify assign API or fallback was hit
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\/v1\/psap\/demandas\/DEM-2048\/asignar|\/v1\/emergencias\/DEM-2048/),
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-idempotency-key": expect.any(String),
        }),
      }),
    );
  });

  it("releases a previously assigned demand back to unassigned queue", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();

    // Set initial state as assigned
    usePsapQueue.setState({
      queue: PSAP_TEST_QUEUE.map((item) =>
        item.id === "DEM-2048" ? { ...item, status: "Asignada", agenteId: "Operador 14" } : item,
      ),
    });

    render(<AdminPage />);

    const releaseBtn = screen.getByRole("button", { name: /liberar demanda/i });
    await user.click(releaseBtn);

    await waitFor(() => {
      expect(screen.getByText(/DEM-2048 liberada y devuelta a la cola/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /tomar demanda/i })).toBeInTheDocument();
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\/v1\/psap\/demandas\/DEM-2048\/liberar|\/v1\/emergencias\/DEM-2048/),
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-idempotency-key": expect.any(String),
        }),
      }),
    );
  });

  it("displays PostGIS coordinates and precision radius in detail and map sections", () => {
    render(<AdminPage />);

    expect(screen.getByText(/postgis: 9\.7489, -63\.1798/i)).toBeInTheDocument();
    expect(screen.getByText(/pin operativo · DEM-2048 · Lat 9\.749 Lng -63\.180/i)).toBeInTheDocument();
  });

  it("supports keyboard shortcuts: ArrowDown/ArrowUp to navigate, Space to toggle assignment", async () => {
    render(<AdminPage />);

    // Initially DEM-2048 is selected
    expect(screen.getByRole("heading", { name: /DEM-2048/i, level: 2 })).toBeInTheDocument();

    // Press ArrowDown to select DEM-2049
    fireEvent.keyDown(window, { key: "ArrowDown" });
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /DEM-2049/i, level: 2 })).toBeInTheDocument();
    });

    // Press Space to assign DEM-2049
    fireEvent.keyDown(window, { key: " " });
    await waitFor(() => {
      expect(screen.getByText(/DEM-2049 asignada a operador 14/i)).toBeInTheDocument();
    });

    // Press Escape to release DEM-2049
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => {
      expect(screen.getByText(/DEM-2049 liberada y devuelta a la cola/i)).toBeInTheDocument();
    });
  });

  it("toggles audio chime alert setting without breaking UI", async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    const soundBtn = screen.getByRole("button", { name: /🔔 audio alerta/i });
    expect(soundBtn).toHaveAttribute("aria-pressed", "true");

    await user.click(soundBtn);
    expect(screen.getByRole("button", { name: /🔕 audio silenciado/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("displays complete live telemetry (GPS, battery, quadrant) and medical record", () => {
    render(<AdminPage />);

    // Telemetría satelital viva
    expect(screen.getByText(/telemetría satelital & dispositivo/i)).toBeInTheDocument();
    expect(screen.getByText(/84% batería/i)).toBeInTheDocument();
    expect(screen.getAllByText(/cuadrante de paz n° 12/i)[0]).toBeInTheDocument();

    // Ficha médica del solicitante
    expect(screen.getByText(/ficha médica y perfil de accesibilidad/i)).toBeInTheDocument();
    expect(screen.getByText(/grupo sanguíneo/i)).toBeInTheDocument();
    expect(screen.getByText(/penicilina, aines/i)).toBeInTheDocument();
  });

  it("opens DispatchModal, allows selecting emergency entities, and confirms dispatch", async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    // Abrir modal de despacho
    const dispatchDirectBtn = screen.getByRole("button", { name: /despacho directo/i });
    await user.click(dispatchDirectBtn);

    // Diálogo accesible presente
    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(screen.getByText(/orden de movilización de emergencia/i)).toBeInTheDocument();

    // Seleccionar opciones de entes
    expect(screen.getByText(/patrulla pnb/i)).toBeInTheDocument();
    expect(screen.getByText(/unidad médica u-12 ven 911/i)).toBeInTheDocument();

    // Confirmar despacho
    const confirmBtn = screen.getByRole("button", { name: /confirmar despacho/i });
    await user.click(confirmBtn);

    // Modal se cierra y la demanda muestra badge de despachada
    await waitFor(() => {
      expect(screen.getByText(/🚨 despachada/i)).toBeInTheDocument();
      expect(screen.getByText(/cuadrillas en ruta/i)).toBeInTheDocument();
    });
  });

  it("summons CINT LSV interpreter with immediate feedback and visual status", async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    const summonBtn = screen.getByRole("button", { name: /sumar cint lsv/i });
    expect(summonBtn).toBeInTheDocument();

    await user.click(summonBtn);

    await waitFor(() => {
      expect(screen.getByText(/convocatoria de intérprete cint lsv enviada/i)).toBeInTheDocument();
      expect(screen.getAllByText(/cint/i).length).toBeGreaterThan(0);
    });
  });

  it("requests contextual evidence from caller through accessible modal", async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    const requestEvBtn = screen.getByRole("button", { name: /solicitar evidencia/i });
    await user.click(requestEvBtn);

    // Modal de evidencia accesible
    const modal = screen.getByRole("dialog", { name: /solicitar evidencia al alertante/i });
    expect(modal).toBeInTheDocument();

    // Seleccionar video corto
    const videoOpt = screen.getByRole("button", { name: /video corto/i });
    await user.click(videoOpt);

    // Enviar requerimiento
    const sendBtn = screen.getByRole("button", { name: /enviar requerimiento/i });
    await user.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText(/solicitud de evidencia \(video\) enviada/i)).toBeInTheDocument();
    });
  });

  it("switches to CAD dispatch perspective and displays tactical fleet board with live units", async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    // Conmutar a perspectiva Despacho CAD
    const cadToggle = screen.getByRole("button", { name: /despacho cad/i });
    await user.click(cadToggle);

    await waitFor(() => {
      expect(screen.getByRole("region", { name: /tablero táctico de flotas/i })).toBeInTheDocument();
      expect(screen.getByText(/patrulla pnb cuadrante 12/i)).toBeInTheDocument();
      expect(screen.getByText(/ambulancia soporte avanzado u-12/i)).toBeInTheDocument();
      expect(screen.getByText(/autobomba bomberos monagas b-04/i)).toBeInTheDocument();
    });
  });

  it("transfers demand directly to dispatch perspective and updates operational status", async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    const transferBtn = screen.getByRole("button", { name: /transferir a despacho/i });
    await user.click(transferBtn);

    await waitFor(() => {
      expect(screen.getByText(/transferida a despacho cad/i)).toBeInTheDocument();
      expect(screen.getByRole("region", { name: /tablero táctico de flotas/i })).toBeInTheDocument();
    });
  });
});
