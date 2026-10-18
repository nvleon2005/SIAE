import { http, HttpResponse, passthrough } from "msw";

const mockUser = {
  id: "user-maria",
  correo_electronico: "maria@ejemplo.com",
  nombre_completo: "María López",
  hasPasskey: false,
};

function hasMockSession(request: Request) {
  return request.headers.get("cookie")?.includes("siae_session=mock-session") ?? false;
}

export const authHandlers = [
  http.get("/v1/auth/session", ({ request }) => hasMockSession(request)
    ? HttpResponse.json({ user: mockUser })
    : HttpResponse.json({ error: "no_session" }, { status: 401 })),

  http.post("/v1/auth/refresh", () => HttpResponse.json({ error: "no_session" }, { status: 401 })),

  http.post("/v1/auth/logout", () => new HttpResponse(null, { status: 204 })),

  http.post("/v1/auth/register", () => passthrough()),

  http.post("/v1/auth/login", () => passthrough()),

  http.post("/v1/auth/passkey/options", () => {
    return HttpResponse.json({
      challenge: btoa("mock-registration-challenge"),
      rp: { id: "siae.local", name: "SIAE" },
      user: {
        id: btoa("user-passkey"),
        name: "maria@ejemplo.com",
        displayName: "María López",
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "preferred",
      },
      timeout: 60000,
      attestation: "none",
    });
  }),

  http.post("/v1/auth/passkey/verify", () => {
    return HttpResponse.json({
      verified: true,
      access_token: "mock-jwt-token",
      refresh_token: "mock-refresh-token",
      expires_in: 900,
      hasPasskey: true,
    });
  }),

  http.post("/v1/auth/login-passkey/options", () => {
    return HttpResponse.json({
      challenge: btoa("mock-authentication-challenge"),
      allowCredentials: [],
      userVerification: "preferred",
      rpId: "siae.local",
    });
  }),

  http.post("/v1/auth/login-passkey/verify", () => {
    return HttpResponse.json({
      access_token: "mock-jwt-token",
      refresh_token: "mock-refresh-token",
      expires_in: 900,
      user: { id: "user-passkey", correo_electronico: "maria@ejemplo.com" },
    });
  }),
];
