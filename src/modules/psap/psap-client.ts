import { DemandaItem, PSAPInfo, DispatchedUnit } from "./types";

export async function fetchPsapList(): Promise<PSAPInfo[]> {
  const response = await fetch("/v1/psap", {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`No se pudo cargar la lista PSAP (${response.status})`);
  }

  const data: unknown = await response.json();
  const psaps = isRecord(data) && Array.isArray(data.psaps)
    ? data.psaps
    : Array.isArray(data) ? data : null;
  if (!psaps || !psaps.every(isRecord)) {
    throw new Error("La respuesta PSAP no tiene un formato válido");
  }
  return psaps as unknown as PSAPInfo[];
}

export async function resolvePsap(lat: number, lng: number): Promise<PSAPInfo | null> {
  const response = await fetch("/v1/psap/resolve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ lat, lng }),
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`No se pudo resolver el PSAP (${response.status})`);
  }
  return await response.json();
}

export async function fetchDemandsQueue(): Promise<DemandaItem[]> {
  let lastError: unknown;

  try {
    const res = await fetch("/v1/psap/demandas", {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error(`No se pudo cargar la cola PSAP (${res.status})`);
    }

    const data: unknown = await res.json();
    const list: unknown[] | null = isRecord(data) && Array.isArray(data.demandas)
      ? data.demandas
      : Array.isArray(data) ? data : null;
    if (!list) {
      throw new Error("La respuesta de la cola PSAP no tiene un formato válido");
    }
    if (list.length === 0) return [];
    return list
      .filter(isRecord)
      .map(normalizeDemanda)
      .filter((item): item is DemandaItem => item !== null);
  } catch (error) {
    lastError = error;
  }

  try {
    const emergRes = await fetch("/v1/emergencias", {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });
    if (!emergRes.ok) {
      throw new Error(`No se pudo cargar la lista de emergencias (${emergRes.status})`);
    }

    const emergData: unknown = await emergRes.json();
    const emergList: unknown[] | null = isRecord(emergData) && Array.isArray(emergData.emergencias)
      ? emergData.emergencias
      : Array.isArray(emergData) ? emergData : null;
    if (!emergList) {
      throw new Error("La respuesta de emergencias no tiene un formato válido");
    }
    if (emergList.length === 0) return [];
    return emergList
      .filter(isRecord)
      .map(normalizeEmergenciaToDemanda)
      .filter((item): item is DemandaItem => item !== null);
  } catch (error) {
    lastError = error;
  }

  throw lastError instanceof Error ? lastError : new Error("No se pudo cargar la cola PSAP");
}

export async function assignDemandApi(demandId: string, agentId?: string): Promise<boolean> {
  const idempotencyKey = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}`;
  try {
    const res = await fetch(`/v1/psap/demandas/${encodeURIComponent(demandId)}/asignar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-idempotency-key": idempotencyKey,
      },
      credentials: "include",
      body: JSON.stringify(agentId ? { agente_id: agentId } : {}),
    });

    if (res.ok) {
      return true;
    }

    // Fallback: PATCH /v1/emergencias/:id
    const patchRes = await fetch(`/v1/emergencias/${encodeURIComponent(demandId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-idempotency-key": idempotencyKey,
      },
      credentials: "include",
      body: JSON.stringify({ estado: "asignada", agente_id: agentId }),
    });
    return patchRes.ok;
  } catch {
    return false;
  }
}

export async function releaseDemandApi(demandId: string): Promise<boolean> {
  const idempotencyKey = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}`;
  try {
    const res = await fetch(`/v1/psap/demandas/${encodeURIComponent(demandId)}/liberar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-idempotency-key": idempotencyKey,
      },
      credentials: "include",
      body: JSON.stringify({}),
    });

    if (res.ok) {
      return true;
    }

    // Fallback: PATCH /v1/emergencias/:id
    const patchRes = await fetch(`/v1/emergencias/${encodeURIComponent(demandId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-idempotency-key": idempotencyKey,
      },
      credentials: "include",
      body: JSON.stringify({ estado: "encolada", agente_id: null }),
    });
    return patchRes.ok;
  } catch {
    return false;
  }
}

export async function dispatchDemandApi(
  demandId: string,
  units: DispatchedUnit[],
  notes?: string
): Promise<boolean> {
  const idempotencyKey = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}`;
  try {
    const res = await fetch(`/v1/psap/demandas/${encodeURIComponent(demandId)}/despachar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-idempotency-key": idempotencyKey,
      },
      credentials: "include",
      body: JSON.stringify({ unidades: units, notas: notes }),
    });

    if (res.ok) {
      return true;
    }

    // Fallback: PATCH /v1/emergencias/:id
    const patchRes = await fetch(`/v1/emergencias/${encodeURIComponent(demandId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-idempotency-key": idempotencyKey,
      },
      credentials: "include",
      body: JSON.stringify({
        estado: "despachada",
        despacho: {
          unidades: units,
          despachado_el: new Date().toISOString(),
          notas: notes,
        },
      }),
    });
    return patchRes.ok;
  } catch {
    return false;
  }
}

export async function summonCintApi(demandId: string, agentId?: string): Promise<boolean> {
  const idempotencyKey = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}`;
  try {
    const res = await fetch(`/v1/psap/demandas/${encodeURIComponent(demandId)}/cint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-idempotency-key": idempotencyKey,
      },
      credentials: "include",
      body: JSON.stringify({ agente_id: agentId, action: "convocar_interprete_lsv" }),
    });

    if (res.ok) {
      return true;
    }

    // Fallback: POST to /v1/cint
    const cintRes = await fetch("/v1/cint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-idempotency-key": idempotencyKey,
      },
      credentials: "include",
      body: JSON.stringify({ demandId, agentId, requestedAt: new Date().toISOString() }),
    });
    return cintRes.ok;
  } catch {
    return false;
  }
}

export async function requestEvidenceApi(
  demandId: string,
  evidenceType: "foto" | "video" | "audio" = "foto"
): Promise<boolean> {
  const idempotencyKey = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}`;
  try {
    const res = await fetch(`/v1/psap/demandas/${encodeURIComponent(demandId)}/evidencia`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-idempotency-key": idempotencyKey,
      },
      credentials: "include",
      body: JSON.stringify({ tipo: evidenceType, requestedAt: new Date().toISOString() }),
    });

    return res.ok;
  } catch {
    return false;
  }
}

export async function updateTriageDataApi(
  demandId: string,
  updates: { triageNotes?: string; quadrant?: string }
): Promise<boolean> {
  const idempotencyKey = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `idemp-${Date.now()}`;
  try {
    const response = await fetch(`/v1/emergencias/${encodeURIComponent(demandId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-idempotency-key": idempotencyKey,
      },
      credentials: "include",
      body: JSON.stringify({
        triaje: {
          notas: updates.triageNotes,
          cuadrante: updates.quadrant,
        },
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function transferDemandToDispatchApi(
  demandId: string,
  notes?: string,
  quadrant?: string
): Promise<boolean> {
  const idempotencyKey = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}`;
  try {
    const res = await fetch(`/v1/psap/demandas/${encodeURIComponent(demandId)}/transferir`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-idempotency-key": idempotencyKey,
      },
      credentials: "include",
      body: JSON.stringify({ notas: notes, cuadrante: quadrant, transferido_el: new Date().toISOString() }),
    });

    if (res.ok) return true;

    // Fallback: PATCH /v1/emergencias/:id
    const patchRes = await fetch(`/v1/emergencias/${encodeURIComponent(demandId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-idempotency-key": idempotencyKey,
      },
      credentials: "include",
      body: JSON.stringify({
        estado: "transferida_despacho",
        triaje: {
          notas: notes,
          cuadrante: quadrant,
          transferido_el: new Date().toISOString(),
        },
      }),
    });
    return patchRes.ok;
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readFiniteNumber(value: unknown): number | undefined {
  if (typeof value !== "number" && typeof value !== "string") return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function firstStringValue(...values: unknown[]): string | undefined {
  return values.find((value): value is string => typeof value === "string" && value.length > 0);
}

function normalizeDemanda(item: Record<string, unknown>): DemandaItem | null {
  const rawId = firstStringValue(item.id, item.emergencia_id, item.id_demanda);
  if (!rawId?.trim()) return null;
  const id = rawId;

  const channelsList = Array.isArray(item.channels)
    ? item.channels.map(String)
    : Array.isArray(item.canales)
    ? item.canales.map(String)
    : Array.isArray(item.canales_activos)
    ? item.canales_activos.map(String)
    : typeof item.channel === "string"
      ? [item.channel]
      : typeof item.canal === "string" ? [item.canal] : [];

  const requiresLse = Boolean(
    item.requiresLse ||
    item.soporta_lse ||
    channelsList.some((c) => {
      const lower = c.toLowerCase();
      return lower.includes("lse") || lower.includes("sign") || lower.includes("lsv") || lower.includes("video");
    })
  );

  const rawTip = firstStringValue(item.type, item.tipo, item.tipificacion, item.codigo_tipificacion, item.texto_incidente);
  if (!rawTip) return null;
  const tipMap: Record<string, string> = {
    "accidente.trafico": "Accidente vial con colisión",
    "accidente": "Accidente de tránsito / colisión",
    "medical.cardiac": "Médico · Dolor torácico / Paro",
    "medical.respiratory": "Médico · Dificultad respiratoria",
    "medical.ambulance": "Médico · Solicitud urgente ambulancia",
    "medical": "Médico · Atención de emergencia",
    "incendio": "Incendio estructural / vegetación",
    "seguridad": "Seguridad ciudadana / auxilio",
  };
  const type = item.texto_incidente ? String(item.texto_incidente) : (tipMap[rawTip] || rawTip);

  const priority = item.priority ?? item.prioridad;
  if (priority !== "P0" && priority !== "P1" && priority !== "P2" && priority !== "P3") return null;

  const caller = String(
    item.caller ||
    item.nombre_solicitante ||
    item.ciudadano ||
    "Identidad no suministrada"
  );

  const rawCoords =
    typeof item.coords === "object" && item.coords !== null
      ? item.coords as Record<string, unknown>
      : undefined;
  const lat = readFiniteNumber(item.ubicacion_lat ?? rawCoords?.lat);
  const lng = readFiniteNumber(item.ubicacion_lng ?? rawCoords?.lng);
  const accuracyM = readFiniteNumber(item.ubicacion_accuracy ?? rawCoords?.accuracyM);
  const coords = lat !== undefined && lng !== undefined
    ? { lat, lng, ...(accuracyM === undefined ? {} : { accuracyM }) }
    : undefined;
  const location = String(
    item.location ||
    item.direccion_texto ||
    item.ubicacion ||
    (coords ? `Lat: ${lat?.toFixed(4)}, Lng: ${lng?.toFixed(4)}` : "Ubicación no disponible")
  );

  const channel = String(item.channel || channelsList.join(" + ") || "Canal no especificado");
  const language = String(item.language || item.idioma || "");
  const wait = String(item.wait || item.espera || "");
  const waitSeconds = readFiniteNumber(item.waitSeconds ?? item.espera_segundos);
  const requiresLb = Boolean(item.requiresLb || channelsList.some((c) => c.toLowerCase().includes("lip")));

  const rawStatus = firstStringValue(item.status, item.estado);
  if (!rawStatus) return null;
  const normalizedStatus = rawStatus.toLowerCase();
  const status: DemandaItem["status"] | null = normalizedStatus.includes("despach")
    ? "Despachada"
    : normalizedStatus.includes("asig")
      ? "Asignada"
      : normalizedStatus.includes("encol") || normalizedStatus.includes("espera") ||
          normalizedStatus.includes("sin asignar")
        ? "Sin asignar"
        : null;
  if (!status) return null;

  const psapId = String(item.psapId || item.psap_id || "");
  const psapNombre = typeof item.psapNombre === "string" ? item.psapNombre : undefined;
  const agenteId = typeof item.agenteId === "string" ? item.agenteId : null;
  const salaId = typeof item.salaId === "string" ? item.salaId : (item.sala_id ? String(item.sala_id) : null);
  const token = typeof item.token === "string" ? item.token : null;
  const createdAt =
    typeof item.createdAt === "string" ? item.createdAt :
      typeof item.fecha_creacion === "string" ? item.fecha_creacion : "";
  const telemetry = item.telemetry as DemandaItem["telemetry"] | undefined;
  const medicalRecord =
    (item.medicalRecord || item.ficha_medica) as DemandaItem["medicalRecord"] | undefined;

  const dispatchInfo = item.dispatchInfo as DemandaItem["dispatchInfo"];
  const pictogramCode = typeof item.pictogramCode === "string"
    ? item.pictogramCode
    : typeof item.pictograma_tipificacion === "string" ? item.pictograma_tipificacion : undefined;

  return {
    id,
    priority,
    type,
    caller,
    channel,
    channels: channelsList,
    language,
    wait,
    waitSeconds,
    location,
    coords,
    requiresLse,
    requiresLb,
    status,
    psapId,
    psapNombre,
    agenteId,
    salaId,
    token,
    createdAt,
    telemetry,
    medicalRecord,
    dispatchInfo,
    pictogramCode,
  };
}

function normalizeEmergenciaToDemanda(emerg: Record<string, unknown>): DemandaItem | null {
  const rawId = firstStringValue(emerg.id, emerg.emergencia_id);
  if (!rawId) return null;
  const id = String(rawId);
  const canales = Array.isArray(emerg.channels)
    ? emerg.channels.map(String)
    : Array.isArray(emerg.canales_activos)
      ? emerg.canales_activos.map(String)
      : Array.isArray(emerg.preferred_channels)
        ? emerg.preferred_channels.map(String)
        : [];

  const requiresLse = Boolean(emerg.requiresLse) ||
    canales.some((c) => c.toLowerCase().includes("lse") || c.toLowerCase().includes("sign"));
  const requiresLb = Boolean(emerg.requiresLb) || canales.some((c) => c.toLowerCase().includes("lip"));

  const tip =
    typeof emerg.tipificacion === "object" && emerg.tipificacion !== null
      ? emerg.tipificacion as Record<string, unknown>
      : undefined;
  const typeName = firstStringValue(emerg.type, tip?.label, tip?.codigo, tip?.code);
  if (!typeName) return null;
  const pictogramCode = firstStringValue(emerg.pictogramCode, tip?.pictogram_id, tip?.codigo);

  const ubiValue = emerg.ubicacion_incidente ?? emerg.coords;
  const ubi =
    typeof ubiValue === "object" && ubiValue !== null
      ? ubiValue as Record<string, unknown>
      : undefined;
  const lat = readFiniteNumber(ubi?.lat);
  const lng = readFiniteNumber(ubi?.lng);
  const accuracyM = readFiniteNumber(ubi?.accuracy_m ?? ubi?.accuracyM);
  const coords = lat !== undefined && lng !== undefined
    ? { lat, lng, ...(accuracyM === undefined ? {} : { accuracyM }) }
    : undefined;

  const rawState = firstStringValue(emerg.status, emerg.estado)?.toLowerCase();
  if (!rawState) return null;
  const status: DemandaItem["status"] | null = rawState.includes("despach")
    ? "Despachada"
    : rawState.includes("asig")
      ? "Asignada"
      : rawState.includes("encol") || rawState.includes("espera") ||
          rawState.includes("sin asignar")
        ? "Sin asignar"
        : null;
  if (!status) return null;

  const rawPriority = emerg.priority ?? emerg.prioridad;
  if (rawPriority !== "P0" && rawPriority !== "P1" && rawPriority !== "P2" && rawPriority !== "P3") {
    return null;
  }
  const priority: DemandaItem["priority"] = rawPriority;
  const dispatchInfo = (emerg.dispatchInfo || emerg.despacho) as DemandaItem["dispatchInfo"];

  return {
    id,
    priority,
    type: String(typeName),
    caller: firstStringValue(emerg.caller, emerg.nombre_solicitante, emerg.ciudadano) ?? "Identidad no suministrada",
    channel: firstStringValue(emerg.channel) ?? (canales.join(" + ") || "Canal no especificado"),
    channels: canales,
    language: firstStringValue(emerg.language, emerg.idioma) ?? "",
    wait: firstStringValue(emerg.wait, emerg.espera) ?? "",
    waitSeconds: readFiniteNumber(emerg.waitSeconds ?? emerg.espera_segundos),
    location: firstStringValue(emerg.location, ubi?.address_text, emerg.direccion_texto) ??
      (coords ? `Lat: ${lat?.toFixed(4)}, Lng: ${lng?.toFixed(4)}` : "Ubicación no disponible"),
    coords,
    requiresLse,
    requiresLb,
    status,
    psapId: String(emerg.psapId || emerg.psap_id || ""),
    psapNombre: firstStringValue(emerg.psapNombre, emerg.psap_nombre),
    agenteId: typeof emerg.agenteId === "string"
      ? emerg.agenteId
      : typeof emerg.agente_id === "string" ? emerg.agente_id : null,
    salaId: typeof emerg.salaId === "string"
      ? emerg.salaId
      : typeof emerg.sala_id === "string" ? emerg.sala_id : null,
    token: typeof emerg.token === "string" ? emerg.token : null,
    createdAt: firstStringValue(emerg.createdAt, emerg.fecha_creacion) ?? "",
    pictogramCode,
    telemetry: emerg.telemetry as DemandaItem["telemetry"] | undefined,
    medicalRecord: (emerg.medicalRecord || emerg.ficha_medica) as DemandaItem["medicalRecord"] | undefined,
    dispatchInfo,
  };
}
