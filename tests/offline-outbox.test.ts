import { clearOutboxStore, listOutboxItems } from "@/src/lib/profile-db";
import { createEmergencyRequest, enqueueLocationPing, syncOutbox } from "@/src/modules/emergency/use-create-emergency";

describe("SPRINT-08 offline outbox", () => {
  beforeEach(async () => {
    await clearOutboxStore();
    vi.restoreAllMocks();
  });

  it("encola una emergencia offline y la sincroniza al recuperar la conexión", async () => {
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true });

    const queued = await createEmergencyRequest({
      tipificacion: { code: "medical", label: "Médico" },
      ubicacion: { lat: 40.4168, lng: -3.7038, accuracyM: 12, source: "gps" },
      affected: "self",
    });

    expect(queued).toMatchObject({ queued: true });
    expect(await listOutboxItems()).toHaveLength(1);
    expect((await listOutboxItems())[0]).toMatchObject({ estado: "pendiente", tries: 0 });

    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "emerg-online", sala: { id: "sala-online" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const synced = await syncOutbox();

    expect(fetchMock).toHaveBeenCalledWith(
      "/v1/emergencias",
      expect.objectContaining({ method: "POST" }),
    );
    expect(synced).toHaveLength(1);
    expect((await listOutboxItems())[0]).toMatchObject({ estado: "enviado", tries: 0 });
  });

  it("conserva el error y aumenta los intentos si el envío falla", async () => {
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
    await createEmergencyRequest({
      tipificacion: null,
      ubicacion: { lat: 1, lng: 2, accuracyM: 30, source: "manual" },
      affected: "self",
    });

    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    await syncOutbox();

    expect((await listOutboxItems())[0]).toMatchObject({
      estado: "fallo",
      tries: 1,
      lastError: "HTTP 503",
    });
  });

  it("reutiliza el client_request_id en reintentos del mismo envío", async () => {
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "emerg-idempotent", sala: { id: "sala-idempotent" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const input = {
      tipificacion: null,
      ubicacion: { lat: 40, lng: -3, accuracyM: 10, source: "gps" as const },
      affected: "self" as const,
      clientRequestId: "request-fixed-1",
    };

    await createEmergencyRequest(input);
    await createEmergencyRequest(input);

    const firstPayload = JSON.parse(fetchMock.mock.calls[0][1].body as string) as { client_request_id: string };
    const secondPayload = JSON.parse(fetchMock.mock.calls[1][1].body as string) as { client_request_id: string };
    expect(firstPayload.client_request_id).toBe("request-fixed-1");
    expect(secondPayload.client_request_id).toBe(firstPayload.client_request_id);
    expect(fetchMock.mock.calls[0][1].headers).toMatchObject({
      "x-idempotency-key": "request-fixed-1",
    });
    expect(fetchMock.mock.calls[1][1].headers).toMatchObject({
      "x-idempotency-key": "request-fixed-1",
    });
  });

  it("envía el payload de emergencia con los nombres del contrato y x-idempotency-key", async () => {
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "emerg-contract-payload", sala: { id: "room-contract-payload" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await createEmergencyRequest({
      tipificacion: { code: "medical.cardiac", label: "Problema cardíaco" },
      ubicacion: {
        lat: 40.4168,
        lng: -3.7038,
        accuracyM: 12,
        source: "gps",
        capturedAt: "2026-09-02T12:00:00.000Z",
      },
      affected: "other",
      clientRequestId: "request-contract-payload",
    });

    expect(fetchMock.mock.calls[0][1].headers).toMatchObject({
      "Content-Type": "application/json",
      "x-idempotency-key": "request-contract-payload",
    });

    const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string) as Record<string, unknown>;
    const location = payload.ubicacion_usuario as Record<string, unknown>;
    expect(payload).toMatchObject({
      client_request_id: "request-contract-payload",
      afectado: "OTHER",
      tipificacion: {
        code: "medical.cardiac",
        pictogram_id: "medical.cardiac",
      },
    });
    expect(payload).not.toHaveProperty("affected");
    expect(location).toMatchObject({
      accuracy_m: 12,
      captured_at: "2026-09-02T12:00:00.000Z",
    });
    expect(location).not.toHaveProperty("accuracyM");
  });

  it("expone el código contractual cuando el backend rechaza un duplicado", async () => {
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ code: "IDEMPOTENT_CONFLICT", message: "payload diferente" }),
    }));

    await expect(createEmergencyRequest({
      tipificacion: null,
      ubicacion: { lat: 40, lng: -3, accuracyM: 10, source: "gps" },
      affected: "self",
      clientRequestId: "request-fixed-1",
    })).rejects.toThrow("IDEMPOTENT_CONFLICT: payload diferente");
  });

  it("normaliza la respuesta contractual anidada de emergencia", async () => {
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        emergencia: {
          id: "emerg-contract",
          estado: "created",
          psap_id: "psap-monagas",
          created_at: "2026-09-02T12:00:00.000Z",
        },
        sala: {
          id: "room-contract",
          token: "opaque-token",
          url_websocket: "wss://api.siae.example/v1/salas/stream",
          expires_in_s: 300,
        },
      }),
    }));

    await expect(createEmergencyRequest({
      tipificacion: null,
      ubicacion: { lat: 40, lng: -3, accuracyM: 10, source: "gps" },
      affected: "self",
    })).resolves.toMatchObject({
      id: "emerg-contract",
      estado: "created",
      sala: {
        id: "room-contract",
        url_websocket: "wss://api.siae.example/v1/salas/stream",
      },
    });
  });

  it("normaliza sala con websocket_url del protobuf backend", async () => {
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "emerg-pb-1",
        estado: "created",
        psap_id: "psap-1",
        sala: {
          id: "sala-pb-1",
          token: "token-pb",
          websocket_url: "ws://127.0.0.1:8080/ws/sala/sala-pb-1",
          expires_in_s: 300,
        },
      }),
    }));

    const result = await createEmergencyRequest({
      tipificacion: null,
      ubicacion: { lat: 40, lng: -3, accuracyM: 10, source: "gps" },
      affected: "self",
    });

    expect(result).toMatchObject({
      id: "emerg-pb-1",
      sala: {
        id: "sala-pb-1",
        url_websocket: "ws://127.0.0.1:8080/ws/sala/sala-pb-1",
      },
    });
  });

  it("encola y sincroniza pings de Camino Seguro en su endpoint propio", async () => {
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
    const queued = await enqueueLocationPing({ caminoSeguroId: "safe-1", lat: 40, lng: -3, accuracyM: 12 });
    expect(queued).toMatchObject({ queued: true });
    expect((await listOutboxItems())[0]).toMatchObject({ tipo: "ping_ubicacion", caminoSeguroId: "safe-1" });

    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ recibido: true }) });
    vi.stubGlobal("fetch", fetchMock);
    await syncOutbox();
    expect(fetchMock).toHaveBeenCalledWith(
      "/v1/camino-seguro/safe-1/tick",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-idempotency-key": expect.any(String),
        }),
      }),
    );
  });
});
