import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, it, expect, beforeEach, vi } from "vitest";
import { useUsersStore, type ManagedUser } from "@/src/modules/admin/users-store";
import AdminUsersPage from "@/app/admin/usuarios/page";
import { AppSidebarNavigation } from "@/src/components/siae/AppSidebarNavigation";
import { useAuth } from "@/src/modules/auth/auth-store";

const userFixtures: ManagedUser[] = [
  {
    id: "citizen-1",
    nombre_completo: "María López",
    correo_electronico: "maria@ejemplo.com",
    role: "solicitante",
    status: "active",
    creado_el: "2025-01-01",
  },
  {
    id: "operator-1",
    nombre_completo: "Carlos Mendoza",
    correo_electronico: "carlos@ven911.gob.ve",
    role: "operador",
    status: "active",
    creado_el: "2025-01-02",
  },
  {
    id: "admin-1",
    nombre_completo: "Ing. Roberto Salazar",
    correo_electronico: "roberto@siae.gob.ve",
    role: "admin",
    status: "active",
    creado_el: "2025-01-03",
  },
  {
    id: "interpreter-1",
    nombre_completo: "Elena Rivas",
    correo_electronico: "elena@cint.gob.ve",
    role: "interprete_lsv",
    status: "active",
    creado_el: "2025-01-04",
  },
];

let backendUsers: ManagedUser[] = [];

function mockUsersBackend(initialUsers: ManagedUser[] = userFixtures) {
  backendUsers = initialUsers.map((user) => ({ ...user }));
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const path = String(input);
    const method = init?.method ?? "GET";
    const body = typeof init?.body === "string"
      ? JSON.parse(init.body) as Record<string, unknown>
      : {};

    if (path === "/v1/admin/usuarios" && method === "GET") {
      return { ok: true, status: 200, json: async () => ({ usuarios: backendUsers }) };
    }
    if (path === "/v1/admin/usuarios" && method === "POST") {
      backendUsers.push({
        id: "user-created",
        nombre_completo: String(body.nombre_completo),
        correo_electronico: String(body.correo_electronico),
        role: body.role as ManagedUser["role"],
        status: "active",
        creado_el: "2025-01-05",
      });
      return { ok: true, status: 201, json: async () => ({ success: true }) };
    }

    const userPath = path.match(/^\/v1\/admin\/usuarios\/([^/]+)(?:\/(status|role))?$/);
    if (userPath) {
      const [, id, action] = userPath;
      if (method === "DELETE") {
        backendUsers = backendUsers.filter((user) => user.id !== id);
      } else if (method === "PATCH") {
        backendUsers = backendUsers.map((user) => user.id !== id
          ? user
          : action === "status"
            ? { ...user, status: body.status as ManagedUser["status"] }
            : { ...user, role: body.role as ManagedUser["role"] });
      }
      return { ok: true, status: 200, json: async () => ({ success: true }) };
    }

    return { ok: true, status: 200, json: async () => ({}) };
  }));
}

function resetUsersStore() {
  useUsersStore.setState({
    users: [],
    searchQuery: "",
    roleFilter: "Todos",
    statusFilter: "Todos",
    notice: null,
    isLoading: false,
    error: null,
  });
}

describe("Admin Users Store & Management Functionality", () => {
  beforeEach(() => {
    resetUsersStore();
    mockUsersBackend();
  });

  it("starts without seeded runtime users", () => {
    expect(useUsersStore.getState().users).toEqual([]);
  });

  it("can block and unblock a user through the backend", async () => {
    const store = useUsersStore.getState();
    const citizen = userFixtures.find((u) => u.role === "solicitante");
    if (!citizen) throw new Error("Fixture de solicitante ausente");
    useUsersStore.setState({ users: [citizen] });

    await store.blockUser(citizen.id);
    let updated = useUsersStore.getState().users.find((u) => u.id === citizen.id);
    expect(updated?.status).toBe("blocked");

    await store.unblockUser(citizen.id);
    updated = useUsersStore.getState().users.find((u) => u.id === citizen.id);
    expect(updated?.status).toBe("active");
  });

  it("can change a user's role through the backend", async () => {
    const store = useUsersStore.getState();
    const target = userFixtures[0];
    useUsersStore.setState({ users: [target] });

    await store.changeUserRole(target.id, "supervisor");
    const updated = useUsersStore.getState().users.find((u) => u.id === target.id);
    expect(updated?.role).toBe("supervisor");
  });

  it("can delete a user through the backend", async () => {
    const store = useUsersStore.getState();
    const target = userFixtures[0];
    useUsersStore.setState({ users: [target] });

    await store.deleteUser(target.id);
    const updatedUsers = useUsersStore.getState().users;
    expect(updatedUsers).toHaveLength(0);
    expect(updatedUsers.some((u) => u.id === target.id)).toBe(false);
  });
});

describe("Admin Users Page UI Component", () => {
  beforeEach(() => {
    resetUsersStore();
    mockUsersBackend();
    useAuth.setState({
      isAuthenticated: true,
      user: {
        id: "admin-test",
        nombre_completo: "Admin de prueba",
        correo_electronico: "admin@test.invalid",
        role: "admin",
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders backend users with metrics cards", async () => {
    render(<AdminUsersPage />);

    expect(screen.getByRole("heading", { name: /gestión de usuarios y roles/i })).toBeInTheDocument();
    await screen.findByText(/maría lópez/i);
    expect(screen.getByText(/usuarios activos/i)).toBeInTheDocument();
    expect(screen.getByText(/cuentas bloqueadas/i)).toBeInTheDocument();
    expect(screen.getAllByText(/administradores/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/con privilegios de borrado y desbloqueo/i)).toBeInTheDocument();
  });

  it("allows searching users by name or email", async () => {
    render(<AdminUsersPage />);
    await screen.findByText(/maría lópez/i);

    const searchInput = screen.getByLabelText(/buscar usuarios/i);
    fireEvent.change(searchInput, { target: { value: "María" } });

    expect(screen.getByText(/maría lópez/i)).toBeInTheDocument();
    expect(screen.queryByText(/carlos mendoza/i)).not.toBeInTheDocument();
  });

  it("allows filtering by role and status", async () => {
    render(<AdminUsersPage />);
    await screen.findByText(/maría lópez/i);

    const roleSelect = screen.getByLabelText(/filtrar por rol/i);
    fireEvent.change(roleSelect, { target: { value: "admin" } });

    expect(screen.getByText(/ing\. roberto salazar/i)).toBeInTheDocument();
    expect(screen.queryByText(/maría lópez/i)).not.toBeInTheDocument();
  });

  it("toggles block and unblock via UI action button", async () => {
    render(<AdminUsersPage />);
    await screen.findByText(/maría lópez/i);

    const blockButton = screen.getByRole("button", { name: /bloquear acceso a maría lópez/i });
    fireEvent.click(blockButton);

    expect(await screen.findByRole("button", { name: /desbloquear acceso a maría lópez/i })).toBeInTheDocument();
  });

  it("shows confirmation modal before deleting user", async () => {
    render(<AdminUsersPage />);
    await screen.findByText(/maría lópez/i);

    const deleteBtn = screen.getByRole("button", { name: /eliminar cuenta de maría lópez/i });
    fireEvent.click(deleteBtn);

    const confirmBtn = screen.getByRole("button", { name: /confirmar eliminación definitiva de maría lópez/i });
    expect(confirmBtn).toBeInTheDocument();
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(screen.queryByText(/maría lópez/i)).not.toBeInTheDocument());
  });

  it("blocks non-admin users with access restricted view when authenticated as operador or despachador", () => {
    useAuth.setState({
      isAuthenticated: true,
      user: {
        id: "usr-op1",
        nombre_completo: "Carlos Operador",
        correo_electronico: "carlos@ven911.gob.ve",
        role: "operador",
      },
    });

    const { unmount } = render(<AdminUsersPage />);

    expect(screen.getByRole("heading", { name: /acceso restringido · exclusivo administrador/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /gestión de usuarios y roles/i })).not.toBeInTheDocument();

    unmount();

    // Now test as despachador
    useAuth.setState({
      isAuthenticated: true,
      user: {
        id: "usr-desp1",
        nombre_completo: "Pedro Despachador",
        correo_electronico: "pedro@despacho.ven911.gob.ve",
        role: "despachador",
      },
    });

    render(<AdminUsersPage />);
    expect(screen.getByRole("heading", { name: /acceso restringido · exclusivo administrador/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /gestión de usuarios y roles/i })).not.toBeInTheDocument();
  });
});

describe("AppSidebarNavigation Component - Role Based Navigation", () => {
  beforeEach(() => {
    useAuth.setState({
      isAuthenticated: false,
      user: null,
    });
  });

  it("returns null when user is not authenticated", () => {
    const { container } = render(<AppSidebarNavigation />);
    expect(container.firstChild).toBeNull();
  });

  it("renders citizen navigation links and SOS button when authenticated as solicitante", () => {
    useAuth.setState({
      isAuthenticated: true,
      user: {
        id: "usr-c1",
        nombre_completo: "Ana Ciudadana",
        correo_electronico: "ana@ejemplo.com",
        role: "solicitante",
      },
    });

    const handleSos = vi.fn();
    render(<AppSidebarNavigation onTriggerSos={handleSos} />);

    expect(screen.getByText(/portal ciudadano/i)).toBeInTheDocument();
    expect(screen.getByText("Ana Ciudadana")).toBeInTheDocument();
    expect(screen.getByText("Solicitante")).toBeInTheDocument();

    // Citizen links
    expect(screen.getByRole("link", { name: /mi portal/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /ficha médica/i })).toHaveAttribute("href", "/perfil?tab=medica");
    expect(screen.getByRole("link", { name: /contactos/i })).toHaveAttribute("href", "/perfil?tab=domicilios");
    expect(screen.getByRole("link", { name: /datos de la cuenta/i })).toHaveAttribute("href", "/perfil?tab=usuario");
    expect(screen.getByRole("link", { name: /accesibilidad/i })).toHaveAttribute("href", "/perfil?tab=accesibilidad");
    expect(screen.getByRole("link", { name: /camino seguro/i })).toHaveAttribute("href", "/camino-seguro");
    expect(screen.getByRole("link", { name: /historial de auxilios/i })).toHaveAttribute("href", "/historial");

    // SOS Trigger button
    const sosButton = screen.getByRole("button", { name: /activar emergencia sos/i });
    expect(sosButton).toBeInTheDocument();
    fireEvent.click(sosButton);
    expect(handleSos).toHaveBeenCalled();
  });

  it("renders operator navigation links when authenticated as operador", () => {
    useAuth.setState({
      isAuthenticated: true,
      user: {
        id: "usr-op1",
        nombre_completo: "Oficial Gómez",
        correo_electronico: "op@ven911.gob.ve",
        role: "operador",
      },
    });

    render(<AppSidebarNavigation />);

    expect(screen.getByText(/consola operativa/i)).toBeInTheDocument();
    expect(screen.getByText("Operador PSAP")).toBeInTheDocument();

    // Operator links
    expect(screen.getByRole("link", { name: /cola de demandas/i })).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("link", { name: /consola cint \(lsv\)/i })).toHaveAttribute("href", "/admin/cint");
    expect(screen.getByRole("link", { name: /métricas operativas/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /portal ciudadano/i })).toHaveAttribute("href", "/");

    // Citizen SOS button should not be displayed for operators
    expect(screen.queryByRole("button", { name: /activar emergencia sos/i })).not.toBeInTheDocument();
  });

  it("renders admin navigation links including Gestión de Usuarios when authenticated as admin", () => {
    useAuth.setState({
      isAuthenticated: true,
      user: {
        id: "usr-adm1",
        nombre_completo: "Super Administrador",
        correo_electronico: "admin@siae.gob.ve",
        role: "admin",
      },
    });

    render(<AppSidebarNavigation />);

    expect(screen.getByText(/panel administrador/i)).toBeInTheDocument();
    expect(screen.getByText("Admin Global")).toBeInTheDocument();

    // Admin links
    expect(screen.getByRole("link", { name: /consola psap/i })).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("link", { name: /gestión de usuarios/i })).toHaveAttribute("href", "/admin/usuarios");
    expect(screen.getByRole("link", { name: /panel de métricas/i })).toHaveAttribute("href", "/dashboard");
  });

  it("renders dispatcher navigation links and header when authenticated as despachador", () => {
    useAuth.setState({
      isAuthenticated: true,
      user: {
        id: "usr-desp1",
        nombre_completo: "Sgto. Pedro Rivas",
        correo_electronico: "despacho@ven911.gob.ve",
        role: "despachador",
      },
    });

    render(<AppSidebarNavigation />);

    expect(screen.getByText(/consola despacho/i)).toBeInTheDocument();
    expect(screen.getByText("Despachador VEN 911")).toBeInTheDocument();

    // Dispatcher operational links
    expect(screen.getByRole("link", { name: /cola de demandas/i })).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("link", { name: /consola cint \(lsv\)/i })).toHaveAttribute("href", "/admin/cint");
    expect(screen.getByRole("link", { name: /métricas operativas/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /portal ciudadano/i })).toHaveAttribute("href", "/");

    // Must NOT display admin-only user management link
    expect(screen.queryByRole("link", { name: /gestión de usuarios/i })).not.toBeInTheDocument();
  });

  it("opens the Cryptographic Key Rotation modal and displays active KID and Ed25519 algorithm", async () => {
    useAuth.setState({
      isAuthenticated: true,
      user: {
        id: "usr-adm1",
        nombre_completo: "Super Administrador",
        correo_electronico: "admin@siae.gob.ve",
        role: "admin",
      },
    });

    render(<AdminUsersPage />);

    const rotateKeysBtn = screen.getByRole("button", { name: /rotar claves jwt/i });
    expect(rotateKeysBtn).toBeInTheDocument();

    fireEvent.click(rotateKeysBtn);

    const modal = screen.getByRole("dialog", { name: /seguridad criptográfica & rotación jwt/i });
    expect(modal).toBeInTheDocument();
    expect(screen.getByText("Ed25519 (EdDSA RFC 8037)")).toBeInTheDocument();
    expect(screen.getByText(/siae-sig-2026/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: /confirmar rotación criptográfica/i });
    expect(confirmBtn).toBeInTheDocument();
  });
});
