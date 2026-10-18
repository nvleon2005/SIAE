import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";
import LoginPage from "@/app/login/page";
import RegisterPage from "@/app/register/page";
import TipifyPage from "@/app/tipificar/page";
import UbicacionPage from "@/app/ubicacion/page";
import ConfirmarPage from "@/app/confirmar/page";
import ProfilePage from "@/app/perfil/page";
import DashboardPage from "@/app/dashboard/page";
import AdminPage from "@/app/admin/page";
import HistorialPage from "@/app/historial/page";
import OnboardingPage from "@/app/onboarding/page";
import { SosFab } from "@/src/components/siae/SosFab";
import { clearProfileStore, defaultLocalProfile, saveProfileToDb } from "@/src/lib/profile-db";
import { useEmergency } from "@/src/modules/emergency/emergency-store";
import { useTypification } from "@/src/modules/typification/typification-store";

vi.mock("@/src/hooks/use-device-context", () => ({
  useDeviceContext: () => ({
    isMounted: true,
    isStandalone: false,
    isMobile: true,
    isDesktop: false,
    hasGps: true,
  }),
}));

describe("Home page", () => {
  beforeEach(async () => {
    await clearProfileStore();
    await saveProfileToDb({
      ...defaultLocalProfile,
      isAnonymous: false,
      hasCompletedOnboarding: true,
    });
  });

  it("renders the main SIAE home and emergency button", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /SIAE/i })).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /activar emergencia/i })).toBeInTheDocument();
  });

  it("shows the three onboarding screens on first launch", async () => {
    const user = userEvent.setup();
    render(<OnboardingPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /tu accesibilidad/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /siguiente/i }));
    expect(screen.getByRole("heading", { name: /ubicación/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /siguiente/i }));
    expect(screen.getByRole("heading", { name: /canales/i })).toBeInTheDocument();
  });

  it("exposes real navigation links to Camino Seguro and the emergency history", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getAllByRole("link", { name: /camino seguro/i })[0]).toHaveAttribute("href", "/camino-seguro");
      expect(screen.getAllByRole("link", { name: /historial/i })[0]).toHaveAttribute("href", "/historial");
    });
  });

  it("shows the full app shell actions for profile, settings, login and operations dashboard", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getAllByRole("link", { name: /perfil/i })[0]).toHaveAttribute("href", "/perfil");
      expect(screen.getAllByRole("link", { name: /ajustes/i })[0]).toHaveAttribute("href", "/ajustes");
      expect(screen.getByRole("link", { name: /iniciar sesión/i })).toHaveAttribute("href", "/login");
      expect(screen.getByRole("link", { name: /panel operativo/i })).toHaveAttribute("href", "/dashboard");
    });
  });

  it("renders a serious institutional landing screen for anonymous access", async () => {
    await saveProfileToDb({
      ...defaultLocalProfile,
      isAnonymous: true,
      hasCompletedOnboarding: false,
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /sistema de atención a emergencias/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /acceda a su perfil de ayuda/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /crear cuenta/i })).toBeInTheDocument();
    });
  });

  it("renders the operational dashboard with the core command center sections", () => {
    render(<DashboardPage />);

    expect(screen.getByRole("heading", { name: /panel operativo corporativo/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /incidentes prioritarios/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /estado del turno/i })).toBeInTheDocument();
    expect(screen.getByText(/mapa de emergencias/i)).toBeInTheDocument();
  });

  it("presents the operational dashboard without demo wording or mock labels", () => {
    render(<DashboardPage />);

    expect(screen.queryByText(/mockup/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mock psap/i)).not.toBeInTheDocument();
    expect(screen.getByText(/centro de coordinación/i)).toBeInTheDocument();
  });

  it("renders the mock PSAP queue and assigns a selected demand", async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    expect(screen.getByRole("heading", { name: /centro de atención/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /cola de demandas/i })).toBeInTheDocument();
    expect(screen.getAllByText("DEM-2048")).not.toHaveLength(0);

    await user.click(screen.getByRole("button", { name: /tomar demanda/i }));

    expect(screen.getByText(/asignada a operador 14/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /liberar demanda/i })).toBeInTheDocument();
  });

  it("filters the mock PSAP queue to demands requiring LSE", async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    await user.click(screen.getByRole("button", { name: /con lse/i }));

    expect(screen.getAllByText("DEM-2048")).not.toHaveLength(0);
    expect(screen.queryByText("DEM-2049")).not.toBeInTheDocument();
  });

  it("shows the admin operating shell with map, roles and active room status", () => {
    render(<AdminPage />);

    expect(screen.getByRole("heading", { name: /mapa operativo/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /equipo asignado/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /sala en curso/i })).toBeInTheDocument();
    expect(screen.getAllByText(/operador 14/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/permiso de vídeo/i).length).toBeGreaterThan(0);
  });

  it("simulates admin role permissions and room recovery", async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    await user.click(screen.getByRole("button", { name: /intérprete lse/i }));
    expect(screen.getByText(/ver demandas lse/i)).toBeInTheDocument();
    expect(screen.queryByText(/tomar demandas/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /simular reconexión/i }));
    expect(screen.getByText("Reconectando")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /permiso de vídeo/i }));
    expect(screen.getByText("Aprobado")).toBeInTheDocument();
  });

  it("opens an emergency history detail with RTT messages and room link", async () => {
    const user = userEvent.setup();
    render(<HistorialPage />);

    await user.click(screen.getByRole("button", { name: /ver detalle de em-2048/i }));

    expect(screen.getByRole("heading", { name: /em-2048 · caída en la calle/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /conversación rtt/i })).toBeInTheDocument();
    expect(screen.getByText(/la ayuda está en camino/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /abrir sala de esta emergencia/i })).toHaveAttribute("href", "/sala/EM-2048?role=ciudadano");

    await user.click(screen.getByRole("button", { name: /cerrar detalle/i }));
    expect(screen.queryByRole("heading", { name: /em-2048 · caída en la calle/i })).not.toBeInTheDocument();
  });

  it("persists the local profile when onboarding is skipped", async () => {
    const user = userEvent.setup();
    render(<OnboardingPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /saltar/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /saltar/i }));

    await waitFor(() => {
      const savedProfile = JSON.parse(window.localStorage.getItem("siae-profile") || "null");
      expect(savedProfile).toMatchObject({ hasCompletedOnboarding: true, channels: expect.any(Array) });
    });

    expect(screen.getByRole("heading", { name: /tu accesibilidad/i })).toBeInTheDocument();
  });

  it("activates SOS once with the global Alt+E shortcut", () => {
    render(<SosFab />);

    fireEvent.keyDown(window, { key: "e", altKey: true });
    fireEvent.keyDown(window, { key: "e", altKey: true });

    expect(useEmergency.getState().flowStatus).toBe("activating");
    expect(screen.getByRole("dialog", { name: /activación de emergencia/i })).toBeInTheDocument();
  });

  it("supports Space as the switch and keyboard activation", () => {
    vi.useFakeTimers();
    render(<SosFab />);
    const sosButton = screen.getByRole("button", { name: /activar emergencia/i });

    fireEvent.keyDown(sosButton, { key: " " });
    vi.advanceTimersByTime(1000);
    fireEvent.keyUp(sosButton, { key: " " });

    expect(useEmergency.getState().flowStatus).toBe("activating");
    vi.useRealTimers();
  });

  it("lets the user select a category and subtype in the tipification flow", async () => {
    const user = userEvent.setup();
    render(<TipifyPage />);

    expect(screen.getByRole("heading", { name: /¿qué pasa\?/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /médico/i }));

    expect(screen.getByRole("heading", { name: /¿qué tipo de problema médico\?/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /corazón/i }));

    expect(screen.getByText(/médico/i)).toBeInTheDocument();
    expect(screen.getByText(/corazón/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continuar/i })).toBeInTheDocument();
  });

  it("moves focus across tipification options with arrow keys", async () => {
    const user = userEvent.setup();
    useTypification.getState().reset();
    render(<TipifyPage />);

    const medicalButton = screen.getByRole("button", { name: /médico/i });
    const accidentButton = screen.getByRole("button", { name: /accidente/i });
    medicalButton.focus();
    await user.keyboard("{ArrowRight}");

    expect(accidentButton).toHaveFocus();
  });

  it("loads the user location and shows coordinates in the location step", async () => {
    const mockGetCurrentPosition = vi.fn((success) => {
      success({
        coords: { latitude: 40.4168, longitude: -3.7038, accuracy: 12 },
      });
    });

    Object.defineProperty(window.navigator, "geolocation", {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
    });

    render(<UbicacionPage />);

    expect(screen.getByRole("heading", { name: /¿dónde estás\?/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/40\.4168/i)).toBeInTheDocument();
      expect(screen.getByText(/-3\.7038/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /continuar/i })).toBeInTheDocument();
  });

  it("shows the confirmation summary and submits the emergency when the user confirms activation", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "emerg-123",
        estado: "creada",
        psap_id: "psap-monagas",
        sala: {
          id: "sala-123",
          token: "mock-token",
          url_websocket: "wss://mock.local",
          expires_in_s: 300,
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    useTypification.setState({
      categoryCode: "medical",
      subtypeCode: "cardiac",
      freeText: "Dolor fuerte en el pecho",
      pictogramsOnly: false,
    });

    useEmergency.setState({
      tipificacion: { code: "medical", label: "Médico" },
      ubicacion: {
        lat: 9.7489,
        lng: -63.1798,
        accuracyM: 12,
        addressText: "Av. Bolívar c/c Calle Monagas, Maturín, Edo. Monagas",
        source: "gps",
      },
      currentEmergencyId: null,
      currentRoomId: null,
    });

    render(<ConfirmarPage />);

    expect(screen.getByRole("heading", { name: /confirmar emergencia/i })).toBeInTheDocument();
    expect(screen.getAllByText(/médico/i)[0]).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /enviar emergencia/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/v1/emergencias",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
        }),
      );
    });
  });

  it("shows the activation modal after the emergency is submitted", async () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "emerg-456",
        estado: "creada",
        sala: { id: "sala-456", token: "token", url_websocket: "wss://mock.local", expires_in_s: 300 },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    useTypification.setState({
      categoryCode: "medical",
      subtypeCode: "cardiac",
      freeText: "Dolor fuerte en el pecho",
      pictogramsOnly: false,
    });

    useEmergency.setState({
      tipificacion: { code: "medical", label: "Médico" },
      ubicacion: {
        lat: 9.7489,
        lng: -63.1798,
        accuracyM: 12,
        addressText: "Av. Bolívar c/c Calle Monagas, Maturín, Edo. Monagas",
        source: "gps",
      },
      currentEmergencyId: null,
      currentRoomId: null,
    });

    render(<ConfirmarPage />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /enviar emergencia/i }));
    });

    expect(screen.getAllByText(/activando/i).length).toBeGreaterThan(0);

    vi.useRealTimers();
  });

  it("requires confirmation before cancelling the emergency", async () => {
    const user = userEvent.setup();
    useEmergency.setState({
      tipificacion: { code: "medical", label: "Médico" },
      ubicacion: { lat: 40.4168, lng: -3.7038, accuracyM: 12, source: "gps" },
    });
    render(<ConfirmarPage />);

    await user.click(screen.getByRole("button", { name: /cancelar envío/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/quieres cancelar/i);
    await user.click(screen.getByRole("button", { name: /sí, cancelar/i }));

    expect(useEmergency.getState().flowStatus).toBe("cancelled");
    expect(screen.getByRole("alert")).toHaveTextContent(/emergencia cancelada/i);
  });

  it("shows an accessible recovery message when emergency creation fails", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);
    useEmergency.setState({
      tipificacion: { code: "medical", label: "Médico" },
      ubicacion: { lat: 40.4168, lng: -3.7038, accuracyM: 12, source: "gps" },
    });
    render(<ConfirmarPage />);

    await user.click(screen.getByRole("button", { name: /enviar emergencia/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/v1/emergencias",
      expect.objectContaining({ method: "POST" }),
    ));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/no se pudo activar/i);
    });
    expect(useEmergency.getState().flowStatus).toBe("confirming");
  });

  it("exposes profile management actions and clears the local profile after confirmation", async () => {
    const user = userEvent.setup();
    const createObjectUrl = vi.fn(() => "blob:mock-url");
    const revokeObjectUrl = vi.fn();
    const clickMock = vi.fn();
    const nativeCreateElement = document.createElement.bind(document);

    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: createObjectUrl,
      revokeObjectURL: revokeObjectUrl,
    });

    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /perfil/i })).toBeInTheDocument();
    });

    const exportButton = await screen.findByRole("button", { name: /exportar mis datos/i });
    expect(exportButton).toBeInTheDocument();

    const link = nativeCreateElement("a");
    link.click = clickMock;
    vi.spyOn(document, "createElement").mockImplementation((tagName: string, options?: ElementCreationOptions) => {
      if (tagName === "a") {
        return link;
      }
      return nativeCreateElement(tagName, options);
    });

    await user.click(exportButton);
    expect(createObjectUrl).toHaveBeenCalled();

    await user.click(await screen.findByRole("tab", { name: /mis domicilios y datos/i }));
    await user.click(screen.getByRole("button", { name: /borrar todos mis datos/i }));
    await waitFor(() => {
      expect(window.localStorage.getItem("siae-profile")).toBeNull();
    });

    await user.click(await screen.findByRole("tab", { name: /accesibilidad/i }));
    await user.click(screen.getByRole("button", { name: /restablecer accesibilidad/i }));
    expect(screen.getByText(/1.0x/i)).toBeInTheDocument();
  });

  it("applies profile accessibility changes to the document immediately", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);
    await user.click(await screen.findByRole("tab", { name: /accesibilidad/i }));
    await screen.findByRole("button", { name: /restablecer accesibilidad/i });
    await user.selectOptions(screen.getByLabelText("Tema"), "high_contrast");
    fireEvent.change(screen.getByLabelText("Tamaño de texto"), { target: { value: "2" } });

    expect(document.documentElement.dataset.theme).toBe("high_contrast");
    expect(document.documentElement.style.getPropertyValue("--font-scale")).toBe("2");
  });

  it("updates the document language and accessibility attributes from the profile", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);
    await user.click(await screen.findByRole("tab", { name: /accesibilidad/i }));
    await screen.findByRole("button", { name: /restablecer accesibilidad/i });

    await user.selectOptions(screen.getByLabelText("Idioma"), "en");
    await user.selectOptions(screen.getByLabelText("Tema"), "high_contrast");
    await user.click(screen.getByLabelText("Movimiento reducido"));

    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dataset.theme).toBe("high_contrast");
    expect(document.documentElement.dataset.reducedMotion).toBe("true");
  });

  it("renders the login form and signs in with email and password", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "mock-jwt-token",
        refresh_token: "mock-refresh-token",
        expires_in: 900,
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "maria@ejemplo.com");
    await user.type(screen.getByLabelText(/contraseña/i), "SecurePass123!");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/v1/auth/login",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ correo_electronico: "maria@ejemplo.com", password: "SecurePass123!" }),
        }),
      );
    });
  });

  it("renders the registration form and submits the new account", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "user-1",
        correo_electronico: "ana@ejemplo.com",
        nombre_completo: "Ana Garcia",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/nombre/i), "Ana Garcia");
    await user.type(screen.getByLabelText(/email/i), "ana@ejemplo.com");
    await user.type(screen.getByPlaceholderText("04141234567"), "04141234567");
    await user.type(screen.getByLabelText(/contraseña \(mínimo 8 caracteres\)/i), "SecurePass123!");
    await user.type(screen.getByLabelText(/confirmar contraseña/i), "SecurePass123!");
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/v1/auth/register",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            nombre_completo: "Ana Garcia",
            correo_electronico: "ana@ejemplo.com",
            password: "SecurePass123!",
          }),
        }),
      );
    });
  }, 15000);

  it("shows a safe message when passkey registration fails", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "user-1",
          correo_electronico: "ana@ejemplo.com",
          nombre_completo: "Ana Garcia",
        }),
      })
      .mockResolvedValueOnce({ ok: false, status: 503 });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/nombre/i), "Ana Garcia");
    await user.type(screen.getByLabelText(/email/i), "ana@ejemplo.com");
    await user.type(screen.getByPlaceholderText("04141234567"), "04141234567");
    await user.type(screen.getByLabelText(/contraseña \(mínimo 8 caracteres\)/i), "SecurePass123!");
    await user.type(screen.getByLabelText(/confirmar contraseña/i), "SecurePass123!");
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));
    await user.click(await screen.findByRole("button", { name: /registrar passkey/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/no se pudo registrar la passkey/i);
  }, 15000);
});
