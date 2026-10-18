import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { POST as createOrganismo } from "@/app/v1/admin/organismos/route";
import { POST as createEmergency } from "@/app/v1/emergencias/route";
import { PSAP_TEST_QUEUE } from "@/tests/fixtures/psap-queue";
import {
  assignDemandApi,
  dispatchDemandApi,
  fetchDemandsQueue,
  releaseDemandApi,
  requestEvidenceApi,
  summonCintApi,
  transferDemandToDispatchApi,
  updateTriageDataApi,
} from "@/src/modules/psap/psap-client";
import { usePsapQueue } from "@/src/modules/psap/use-psap-queue";

const mocks = vi.hoisted(() => ({
  backendFetch: vi.fn(),
  getUserToken: vi.fn(),
}));

vi.mock("@/lib/bff-helper", () => ({
  backendFetch: mocks.backendFetch,
  getUserToken: mocks.getUserToken,
}));

function requestWithCookies(url: string, cookies: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: { cookie: cookies },
    body: JSON.stringify(body),
  });
}

function emergencyInput() {
  return {
    client_request_id: "request-123",
    tipificacion: { code: "medical.cardiac", pictogram_id: "cardiac" },
    ubicacion_usuario: {
      lat: 10.5,
      lng: -66.9,
      accuracy_m: 7,
      address_text: "Av. Bolívar",
    },
    ubicacion_incidente: { lat: 10.5, lng: -66.9, accuracy_m: 7 },
    afectado: "SELF",
    preferred_channels: ["rtt", "video"],
    perfil_ciudadano: { nombre: "Ciudadano de prueba", prioridad_sugerida: "P0" },
  };
}

describe("integridad de operaciones críticas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    mocks.getUserToken.mockResolvedValue("citizen-token");
    mocks.backendFetch.mockResolvedValue(
      NextResponse.json({
        emergencia: { id: "emergency-123", estado: "creada", psap_id: "psap-1" },
        sala: { id: "room-123", token: "room-token", url_websocket: "wss://rooms.test" },
      })
    );
  });

  it("rechaza operaciones administrativas sin token", async () => {
    const request = requestWithCookies(
      "http://localhost/v1/admin/organismos",
      "",
      { nombreUnidad: "Unidad nueva", organismo: "Organismo" }
    );

    const response = await createOrganismo(request);

    expect(response.status).toBe(401);
    expect(mocks.backendFetch).not.toHaveBeenCalled();
  });

  it("no confía en una cookie de rol admin si el backend valida un usuario común", async () => {
    mocks.backendFetch.mockResolvedValueOnce(NextResponse.json({ user: { role: "user" } }));
    const request = requestWithCookies(
      "http://localhost/v1/admin/organismos",
      "siae_token=opaque-token; siae_role=admin",
      { nombreUnidad: "Unidad nueva", organismo: "Organismo" }
    );

    const response = await createOrganismo(request);

    expect(response.status).toBe(403);
    expect(mocks.backendFetch).toHaveBeenCalledWith(
      "/v1/auth/me",
      expect.objectContaining({ token: "opaque-token" })
    );
  });

  it("permite la operación administrativa cuando el backend confirma el rol supervisor", async () => {
    mocks.backendFetch.mockResolvedValueOnce(NextResponse.json({ user: { role: "supervisor" } }));
    const request = requestWithCookies(
      "http://localhost/v1/admin/organismos",
      "siae_token=opaque-token; siae_role=admin",
      { nombreUnidad: "Unidad nueva", organismo: "Organismo" }
    );

    const response = await createOrganismo(request);

    expect(response.status).toBe(200);
    expect(mocks.backendFetch).toHaveBeenNthCalledWith(
      2,
      "/v1/admin/organismos",
      expect.objectContaining({
        method: "POST",
        body: { nombreUnidad: "Unidad nueva", organismo: "Organismo" },
        token: "opaque-token",
      })
    );
  });

  it("no acepta tokens mock de administrador en producción", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mocks.backendFetch.mockResolvedValueOnce(NextResponse.json({ user: { role: "user" } }));
    const request = requestWithCookies(
      "http://localhost/v1/admin/organismos",
      "siae_token=mock-jwt-admin-123; siae_role=admin",
      { nombreUnidad: "Unidad nueva", organismo: "Organismo" }
    );

    const response = await createOrganismo(request);

    expect(response.status).toBe(403);
    expect(mocks.backendFetch).toHaveBeenCalled();
  });

  it("propaga el fallo del backend sin registrar una emergencia local", async () => {
    mocks.backendFetch.mockResolvedValueOnce(
      NextResponse.json({ error: "Servicio no disponible" }, { status: 503 })
    );

    const response = await createEmergency(
      requestWithCookies("http://localhost/v1/emergencias", "", emergencyInput())
    );

    expect(response.status).toBe(503);
    expect(mocks.backendFetch).toHaveBeenCalledWith(
      "/v1/emergencias",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("rechaza la creación si la solicitud no contiene coordenadas reales", async () => {
    const body = {
      ...emergencyInput(),
      ubicacion_usuario: undefined,
      ubicacion_incidente: undefined,
    };

    const response = await createEmergency(
      requestWithCookies("http://localhost/v1/emergencias", "", body)
    );

    expect(response.status).toBe(400);
    expect(mocks.backendFetch).not.toHaveBeenCalled();
  });

  it("reenvía únicamente la respuesta real de creación del backend", async () => {
    const backendPayload = {
      emergencia: { id: "emergency-123", estado: "creada", psap_id: "psap-1" },
      sala: { id: "room-123", token: "room-token", url_websocket: "wss://rooms.test" },
    };
    mocks.backendFetch.mockResolvedValueOnce(NextResponse.json(backendPayload, { status: 201 }));

    const response = await createEmergency(
      requestWithCookies("http://localhost/v1/emergencias", "", emergencyInput())
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual(backendPayload);
    expect(mocks.backendFetch).toHaveBeenCalledWith(
      "/v1/emergencias",
      expect.objectContaining({
        body: expect.objectContaining({
          tipificacion_codigo: "medical.cardiac",
          ubicacion_lat: 10.5,
          ubicacion_lng: -66.9,
          canales_preferidos: ["rtt", "video"],
        }),
        token: "citizen-token",
      })
    );
  });

  it("no suplanta una cola real con datos de ejemplo", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "unavailable" }), { status: 503 })
    ));

    await expect(fetchDemandsQueue()).rejects.toThrow(/emergencias/i);
  });

  it("mantiene vacía una cola real vacía", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ demandas: [] }), { status: 200 })
    ));

    await expect(fetchDemandsQueue()).resolves.toEqual([]);
  });

  it("descarta demandas que carecen de sus datos operativos obligatorios", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        demandas: [
          { id: "incident-42" },
          { type: "Demanda sin identificador" },
        ],
      }), { status: 200 })
    ));

    const queue = await fetchDemandsQueue();

    expect(queue).toEqual([]);
  });

  it("devuelve false ante fallos de red en todas las mutaciones PSAP", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(assignDemandApi("d-1", "operator-1")).resolves.toBe(false);
    await expect(releaseDemandApi("d-1")).resolves.toBe(false);
    await expect(dispatchDemandApi("d-1", [])).resolves.toBe(false);
    await expect(summonCintApi("d-1")).resolves.toBe(false);
    await expect(requestEvidenceApi("d-1")).resolves.toBe(false);
    await expect(transferDemandToDispatchApi("d-1")).resolves.toBe(false);
    await expect(updateTriageDataApi("d-1", { triageNotes: "nota" })).resolves.toBe(false);
  });

  it("no cambia la cola local cuando falla la confirmación de una mutación", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    usePsapQueue.setState({
      queue: PSAP_TEST_QUEUE,
      selectedId: PSAP_TEST_QUEUE[0].id,
      notice: "",
    });

    await usePsapQueue.getState().assignSelected();

    expect(usePsapQueue.getState().queue[0]).toMatchObject({
      id: PSAP_TEST_QUEUE[0].id,
      status: PSAP_TEST_QUEUE[0].status,
      agenteId: PSAP_TEST_QUEUE[0].agenteId,
    });
    expect(usePsapQueue.getState().notice).toMatch(/no se confirmó/i);
  });
});
