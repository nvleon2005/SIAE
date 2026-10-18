import { describe, it, expect, vi, beforeEach } from "vitest";
import { createEmergencyRequest } from "@/src/modules/emergency/use-create-emergency";
import { saveProfileToDb, defaultLocalProfile, clearProfileStore } from "@/src/lib/profile-db";

describe("Priorización y Ficha PcD en Solicitudes de Emergencia", () => {
  beforeEach(async () => {
    await clearProfileStore();
    vi.restoreAllMocks();
  });

  it("inyecta la ficha de discapacidad y prioridad P0 cuando un usuario sordo crea una emergencia", async () => {
    // Guardar perfil de persona sorda con LSV
    await saveProfileToDb({
      ...defaultLocalProfile,
      name: "Carmen R.",
      isAnonymous: false,
      disabilities: ["deaf"],
      channels: ["video", "rtt"],
      medicalNotes: "Persona Sorda signante de LSV",
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "emerg-pcd-1",
        estado: "creada",
        psap_id: "psap-monagas",
        sala: { id: "sala-pcd-1", token: "jwt-1", url_websocket: "wss://livekit.local" },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await createEmergencyRequest({
      tipificacion: { code: "medica", label: "Médica" },
      ubicacion: { lat: 9.7489, lng: -63.1798, accuracyM: 10, source: "gps" },
      affected: "self",
      clientRequestId: "req-pcd-deaf",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/v1/emergencias",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-idempotency-key": "req-pcd-deaf",
        }),
      }),
    );

    const callBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(callBody).toMatchObject({
      client_request_id: "req-pcd-deaf",
      preferred_channels: ["video", "rtt"],
      perfil_ciudadano: {
        nombre: "Carmen R.",
        es_anonimo: false,
        discapacidades: ["deaf"],
        requiere_lsv: true,
        prioridad_sugerida: "P0",
        notas_medicas: "Persona Sorda signante de LSV",
      },
    });
  });

  it("asigna prioridad estándar P1 y requiere_lsv false si el usuario no posee discapacidades registradas", async () => {
    await saveProfileToDb({
      ...defaultLocalProfile,
      name: "Pedro G.",
      isAnonymous: false,
      disabilities: [],
      channels: ["voz"],
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "emerg-std-1",
        estado: "creada",
        psap_id: "psap-monagas",
        sala: { id: "sala-std-1", token: "jwt-2", url_websocket: "wss://livekit.local" },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await createEmergencyRequest({
      tipificacion: null,
      ubicacion: { lat: 9.7455, lng: -63.1812, accuracyM: 15, source: "manual" },
      affected: "self",
      clientRequestId: "req-std-1",
    });

    const callBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(callBody.perfil_ciudadano).toMatchObject({
      nombre: "Pedro G.",
      discapacidades: [],
      requiere_lsv: false,
      prioridad_sugerida: "P1",
    });
  });
});
