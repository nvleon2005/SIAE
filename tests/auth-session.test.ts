import { restoreSession, useAuth } from "@/src/modules/auth/auth-store";

describe("auth session cookies", () => {
  beforeEach(() => {
    useAuth.getState().clearSession();
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("does not persist access or refresh tokens in browser storage", () => {
    useAuth.getState().setSession({
      id: "user-1",
      correo_electronico: "maria@ejemplo.com",
      nombre_completo: "María López",
    });

    expect(window.sessionStorage.length).toBe(0);
    expect(useAuth.getState()).not.toHaveProperty("accessToken");
    expect(useAuth.getState()).not.toHaveProperty("refreshToken");
  });

  it("refreshes the cookie session after a 401", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        user: {
          id: "user-1",
          correo_electronico: "maria@ejemplo.com",
          nombre_completo: "María López",
        },
      }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(restoreSession()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/v1/auth/session", { credentials: "include" });
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/v1/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    expect(useAuth.getState().isAuthenticated).toBe(true);
  });
});