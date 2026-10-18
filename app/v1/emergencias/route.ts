import { NextRequest, NextResponse } from "next/server";
import { backendFetch, getUserToken } from "@/lib/bff-helper";

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as JsonObject
    : null;
}

function firstString(...values: unknown[]): string | undefined {
  return values.find((value): value is string => typeof value === "string" && value.length > 0);
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === "string" && value.trim() === "") return undefined;
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(number) ? number : undefined;
}

export async function POST(request: NextRequest) {
  let body: JsonObject;
  try {
    const parsedBody = asObject(await request.json());
    if (!parsedBody) {
      return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
    }
    body = parsedBody;
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  const callerLocation = asObject(body.ubicacion_incidente) ?? asObject(body.ubicacion_usuario);
  const latitude = readNumber(callerLocation?.lat ?? body.ubicacion_lat);
  const longitude = readNumber(callerLocation?.lng ?? body.ubicacion_lng);
  if (
    latitude === undefined ||
    longitude === undefined ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return NextResponse.json(
      { error: "Se requiere una ubicación válida para crear la emergencia" },
      { status: 400 }
    );
  }

  const tipification = asObject(body.tipificacion);
  const channels = Array.isArray(body.preferred_channels)
    ? body.preferred_channels.filter((channel): channel is string => typeof channel === "string")
    : Array.isArray(body.canales_activos)
      ? body.canales_activos.filter((channel): channel is string => typeof channel === "string")
      : Array.isArray(body.canales_preferidos)
        ? body.canales_preferidos.filter((channel): channel is string => typeof channel === "string")
        : [];
  const accuracy = readNumber(callerLocation?.accuracy_m ?? body.ubicacion_accuracy);
  const backendPayload = {
    solicitud_id: body.client_request_id ?? body.solicitud_id,
    tipificacion_codigo: firstString(body.tipificacion_codigo, tipification?.code),
    tipificacion_pictograma: firstString(
      body.pictograma_tipificacion,
      body.tipificacion_pictograma,
      tipification?.pictogram_id
    ),
    ubicacion_lat: latitude,
    ubicacion_lng: longitude,
    ...(accuracy === undefined ? {} : { ubicacion_accuracy: accuracy }),
    afectado: body.afectado === "OTHER" || body.afectado === "otra_persona" ? "otra_persona" : "yo_mismo",
    descripcion_afectado: firstString(body.descripcion_afectado, body.texto_incidente),
    canales_preferidos: channels,
  };

  return backendFetch("/v1/emergencias", {
    method: "POST",
    body: backendPayload,
    token: await getUserToken(request),
    tag: "BFF /v1/emergencias POST",
    timeout: 4000,
  });
}

export async function GET(request: NextRequest) {
  return backendFetch(`/v1/emergencias${request.nextUrl.search}`, {
    token: await getUserToken(request),
    tag: "BFF /v1/emergencias GET",
    timeout: 3000,
  });
}
