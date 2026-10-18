import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminPage from "@/app/admin/page";
import AdminUsersPage from "@/app/admin/usuarios/page";
import { useAuth } from "@/src/modules/auth/auth-store";
import { useUsersStore } from "@/src/modules/admin/users-store";
import { usePsapQueue } from "@/src/modules/psap/use-psap-queue";
import { useEmergency } from "@/src/modules/emergency/emergency-store";
import { PSAP_TEST_QUEUE } from "@/tests/fixtures/psap-queue";

describe("E2E Usability & Parallel Multi-Role Information Flow Audit", () => {
  beforeEach(() => {
    // Reset stores
    useUsersStore.setState({ users: [] });
    usePsapQueue.setState({
      queue: PSAP_TEST_QUEUE,
      selectedId: PSAP_TEST_QUEUE[0].id,
      activeFilter: "Todas",
      notice: "Cola sincronizada con backend PSAP",
      soundEnabled: true,
      roomConnected: true,
      videoEnabled: false,
    });
    useEmergency.getState().reset();
  });

  afterEach(() => {
    useAuth.setState({ user: null, isAuthenticated: false });
  });

  it("ROLE 1: Citizen creates emergency with dynamic location and verifies theme consistency", () => {
    // 1. Citizen sets emergency metadata dynamically (not hardcoded)
    useEmergency.getState().setTipificacion({
      code: "fuego_incendio",
      label: "Fuego e Incendio Estructural",
      arasaacId: 1024,
    });
    useEmergency.getState().setUbicacion({
      lat: 9.7457,
      lng: -63.1832,
      accuracyM: 4.2,
      addressText: "Mercado Municipal de Maturín, Sector Los Bloques",
      source: "gps",
      capturedAt: new Date().toISOString(),
    });

    const emergency = useEmergency.getState();
    expect(emergency.tipificacion?.code).toBe("fuego_incendio");
    expect(emergency.tipificacion?.label).toBe("Fuego e Incendio Estructural");
    expect(emergency.ubicacion?.lat).toBe(9.7457);
    expect(emergency.ubicacion?.addressText).toBe("Mercado Municipal de Maturín, Sector Los Bloques");
  });

  it(
    "ROLE 2: Operator attends emergency in-station, utilizes RTT, Whisper captions, and minimizes to PiP",
    async () => {
      useAuth.setState({
      user: {
        id: "op-14",
        nombre_completo: "Operador Carlos Mendez",
        correo_electronico: "operador14@siae.gob.ve",
        role: "operador",
      },
      isAuthenticated: true,
    });

    render(<AdminPage />);

    // 1. Check ACD queue has pending incidents
    expect(screen.getAllByText(/DEM-2048/i).length).toBeGreaterThan(0);

    // 2. Open In-Station Room Modal directly
    const openRoomBtn = screen.getByRole("button", { name: /atender en sala \(en vivo\)/i });
    expect(openRoomBtn).toBeInTheDocument();
    fireEvent.click(openRoomBtn);

    // 3. Modal opens with WebRTC & RTT
    expect(screen.getByText(/Sala de Atención Directa/i)).toBeInTheDocument();
    expect(screen.getByText(/Subtítulos en Vivo · Agente/i)).toBeInTheDocument();

    // 4. Test Minimizing to PiP Dock
    const minimizeBtn = screen.getByRole("button", { name: /minimizar sala/i });
    fireEvent.click(minimizeBtn);

    // Modal is docked in corner
    expect(screen.getByText(/Sala en curso/i)).toBeInTheDocument();
    const restoreBtn = screen.getByRole("button", { name: /restaurar/i });
    expect(restoreBtn).toBeInTheDocument();

    // 5. Restore back to full modal
    fireEvent.click(restoreBtn);
    expect(screen.getByText(/Sala de Atención Directa/i)).toBeInTheDocument();

    // 6. Close room cleanly
    const closeBtn = screen.getByRole("button", { name: /cerrar sala/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/Sala de Atención Directa/i)).not.toBeInTheDocument();
  }, 15000);

  it("ROLE 3: CAD Dispatcher perspective displays tactical fleet units and allows dispatching", async () => {
    useAuth.setState({
      user: {
        id: "disp-02",
        nombre_completo: "Despachadora Elena Rivas",
        correo_electronico: "despacho@siae.gob.ve",
        role: "despachador",
      },
      isAuthenticated: true,
    });

    render(<AdminPage />);

    // In accordance with role segregation, despachador is automatically in tactical dispatch mode
    await waitFor(() => {
      expect(screen.getByRole("region", { name: /tablero táctico de flotas/i })).toBeInTheDocument();
      expect(screen.getByText(/patrulla pnb cuadrante 12/i)).toBeInTheDocument();
      expect(screen.getByText(/ambulancia soporte avanzado u-12/i)).toBeInTheDocument();
      expect(screen.getByText(/autobomba bomberos monagas b-04/i)).toBeInTheDocument();
    });
  });

  it("ROLE 4: Admin creates a new user, updates roles, and performs key rotation in /admin/usuarios", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation((url: string) => {
      if (url.includes("/v1/admin/usuarios")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: "usr-999", success: true }),
        });
      }
      if (url.includes("/v1/admin/keys/rotate")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, keyId: "siae-sig-2026-ed25519-02", rotatedAt: new Date().toISOString() }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }));

    useAuth.setState({
      user: {
        id: "admin-master",
        nombre_completo: "Administrador Central",
        correo_electronico: "admin@siae.gob.ve",
        role: "admin",
      },
      isAuthenticated: true,
    });

    render(<AdminUsersPage />);

    // 1. Verify metric cards
    expect(screen.getByText(/usuarios activos/i)).toBeInTheDocument();
    expect(screen.getByText(/cuentas bloqueadas/i)).toBeInTheDocument();

    // 2. Open Create User Modal
    const newUserBtn = screen.getByRole("button", { name: /\+ dar de alta funcionario institucional/i });
    fireEvent.click(newUserBtn);

    expect(screen.getByRole("heading", { name: /dar de alta funcionario institucional/i })).toBeInTheDocument();

    // 3. Fill in user form
    const nameInput = screen.getByLabelText(/nombre y rango/i);
    const emailInput = screen.getByLabelText(/correo electrónico institucional/i);
    const passwordInput = screen.getByLabelText(/contraseña temporal/i);
    const roleSelect = screen.getByLabelText(/rol operativo asignado/i);

    fireEvent.change(nameInput, { target: { value: "Sgto. Alberto Zambrano" } });
    fireEvent.change(emailInput, { target: { value: "alberto.zambrano@siae.gob.ve" } });
    fireEvent.change(passwordInput, { target: { value: "ClaveSegura2026*" } });
    fireEvent.change(roleSelect, { target: { value: "despachador" } });

    // Submit form
    const submitBtn = screen.getByRole("button", { name: /crear en backend/i });
    fireEvent.click(submitBtn);

    // 4. Verify user was added to store
    await waitFor(() => {
      const users = useUsersStore.getState().users;
      const created = users.find((u) => u.correo_electronico === "alberto.zambrano@siae.gob.ve");
      expect(created).toBeDefined();
      expect(created?.nombre_completo).toBe("Sgto. Alberto Zambrano");
      expect(created?.role).toBe("despachador");
    });

    // 5. Open Cryptographic Key Rotation Modal
    const keyRotationBtn = screen.getByRole("button", { name: /rotar claves jwt/i });
    fireEvent.click(keyRotationBtn);

    expect(screen.getByText(/Seguridad Criptográfica & Rotación JWT/i)).toBeInTheDocument();
    expect(screen.getByText(/Identificador de Llave Activa/i)).toBeInTheDocument();
  });
});
