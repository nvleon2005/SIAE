import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileBottomNav } from "@/src/components/siae/MobileBottomNav";
import { AdminSidebar } from "@/src/components/siae/AdminSidebar";
import { AdminShellLayout } from "@/src/components/siae/AdminShellLayout";
import { DesktopCitizenPortal } from "@/src/components/siae/DesktopCitizenPortal";
import { defaultLocalProfile } from "@/src/lib/profile-db";
import { useDeviceContext } from "@/src/hooks/use-device-context";
import { useAuth } from "@/src/modules/auth/auth-store";

vi.mock("@/src/hooks/use-device-context", () => ({
  useDeviceContext: vi.fn(() => ({
    isMounted: true,
    isDesktop: false,
    isStandalone: true,
  })),
}));

describe("Fase H: Arquitectura de Usabilidad y Navegación (PWA Móvil vs Consola Desktop)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.setState({
      isAuthenticated: false,
      user: null,
    });
  });

  describe("MobileBottomNav", () => {
    it("renders the 5 accessible touch destinations on mobile devices", () => {
      render(<MobileBottomNav isAnonymous={false} />);

      const nav = screen.getByRole("navigation", { name: /navegación principal móvil/i });
      expect(nav).toBeInTheDocument();

      // 5 tabs
      expect(screen.getByRole("link", { name: /^sos$/i })).toHaveAttribute("href", "/");
      expect(screen.getByRole("link", { name: /^camino$/i })).toHaveAttribute("href", "/camino-seguro");
      expect(screen.getByRole("link", { name: /^historial$/i })).toHaveAttribute("href", "/historial");
      expect(screen.getByRole("link", { name: /^perfil$/i })).toHaveAttribute("href", "/perfil");
      expect(screen.getByRole("link", { name: /^ajustes$/i })).toHaveAttribute("href", "/ajustes");
    });

    it("displays 'Ingresar' link when user is anonymous", () => {
      render(<MobileBottomNav isAnonymous={true} />);

      expect(screen.getByRole("link", { name: /^ingresar$/i })).toHaveAttribute("href", "/login");
      expect(screen.queryByRole("link", { name: /^perfil$/i })).not.toBeInTheDocument();
    });

    it("hides on non-standalone desktop browser to avoid duplicating desktop portal navigation", () => {
      vi.mocked(useDeviceContext).mockReturnValueOnce({
        isMounted: true,
        isDesktop: true,
        isStandalone: false,
        isMobile: false,
        hasGps: true,
      });

      const { container } = render(<MobileBottomNav isAnonymous={false} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("AdminSidebar", () => {
    it("renders the PSAP operator sidebar with status and queue counts", () => {
      const onRoleChange = vi.fn();
      render(
        <AdminSidebar
          queueCount={5}
          p0Count={2}
          operatorName="Operador 14"
          psapName="VEN 911 (Maturín, Monagas)"
        />
      );

      expect(screen.getByRole("complementary", { name: /menú lateral de despacho/i })).toBeInTheDocument();
      expect(screen.getByText("VEN 911 (Maturín, Monagas)")).toBeInTheDocument();
      expect(screen.getByText("Operador 14")).toBeInTheDocument();

      // Availability status
      expect(screen.getByText("Disponible")).toBeInTheDocument();

      // Badges
      expect(screen.getByText("2 P0")).toBeInTheDocument();

      // Navigation links aislados
      expect(screen.getByRole("link", { name: /atención acd|cola de triaje/i })).toHaveAttribute("href", "/operador");
      expect(screen.getByRole("link", { name: /incidencias atendidas/i })).toHaveAttribute("href", "/operador#atendidas");
      expect(screen.getByRole("link", { name: /centro intermediación/i })).toHaveAttribute("href", "/admin/cint");
      // Operador no tiene enlace de salida a Portal Ciudadano para evitar fugas de consola de emergencia
      expect(screen.queryByRole("link", { name: /portal ciudadano/i })).not.toBeInTheDocument();
    });

    it("allows switching operator availability between Activo, Pausa y Ocupado", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      expect(screen.getByText("Disponible")).toBeInTheDocument();

      // Change to Pausa
      await user.click(screen.getByRole("button", { name: /^pausa$/i }));
      expect(screen.getByText("En pausa")).toBeInTheDocument();

      // Change to Ocupado
      await user.click(screen.getByRole("button", { name: /^ocupado$/i }));
      expect(screen.getByText("En atención")).toBeInTheDocument();

      // Back to Activo
      await user.click(screen.getByRole("button", { name: /^activo$/i }));
      expect(screen.getByText("Disponible")).toBeInTheDocument();
    });

    it("allows collapsing and expanding the sidebar via accessible toggle button", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      const toggleButton = screen.getByRole("button", { name: /colapsar barra lateral/i });
      expect(toggleButton).toBeInTheDocument();

      await user.click(toggleButton);
      expect(screen.getByRole("button", { name: /expandir barra lateral/i })).toBeInTheDocument();
    });
  });

  describe("AdminShellLayout", () => {
    it("renders the shell with sidebar, topbar telemetry, and main content area", () => {
      render(
        <AdminShellLayout>
          <div data-testid="test-content">Contenido de prueba</div>
        </AdminShellLayout>
      );

      expect(screen.getByRole("complementary", { name: /menú lateral de despacho/i })).toBeInTheDocument();
      expect(screen.getByText(/nats \+ livekit conectado/i)).toBeInTheDocument();
      expect(screen.getByText(/latencia rtt < 280ms/i)).toBeInTheDocument();
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByTestId("test-content")).toBeInTheDocument();
    });
  });

  describe("DesktopCitizenPortal - Distinción de Roles y Seguridad UI/UX", () => {
    it("renders the public informative landing page without exposed operational hubs", () => {
      render(<DesktopCitizenPortal profile={defaultLocalProfile} />);

      // Citizen features
      expect(screen.getByRole("heading", { name: /siae · sistema de atención a emergencias/i })).toBeInTheDocument();
      expect(screen.queryByRole("region", { name: /descarga e instalación de la pwa en móvil/i })).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: /iniciar sesión/i })).toHaveAttribute("href", "/login");
      expect(screen.getByRole("link", { name: /crear cuenta/i })).toHaveAttribute("href", "/register");

      // Staff login link in institutional footer
      const staffLink = screen.getByRole("link", { name: /acceso a red operativa ven 911/i });
      expect(staffLink).toHaveAttribute("href", "/login?redirect=/admin");

      // Operational PSAP dispatch queue is NOT exposed openly without authentication
      expect(screen.queryByRole("link", { name: /cola de despacho psap/i })).not.toBeInTheDocument();
    });

    it("exposes Despacho VEN 911 console when user is authenticated as staff", () => {
      useAuth.setState({
        user: {
          id: "usr-op-1",
          correo_electronico: "operador@siae.gob.ve",
          nombre_completo: "Operador 14 VEN 911",
          role: "operador",
        },
        isAuthenticated: true,
      });

      render(<DesktopCitizenPortal profile={defaultLocalProfile} />);

      const dispatchLinks = screen.getAllByRole("link", { name: /cola de despacho psap|despacho/i });
      expect(dispatchLinks.length).toBeGreaterThan(0);
      expect(dispatchLinks[0]).toHaveAttribute("href", "/admin");

      // Reset
      useAuth.setState({ user: null, isAuthenticated: false });
    });
  });
});
