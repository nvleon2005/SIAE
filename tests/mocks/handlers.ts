import { http, HttpResponse } from "msw";

const emergencyIdempotency = new Map<string, { payload: string; response: Record<string, unknown> }>();

let mockRemoteProfile: Record<string, unknown> = {
  id: "user-1",
  display_name: "María López",
  preferred_locale: "es",
  disabilities: [],
  preferred_channels: ["voz", "rtt"],
  preferred_sign_language: null,
  addresses: [
    { id: "home", label: "Casa", address_text: "Av. Bolívar c/c Calle Monagas, Maturín, Edo. Monagas" },
    { id: "work", label: "Trabajo", address_text: "Av. Alirio Ugarte Pelayo, Maturín, Edo. Monagas" },
  ],
  emergency_contacts: [
    { id: "juan", name: "Juan", phone: "+584141234567", relation: "Hijo" },
    { id: "carmen", name: "Carmen", phone: "+584249876543", relation: "Esposa" },
  ],
  accessibility_settings: {
    font_scale: 1,
    theme: "light",
    reduced_motion: false,
    pictograms_only: false,
    long_press_seconds: 1,
  },
  updated_at: new Date().toISOString(),
};

let mockDemandas = [
  {
    id: "DEM-2048",
    priority: "P0",
    type: "Médico · Dolor torácico",
    caller: "María L.",
    channel: "LSE + RTT",
    channels: ["video_sign_lse", "rtt"],
    language: "es",
    wait: "00:08",
    waitSeconds: 8,
    location: "Caracas Norte",
    coords: { lat: 10.5067, lng: -66.9186, accuracyM: 10 },
    requiresLse: true,
    requiresLb: false,
    status: "Sin asignar",
    psapId: "psap-caracas",
    psapNombre: "VEN 911 Caracas",
    agenteId: null as string | null,
    salaId: "SALA-2048",
    token: "mock-token-2048",
    createdAt: new Date().toISOString(),
  },
  {
    id: "DEM-2049",
    priority: "P1",
    type: "Accidente vial",
    caller: "Anónimo",
    channel: "Voz",
    channels: ["voz"],
    language: "es-419",
    wait: "00:14",
    waitSeconds: 14,
    location: "Valencia",
    coords: { lat: 10.18, lng: -67.998, accuracyM: 25 },
    requiresLse: false,
    requiresLb: false,
    status: "Sin asignar",
    psapId: "psap-caracas",
    psapNombre: "VEN 911 Caracas",
    agenteId: null as string | null,
    salaId: "SALA-2049",
    token: "mock-token-2049",
    createdAt: new Date().toISOString(),
  },
];

export const emergencyHandlers = [
  http.post("/v1/camino-seguro/:id/tick", async ({ params, request }) => HttpResponse.json({
    camino_seguro_id: params.id,
    recibido: true,
    payload: await request.json(),
  }, { status: 201 })),

  http.post("/v1/push/subscribe", () => HttpResponse.json({ ok: true })),
  http.delete("/v1/push/subscribe", () => HttpResponse.json({ ok: true })),

  http.post("/v1/salas/:id/join", ({ params }) => HttpResponse.json({
    sala_id: params.id,
    token: "mock-livekit-token",
    server_url: "wss://mock.livekit.cloud",
  })),

  http.post("/v1/salas/:id/unirse", ({ params }) => HttpResponse.json({
    sala_id: params.id,
    token: "mock-livekit-token",
    server_url: "wss://mock.livekit.cloud",
  })),

  http.post("/v1/emergencias", async ({ request }) => {
    const payload = await request.json();
    const requestRecord = typeof payload === "object" && payload !== null
      ? payload as Record<string, unknown>
      : null;
    const clientRequestId = requestRecord?.client_request_id;

    if (typeof clientRequestId !== "string" || !clientRequestId) {
      return HttpResponse.json({ code: "INVALID_INPUT", message: "client_request_id es obligatorio" }, { status: 400 });
    }

    const serializedPayload = JSON.stringify(payload);
    const previous = emergencyIdempotency.get(clientRequestId);
    if (previous) {
      if (previous.payload !== serializedPayload) {
        return HttpResponse.json({ code: "IDEMPOTENT_CONFLICT", message: "client_request_id ya fue usado con otro payload" }, { status: 409 });
      }
      return HttpResponse.json(previous.response, { status: 200 });
    }

    const perfil = requestRecord?.perfil_ciudadano as {
      nombre?: string;
      discapacidades?: string[];
      requiere_lsv?: boolean;
      prioridad_sugerida?: string;
    } | undefined;

    const hasDisabilities = Array.isArray(perfil?.discapacidades) && perfil.discapacidades.length > 0;
    const priority = perfil?.prioridad_sugerida === "P0" || hasDisabilities ? "P0" : "P1";
    const requiresLse = Boolean(perfil?.requiere_lsv);

    const response = {
      id: "emerg-" + clientRequestId,
      estado: "creada",
      psap_id: "psap-monagas",
      sala: {
        id: "sala-" + crypto.randomUUID(),
        token: "mock-jwt-token",
        url_websocket: "wss://mock.local/v1/salas/stream",
        expires_in_s: 300,
      },
      payload,
      fecha_creacion: new Date().toISOString(),
    };

    mockDemandas.unshift({
      id: "DEM-" + clientRequestId.slice(0, 8),
      priority,
      type: (requestRecord?.tipificacion as { label?: string })?.label || "Emergencia activada",
      caller: perfil?.nombre || "Ciudadano",
      channel: requiresLse ? "LSV + RTT" : "Voz / RTT",
      channels: (requestRecord?.preferred_channels as string[]) || ["rtt", "video", "voz"],
      language: "es",
      wait: "00:01",
      waitSeconds: 1,
      location: "Maturín (Monagas)",
      coords: { lat: 9.7489, lng: -63.1798, accuracyM: 10 },
      requiresLse,
      requiresLb: false,
      status: "Sin asignar",
      psapId: "psap-monagas",
      psapNombre: "VEN 911 Maturín (Monagas)",
      agenteId: null,
      salaId: response.sala.id,
      token: response.sala.token,
      createdAt: new Date().toISOString(),
    });

    emergencyIdempotency.set(clientRequestId, { payload: serializedPayload, response });
    return HttpResponse.json(response, { status: 201 });
  }),

  http.get("/v1/psap/lookup", ({ request }) => {
    const url = new URL(request.url);
    const lat = Number(url.searchParams.get("lat"));
    const lng = Number(url.searchParams.get("lng"));

    return HttpResponse.json(
      {
        psap_id: "psap-monagas",
        psap_nombre: "VEN 911 Maturín (Monagas)",
        soporta_lse: true,
        soporta_lsc: false,
        soporta_pictogramas: true,
        lat: lat || 9.7489,
        lng: lng || -63.1798,
        ttl: new Date(Date.now() + 86400000).toISOString(),
      },
      { status: 200 },
    );
  }),

  http.get("/v1/psap", () => HttpResponse.json({
    psaps: [
      {
        id: "psap-monagas",
        nombre: "VEN 911 Maturín (Monagas)",
        pais: "VE",
        telefono_principal: "+58 911",
        soporta_lse: true,
        soporta_lsc: false,
        soporta_pictogramas: true,
      },
      {
        id: "psap-caracas",
        nombre: "VEN 911 Caracas",
        pais: "VE",
        telefono_principal: "+58 911",
        soporta_lse: true,
        soporta_lsc: false,
        soporta_pictogramas: true,
      },
      {
        id: "psap-zulia",
        nombre: "VEN 911 Zulia",
        pais: "VE",
        telefono_principal: "+58 911",
        soporta_lse: false,
        soporta_lsc: false,
        soporta_pictogramas: true,
      },
    ],
  })),

  http.post("/v1/psap/resolve", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const lat = Number(body.lat);
    const lng = Number(body.lng);

    return HttpResponse.json({
      id: "psap-monagas",
      nombre: "VEN 911 Maturín (Monagas)",
      pais: "VE",
      telefono_principal: "+58 911",
      lat: lat || 9.7489,
      lng: lng || -63.1798,
      soporta_lse: true,
      soporta_lsc: false,
      soporta_pictogramas: true,
    });
  }),

  http.get("/v1/emergencias", () => HttpResponse.json({
    emergencias: mockDemandas,
  })),

  http.patch("/v1/emergencias/:id", async ({ params, request }) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    return HttpResponse.json({
      id: params.id,
      estado: body.estado || "asignada",
      agente_id: body.agente_id || "Operador 14",
    });
  }),
];

export function resetMockDemandas() {
  mockDemandas = [
    {
      id: "DEM-2048",
      priority: "P0",
      type: "Médico · Dolor torácico",
      caller: "María L.",
      channel: "LSE + RTT",
      channels: ["video_sign_lse", "rtt"],
      language: "es",
      wait: "00:08",
      waitSeconds: 8,
      location: "Caracas Norte",
      coords: { lat: 10.5067, lng: -66.9186, accuracyM: 10 },
      requiresLse: true,
      requiresLb: false,
      status: "Sin asignar",
      psapId: "psap-caracas",
      psapNombre: "VEN 911 Caracas",
      agenteId: null as string | null,
      salaId: "SALA-2048",
      token: "mock-token-2048",
      createdAt: new Date().toISOString(),
    },
    {
      id: "DEM-2049",
      priority: "P1",
      type: "Accidente vial",
      caller: "Anónimo",
      channel: "Voz",
      channels: ["voz"],
      language: "es-419",
      wait: "00:14",
      waitSeconds: 14,
      location: "Valencia",
      coords: { lat: 10.18, lng: -67.998, accuracyM: 25 },
      requiresLse: false,
      requiresLb: false,
      status: "Sin asignar",
      psapId: "psap-caracas",
      psapNombre: "VEN 911 Caracas",
      agenteId: null as string | null,
      salaId: "SALA-2049",
      token: "mock-token-2049",
      createdAt: new Date().toISOString(),
    },
  ];
}

export const psapHandlers = [
  http.get("/v1/psap/demandas", () => HttpResponse.json({
    demandas: mockDemandas,
  })),

  http.post("/v1/psap/demandas/:id/asignar", async ({ params, request }) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const agenteId = (body.agente_id as string) || "Operador 14";
    const found = mockDemandas.find((d) => d.id === params.id);
    if (found) {
      found.status = "Asignada";
      found.agenteId = agenteId;
    }
    return HttpResponse.json({
      id: params.id,
      status: "Asignada",
      agenteId,
      salaId: `SALA-${params.id}`,
      token: `token-${params.id}`,
    });
  }),

  http.post("/v1/psap/demandas/:id/liberar", ({ params }) => {
    const found = mockDemandas.find((d) => d.id === params.id);
    if (found) {
      found.status = "Sin asignar";
      found.agenteId = null;
    }
    return HttpResponse.json({
      id: params.id,
      status: "Sin asignar",
      agenteId: null,
    });
  }),
];

export const authHandlers = [
  http.post("/v1/auth/login", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const email = (body.correo_electronico || body.username || "maria@ejemplo.com") as string;
    const password = body.password as string;

    if (password === "wrong-password") {
      return HttpResponse.json({ error: "credenciales_invalidas", message: "Credenciales incorrectas" }, { status: 401 });
    }

    return HttpResponse.json({
      access_token: "mock-jwt-token",
      token: "mock-jwt-token",
      token_type: "Bearer",
      expires_in: 900,
      user: {
        id: "user-1",
        correo_electronico: email,
        nombre_completo: "María López",
        role: "solicitante",
        hasPasskey: false,
      },
    }, {
      headers: {
        "Set-Cookie": "siae_session=mock-session; Path=/; HttpOnly; SameSite=Lax",
      },
    });
  }),

  http.post("/v1/auth/register", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const email = (body.correo_electronico || body.username || "nuevo@ejemplo.com") as string;
    const name = (body.nombre_completo || "Usuario Nuevo") as string;

    return HttpResponse.json({
      id: "user-" + crypto.randomUUID(),
      access_token: "mock-jwt-token",
      token: "mock-jwt-token",
      user: {
        id: "user-" + crypto.randomUUID(),
        correo_electronico: email,
        nombre_completo: name,
        role: "solicitante",
        hasPasskey: false,
      },
    }, { status: 201 });
  }),

  http.get("/v1/auth/session", () => HttpResponse.json({
    user: {
      id: "user-1",
      correo_electronico: "maria@ejemplo.com",
      nombre_completo: "María López",
      role: "solicitante",
      hasPasskey: false,
    },
  })),

  http.post("/v1/auth/refresh", () => HttpResponse.json({
    access_token: "mock-refreshed-token",
    token: "mock-refreshed-token",
    user: {
      id: "user-1",
      correo_electronico: "maria@ejemplo.com",
      nombre_completo: "María López",
      role: "solicitante",
      hasPasskey: false,
    },
  })),

  http.post("/v1/auth/logout", () => HttpResponse.json({ ok: true }, {
    headers: {
      "Set-Cookie": "siae_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    },
  })),

  http.post("/v1/auth/passkey/options", () => HttpResponse.json({
    challenge: "mock-challenge",
    rp: { name: "SIAE", id: "localhost" },
    user: { id: "user-1", name: "maria@ejemplo.com", displayName: "María López" },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
  })),

  http.post("/v1/auth/passkey/verify", () => HttpResponse.json({ ok: true, verified: true })),

  http.post("/v1/auth/login-passkey/options", () => HttpResponse.json({
    challenge: "mock-login-challenge",
    rpId: "localhost",
  })),

  http.post("/v1/auth/login-passkey/verify", () => HttpResponse.json({
    access_token: "mock-jwt-token",
    token: "mock-jwt-token",
    user: {
      id: "user-passkey",
      correo_electronico: "maria@ejemplo.com",
      nombre_completo: "María López",
      hasPasskey: true,
    },
  })),

  http.get("/v1/perfiles/me", () => HttpResponse.json(mockRemoteProfile)),

  http.put("/v1/perfiles/me", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    mockRemoteProfile = {
      ...mockRemoteProfile,
      ...body,
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(mockRemoteProfile);
  }),

  http.post("/v1/perfiles/me/sync", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    if (body.perfil && typeof body.perfil === "object") {
      mockRemoteProfile = {
        ...mockRemoteProfile,
        ...(body.perfil as Record<string, unknown>),
        updated_at: new Date().toISOString(),
      };
    }
    return HttpResponse.json({
      exitoso: true,
      synced_at: new Date().toISOString(),
      perfil: mockRemoteProfile,
    });
  }),
];

export const handlers = [
  ...emergencyHandlers,
  ...psapHandlers,
  ...authHandlers,
];
