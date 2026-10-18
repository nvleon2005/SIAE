import { render, screen } from "@testing-library/react";
import { DesktopCitizenPortal } from "@/src/components/siae/DesktopCitizenPortal";
import { PwaInstallQr } from "@/src/components/siae/PwaInstallQr";
import { defaultLocalProfile } from "@/src/lib/profile-db";
import { useAuth } from "@/src/modules/auth/auth-store";

describe("DesktopCitizenPortal and PwaInstallQr components", () => {
  beforeEach(() => {
    useAuth.setState({
      isAuthenticated: false,
      user: null,
    });
  });

  it("renders PwaInstallQr with instructions and QR code image", () => {
    render(<PwaInstallQr url="https://siae.emergencias.gob" />);

    expect(
      screen.getByRole("region", { name: /descarga e instalación de la pwa en móvil/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /código qr para abrir la app siae/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /copiar enlace directo/i })
    ).toBeInTheDocument();
  });

  it("renders the unauthenticated visitor portal with institutional pillars", () => {
    const anonymousProfile = {
      ...defaultLocalProfile,
      isAnonymous: true,
    };

    render(<DesktopCitizenPortal profile={anonymousProfile} />);

    expect(
      screen.getByRole("heading", { level: 2, name: /emergencias sin/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: /acceda a su perfil de ayuda/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /crear cuenta/i })
    ).toHaveAttribute("href", "/register");
    expect(
      screen.queryByRole("region", { name: /descarga e instalación de la pwa en móvil/i })
    ).not.toBeInTheDocument();
  });

  it("renders the authenticated citizen portal with registered profile details", () => {
    const onTriggerSos = vi.fn();
    useAuth.setState({
      isAuthenticated: true,
      user: {
        id: "c1",
        nombre_completo: "Carmen Valero",
        correo_electronico: "carmen@ejemplo.com",
        role: "solicitante",
      },
    });

    const registeredProfile = {
      ...defaultLocalProfile,
      isAnonymous: false,
      name: "Carmen Valero",
      disabilities: ["deaf" as const, "motor" as const],
      channels: ["video" as const, "rtt" as const],
      emergencyContacts: [
        { id: "c1", name: "Pedro Valero", phone: "+584146001122", relation: "Hermano" },
      ],
    };

    render(
      <DesktopCitizenPortal
        profile={registeredProfile}
        onTriggerSosEmergency={onTriggerSos}
      />
    );

    expect(screen.getByText(/bienvenido,/i)).toBeInTheDocument();
    expect(screen.getAllByText("Carmen Valero").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/contactos de emergencia/i).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("region", { name: /descarga e instalación de la pwa en móvil/i })
    ).toBeInTheDocument();

    const emergencyButton = screen.getByRole("button", { name: /activar emergencia sos/i });
    expect(emergencyButton).toBeInTheDocument();
  });
});
