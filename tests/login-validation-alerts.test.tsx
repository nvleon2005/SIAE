import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UnifiedLoginPage } from "@/src/components/siae/UnifiedLoginPage";
import { useAuth } from "@/src/modules/auth/auth-store";

describe("Validaciones y Alertas de Login en SIAE", () => {
  beforeEach(() => {
    useAuth.getState().clearSession();
    vi.restoreAllMocks();
  });

  it("muestra alerta explícita cuando se intenta enviar el formulario vacío", async () => {
    const user = userEvent.setup();
    render(<UnifiedLoginPage mode="solicitante" />);

    const submitBtn = screen.getByTestId("btn-login-submit");
    await user.click(submitBtn);

    const alertBanner = await screen.findByTestId("login-error-banner");
    expect(alertBanner).toBeInTheDocument();
    expect(alertBanner).toHaveAttribute("role", "alert");
    expect(alertBanner).toHaveAttribute("aria-live", "assertive");
    expect(alertBanner).toHaveTextContent(/ingresa tu correo electrónico y tu contraseña/i);
  });

  it("muestra alerta explícita cuando el correo contiene caracteres no permitidos o inyección", async () => {
    const user = userEvent.setup();
    render(<UnifiedLoginPage mode="solicitante" />);

    const emailInput = screen.getByLabelText(/Email/i);
    await user.type(emailInput, "admin' OR 1=1--");
    await user.click(screen.getByTestId("btn-login-submit"));

    const alertBanner = await screen.findByTestId("login-error-banner");
    expect(alertBanner).toHaveTextContent(/caracteres no permitidos/i);
  });

  it("muestra alerta explícita con el motivo exacto cuando el servidor rechaza las credenciales", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "El usuario o correo 'desconocido@siae.gob.ve' no está registrado en el sistema local.",
          code: "USER_NOT_FOUND",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<UnifiedLoginPage mode="solicitante" />);

    await user.type(screen.getByLabelText(/Email/i), "desconocido@siae.gob.ve");
    await user.type(screen.getByLabelText(/Contraseña/i), "password123");
    await user.click(screen.getByTestId("btn-login-submit"));

    const alertBanner = await screen.findByTestId("login-error-banner");
    expect(alertBanner).toHaveTextContent(/no está registrado en el sistema local/i);
    expect(alertBanner).toHaveTextContent(/Intento 1 de 5/i);
  });

  it("bloquea y muestra alerta de Acceso Denegado si un solicitante intenta acceder a la consola operativa", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "usr-citizen-1",
          correo_electronico: "maria@ejemplo.com",
          nombre_completo: "María López",
          role: "user", // Rol ciudadano, no operativo
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<UnifiedLoginPage mode="operativo" />);

    await user.type(screen.getByLabelText(/Correo Institucional/i), "maria@ejemplo.com");
    await user.type(screen.getByLabelText(/Clave de Acceso/i), "solicitante123");
    await user.click(screen.getByTestId("btn-login-submit"));

    const alertBanner = await screen.findByTestId("login-error-banner");
    expect(alertBanner).toHaveTextContent(/Acceso Denegado/i);
    expect(alertBanner).toHaveTextContent(/rol de solicitante/i);
    expect(useAuth.getState().isAuthenticated).toBe(false);
  });

  it("muestra alerta de Acceso Suspendido tras acumular 5 intentos fallidos", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ error: "Contraseña incorrecta para el usuario ingresado." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<UnifiedLoginPage mode="solicitante" />);

    await user.type(screen.getByLabelText(/Email/i), "maria@ejemplo.com");
    await user.type(screen.getByLabelText(/Contraseña/i), "wrongpass");

    const submitBtn = screen.getByTestId("btn-login-submit");
    for (let i = 0; i < 5; i++) {
      await user.click(submitBtn);
    }

    await waitFor(() => {
      expect(screen.getByText(/Acceso Suspendido Temporalmente/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/5 intentos/i);
  });

  it("mantiene el mismo flujo de validación y cross-link en ambas rutas (/login y /admin/login)", async () => {
    const user = userEvent.setup();

    // 1. Probar en ruta operativa (/admin/login)
    const { unmount } = render(<UnifiedLoginPage mode="operativo" />);
    await user.click(screen.getByTestId("btn-login-submit"));
    expect(await screen.findByTestId("login-error-banner")).toHaveTextContent(/correo institucional o usuario/i);
    expect(screen.getByRole("link", { name: /Portal de Acceso Ciudadano/i })).toHaveAttribute("href", "/login");
    unmount();

    // 2. Probar en ruta solicitante (/login)
    render(<UnifiedLoginPage mode="solicitante" />);
    await user.click(screen.getByTestId("btn-login-submit"));
    expect(await screen.findByTestId("login-error-banner")).toHaveTextContent(/correo electrónico y tu contraseña/i);
    expect(screen.getByRole("link", { name: /Consola Operativa VEN 911/i })).toHaveAttribute("href", "/admin/login");
  });
});
