"use client";

import { useMutation } from "@tanstack/react-query";
import { useEmergency, type EmergencyTipificacion, type EmergencyUbicacion } from "@/src/modules/emergency/emergency-store";
import {
  listOutboxItems,
  putOutboxItem,
  updateOutboxItem,
  readProfileFromDb,
  type OutboxItem,
} from "@/src/lib/profile-db";

export interface CreateEmergencyInput {
  tipificacion: EmergencyTipificacion | null;
  ubicacion: EmergencyUbicacion;
  affected: "self" | "other";
  clientRequestId?: string;
}

async function buildEmergencyPayload(input: CreateEmergencyInput, clientRequestId: string) {
  const profile = await readProfileFromDb();
  const disabilities = profile?.disabilities ?? [];
  const channels = profile?.channels ?? [];
  const requiresLsv =
    disabilities.includes("deaf") ||
    disabilities.includes("hard_of_hearing") ||
    channels.includes("video");

  return {
    client_request_id: clientRequestId,
    tipificacion: input.tipificacion
      ? {
          code: input.tipificacion.code,
          pictogram_id: input.tipificacion.arasaacId,
        }
      : null,
    ubicacion_usuario: {
      lat: input.ubicacion.lat,
      lng: input.ubicacion.lng,
      accuracy_m: input.ubicacion.accuracyM,
      address_text: input.ubicacion.addressText,
      source: input.ubicacion.source,
      altitude_m: input.ubicacion.altitudeM ?? null,
      heading: input.ubicacion.heading ?? null,
      speed_mps: input.ubicacion.speedMps ?? null,
      captured_at: input.ubicacion.capturedAt ?? new Date().toISOString(),
    },
    ubicacion_incidente: {
      lat: input.ubicacion.lat,
      lng: input.ubicacion.lng,
      accuracy_m: input.ubicacion.accuracyM,
    },
    afectado: input.affected === "self" ? "SELF" : "OTHER",
    descripcion_afectado: input.affected === "self" ? "El propio usuario" : "Tercera persona",
    preferred_channels: channels,
    perfil_ciudadano: {
      nombre: profile?.name || null,
      es_anonimo: profile?.isAnonymous ?? true,
      discapacidades: disabilities,
      requiere_lsv: requiresLsv,
      contactos_emergencia: profile?.emergencyContacts ?? [],
      notas_medicas: profile?.medicalNotes ?? "",
    },
  };
}

async function throwApiError(response: Response): Promise<never> {
  let details: unknown = null;
  try {
    details = await response.json();
  } catch {
    details = null;
  }

  if (typeof details === "object" && details !== null) {
    const error = details as { code?: unknown; message?: unknown };
    if (typeof error.code === "string" && typeof error.message === "string") {
      throw new Error(`${error.code}: ${error.message}`);
    }
  }

  throw new Error(`HTTP ${response.status}`);
}

export interface SalaContract {
  id: string;
  token?: string;
  url_websocket?: string;
  websocket_url?: string;
  websocketUrl?: string;
  expires_in_s?: number;
  ice_servers?: Array<{ urls: string[]; username?: string; credential?: string }>;
}

export interface CreateEmergencyResponse {
  id: string;
  estado?: string;
  psap_id?: string;
  sala: {
    id: string;
    token?: string;
    url_websocket?: string;
    expires_in_s?: number;
    ice_servers?: Array<{ urls: string[]; username?: string; credential?: string }>;
  };
  fecha_creacion?: string;
}

interface ContractEmergencyResponse {
  emergencia: {
    id: string;
    estado: string;
    psap_id: string;
    created_at?: string;
  };
  sala: SalaContract;
}

export interface QueuedEmergencyResponse {
  id: string;
  queued: true;
}

export interface LocationPingInput {
  caminoSeguroId: string;
  lat: number;
  lng: number;
  accuracyM: number;
  capturedAt?: string;
}

export type CreateEmergencyResult = CreateEmergencyResponse | QueuedEmergencyResponse;

function normalizeCreateEmergencyResponse(payload: unknown): CreateEmergencyResponse {
  if (typeof payload !== "object" || payload === null) {
    throw new Error("INVALID_RESPONSE: respuesta de emergencia no válida");
  }

  const response = payload as Partial<CreateEmergencyResponse> & Partial<ContractEmergencyResponse>;
  const rawSala = response.sala as SalaContract | undefined;
  const id = response.id ?? response.emergencia?.id;
  if (typeof id !== "string" || !id || typeof rawSala?.id !== "string" || !rawSala.id) {
    throw new Error("INVALID_RESPONSE: faltan los identificadores confirmados de emergencia y sala");
  }

  return {
    id,
    ...(typeof response.estado === "string"
      ? { estado: response.estado }
      : typeof response.emergencia?.estado === "string"
        ? { estado: response.emergencia.estado }
        : {}),
    ...(typeof response.psap_id === "string"
      ? { psap_id: response.psap_id }
      : typeof response.emergencia?.psap_id === "string"
        ? { psap_id: response.emergencia.psap_id }
        : {}),
    sala: {
      id: rawSala.id,
      ...(typeof rawSala.token === "string" ? { token: rawSala.token } : {}),
      ...(typeof (rawSala.url_websocket ?? rawSala.websocket_url ?? rawSala.websocketUrl) === "string"
        ? { url_websocket: rawSala.url_websocket ?? rawSala.websocket_url ?? rawSala.websocketUrl }
        : {}),
      ...(typeof rawSala.expires_in_s === "number" ? { expires_in_s: rawSala.expires_in_s } : {}),
      ...(Array.isArray(rawSala.ice_servers) ? { ice_servers: rawSala.ice_servers } : {}),
    },
    ...(typeof response.fecha_creacion === "string"
      ? { fecha_creacion: response.fecha_creacion }
      : typeof response.emergencia?.created_at === "string"
        ? { fecha_creacion: response.emergencia.created_at }
        : {}),
  };
}

export function isQueuedEmergency(result: CreateEmergencyResult): result is QueuedEmergencyResponse {
  return "queued" in result && result.queued;
}

export async function enqueueEmergency(input: CreateEmergencyInput, clientRequestId = crypto.randomUUID()): Promise<QueuedEmergencyResponse> {
  const id = clientRequestId;
  const payload = await buildEmergencyPayload(input, id);
  const item: OutboxItem = {
    id,
    tipo: "crear_emergencia",
    payload,
    fechaCreacion: new Date().toISOString(),
    estado: "pendiente",
    tries: 0,
    lastError: null,
  };

  await putOutboxItem(item);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("siae-outbox-updated"));
    void navigator.serviceWorker?.ready.then((registration) => {
      const syncRegistration = registration as ServiceWorkerRegistration & {
        sync?: { register: (tag: string) => Promise<void> };
      };
      return syncRegistration.sync?.register("siae-outbox-sync");
    }).catch(() => undefined);
  }
  return { id: item.id, queued: true };
}

export async function enqueueLocationPing(input: LocationPingInput) {
  const clientRequestId = crypto.randomUUID();
  const item: OutboxItem = {
    id: clientRequestId,
    tipo: "ping_ubicacion",
    payload: {
      client_request_id: clientRequestId,
      lat: input.lat,
      lng: input.lng,
      accuracy_m: input.accuracyM,
      captured_at: input.capturedAt ?? new Date().toISOString(),
    },
    fechaCreacion: new Date().toISOString(),
    estado: "pendiente",
    tries: 0,
    lastError: null,
    caminoSeguroId: input.caminoSeguroId,
  };

  if (typeof navigator !== "undefined" && navigator.onLine) {
    try {
      return await sendOutboxItem(item);
    } catch {
      // Fallback a almacenamiento local si la red falla o el entorno no resuelve URLs relativas
    }
  }

  await putOutboxItem(item);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("siae-outbox-updated"));
  }
  return { queued: true as const, id: clientRequestId };
}

export async function sendOutboxItem(item: OutboxItem) {
  const endpoint = item.tipo === "ping_ubicacion" && item.caminoSeguroId
    ? `/v1/camino-seguro/${encodeURIComponent(item.caminoSeguroId)}/tick`
    : "/v1/emergencias";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-idempotency-key": item.id,
    },
    body: JSON.stringify(item.payload),
  });

  if (!response.ok) {
    await throwApiError(response);
  }

  const payload: unknown = await response.json();
  return item.tipo === "ping_ubicacion"
    ? payload as CreateEmergencyResponse
    : normalizeCreateEmergencyResponse(payload);
}

export async function createEmergencyRequest(input: CreateEmergencyInput): Promise<CreateEmergencyResult> {
  const clientRequestId = input.clientRequestId ?? crypto.randomUUID();
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return enqueueEmergency(input, clientRequestId);
  }

  const emergencyPayload = await buildEmergencyPayload(input, clientRequestId);

  let response: Response;
  try {
    response = await fetch("/v1/emergencias", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-idempotency-key": clientRequestId,
      },
      body: JSON.stringify(emergencyPayload),
    });
  } catch (error) {
    if (error instanceof TypeError || (typeof navigator !== "undefined" && !navigator.onLine)) {
      return enqueueEmergency(input, clientRequestId);
    }
    throw error;
  }

  if (!response.ok) {
    await throwApiError(response);
  }

  return normalizeCreateEmergencyResponse(await response.json());
}

export async function syncOutbox() {
  const items = (await listOutboxItems()).filter((item) => item.estado === "pendiente" || item.estado === "fallo");
  const synced: CreateEmergencyResponse[] = [];

  for (const item of items) {
    await updateOutboxItem(item.id, { estado: "enviando" });
    try {
      const response = await sendOutboxItem(item);
      await updateOutboxItem(item.id, {
        estado: "enviado",
        sentAt: new Date().toISOString(),
        lastError: null,
      });
      synced.push(response);
    } catch (error) {
      await updateOutboxItem(item.id, {
        estado: "fallo",
        tries: item.tries + 1,
        lastError: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  if (typeof window !== "undefined" && synced.length > 0) {
    window.dispatchEvent(new CustomEvent("siae-outbox-synced", { detail: synced }));
    window.dispatchEvent(new Event("siae-outbox-updated"));
  }
  return synced;
}

export function useCreateEmergency() {
  const setCurrentEmergency = useEmergency((state) => state.setCurrentEmergency);

  return useMutation<CreateEmergencyResult, Error, CreateEmergencyInput>({
    mutationFn: createEmergencyRequest,
    onSuccess: (data) => {
      if (!isQueuedEmergency(data)) {
        setCurrentEmergency(data.id, data.sala.id, data.sala.token ?? null);
      }
    },
  });
}
