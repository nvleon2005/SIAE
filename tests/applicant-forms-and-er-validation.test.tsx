import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TipifyPage from "@/app/tipificar/page";
import ConfirmarPage from "@/app/confirmar/page";
import { PwaInstallQr } from "@/src/components/siae/PwaInstallQr";
import { useEmergency } from "@/src/modules/emergency/emergency-store";
import { useTypification } from "@/src/modules/typification/typification-store";
import { db, defaultLocalProfile, saveProfileToDb, type LocalProfileRecord } from "@/src/lib/profile-db";
import { findDevMockUser, saveDevMockUser } from "@/tests/fixtures/dev-mock-users";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/tipificar",
}));

describe("Validación de Formularios del Solicitante, Modelo ER y Puente QR PWA", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    useEmergency.getState().reset();
    useTypification.getState().reset();
    if (typeof window !== "undefined" && "indexedDB" in window) {
      await db.open().catch(() => {});
      await db.profiles.clear().catch(() => {});
    }
  });

  it("permite seleccionar si el afectado es 'yo_mismo' o 'otra_persona' con descripción en tipificación", async () => {
    // Set category and subtype to land on final confirmation step of tipificación
    useTypification.getState().setCategory("medical");
    useTypification.getState().setSubtype("medical.cardiac");

    render(<TipifyPage />);

    expect(screen.getByText(/¿A quién le ocurre\?/i)).toBeInTheDocument();
    expect(screen.getByText(/A mí mismo/i)).toBeInTheDocument();
    expect(screen.getByText(/A otra persona/i)).toBeInTheDocument();

    // Default is yo_mismo
    expect(useEmergency.getState().afectado).toBe("yo_mismo");

    // Click "A otra persona"
    const otraPersonaBtn = screen.getByRole("radio", { name: /a otra persona/i });
    fireEvent.click(otraPersonaBtn);

    expect(useEmergency.getState().afectado).toBe("otra_persona");

    // Check description field appears
    const descInput = screen.getByPlaceholderText(/adulto mayor con dolor de pecho/i);
    expect(descInput).toBeInTheDocument();

    fireEvent.change(descInput, { target: { value: "Abuelo de 75 años con dificultad motora" } });
    expect(useEmergency.getState().descripcionAfectado).toBe("Abuelo de 75 años con dificultad motora");

    // Add free text detail
    const detailsInput = screen.getByPlaceholderText(/describe brevemente la situación/i);
    fireEvent.change(detailsInput, { target: { value: "Se cayó en la sala y no puede levantarse" } });

    // Continue to location
    const continueBtn = screen.getByRole("button", { name: /Continuar/i });
    fireEvent.click(continueBtn);

    expect(useEmergency.getState().textoIncidente).toBe("Se cayó en la sala y no puede levantarse");
    expect(mockPush).toHaveBeenCalledWith("/ubicacion");
  });

  it("envía el payload completo del modelo ER en confirmación respetando canales del perfil (video_lse y rtt para sordos)", async () => {
    // Setup deaf profile
    const deafProfile: LocalProfileRecord = {
      ...defaultLocalProfile,
      name: "Ciudadano Sordo Test",
      disabilities: ["deaf"],
      channels: ["video", "rtt"],
      hasCompletedOnboarding: true,
      updatedAt: new Date().toISOString(),
    };
    await saveProfileToDb(deafProfile);

    // Setup emergency state matching ER
    useEmergency.getState().setTipificacion({ code: "medical.cardiac", label: "Corazón / Dolor", arasaacId: 3418 });
    useEmergency.getState().setUbicacion({
      lat: 9.7458,
      lng: -63.1825,
      accuracyM: 12,
      addressText: "Centro de Maturín, Monagas",
      source: "gps",
    });
    useEmergency.getState().setAfectado("otra_persona", "Hermana con convulsión");
    useEmergency.getState().setTextoIncidente("Convulsionando en el suelo, requiere auxilio");

    let capturedBody: Record<string, any> | null = null;
    globalThis.fetch = vi.fn().mockImplementation((url, options) => {
      if (typeof url === "string" && url.includes("/v1/emergencias")) {
        capturedBody = JSON.parse(options.body as string) as Record<string, any>;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ emergencia_id: "em-123", sala_id: "sala-123", sala: { token: "tok-123" } }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<ConfirmarPage />);

    // Check summary displays affected person and channels
    expect(await screen.findByText(/otra persona \(hermana con convulsión\)/i)).toBeInTheDocument();
    expect(screen.getByText(/video lsv/i)).toBeInTheDocument();
    expect(screen.getByText(/texto rtt/i)).toBeInTheDocument();

    // Trigger immediate send
    const sendBtn = screen.getByRole("button", { name: /enviar emergencia/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(capturedBody).not.toBeNull();
    });

    // Validate ER fields
    expect(capturedBody).toMatchObject({
      tipificacion_codigo: "medical.cardiac",
      pictograma_tipificacion: "3418",
      texto_incidente: "Convulsionando en el suelo, requiere auxilio",
      ubicacion_lat: 9.7458,
      ubicacion_lng: -63.1825,
      afectado: "otra_persona",
      descripcion_afectado: "Hermana con convulsión",
      psap_id: "psap-maturin-monagas",
    });

    // Check channels include video_lse and rtt for deaf profile
    const canales = (capturedBody as any)?.canales_activos as string[];
    expect(canales).toContain("video_lse");
    expect(canales).toContain("rtt");
  });

  it("genera URL de emparejamiento con el perfil del solicitante en PwaInstallQr", () => {
    const profile: LocalProfileRecord = {
      ...defaultLocalProfile,
      name: "Carlos Test",
      disabilities: ["low_vision"],
      theme: "high_contrast",
      fontScale: 1.5,
      emergencyContacts: [{ id: "c1", name: "Mamá", phone: "+584141112233", relation: "Madre" }],
      updatedAt: new Date().toISOString(),
    };

    render(<PwaInstallQr url="https://siae.gob.ve" profile={profile} />);

    expect(screen.getByText(/qr con ficha de accesibilidad vinculada: carlos test/i)).toBeInTheDocument();
    const qrSvg = screen.getByRole("img", { name: /código qr para abrir la app siae/i });
    expect(qrSvg.getAttribute("aria-label")).toContain("sync_profile");
  });

  it("permite registrar y autenticar usuarios en devMockUsersStore sin dependencias estáticas", () => {
    const testEmail = `usuario-${Date.now()}@siae.test`;
    const testPassword = "MiPassword123";
    const testName = "Usuario Autenticado";

    saveDevMockUser(testEmail, {
      id: "usr-dev-test",
      password: testPassword,
      role: "user",
      nombre: testName,
    });

    const found = findDevMockUser(testEmail);
    expect(found).toBeDefined();
    expect(found?.nombre).toBe(testName);
    expect(found?.password).toBe(testPassword);
  });
});
