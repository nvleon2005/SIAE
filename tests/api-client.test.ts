import { apiRequest, ApiError } from "@/src/lib/api";

describe("api client", () => {
  it("serializes JSON requests and returns parsed payloads", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, user: { id: "u1" } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));

    vi.stubGlobal("fetch", fetchMock);

    const result = await apiRequest<{ user: { id: string } }>("/v1/auth/login", {
      method: "POST",
      body: { correo_electronico: "maria@ejemplo.com", password: "secret" },
    });

    expect(fetchMock).toHaveBeenCalledWith("/v1/auth/login", expect.objectContaining({
      method: "POST",
      credentials: "include",
      headers: expect.objectContaining({ "Content-Type": "application/json" }),
      body: JSON.stringify({ correo_electronico: "maria@ejemplo.com", password: "secret" }),
    }));
    expect(result.user.id).toBe("u1");
  });

  it("throws an ApiError with the server status for failed requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: "INVALID_CREDENTIALS", message: "Credenciales inválidas" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }));

    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("/v1/auth/login", { method: "POST" })).rejects.toBeInstanceOf(ApiError);
    await expect(apiRequest("/v1/auth/login", { method: "POST" })).rejects.toMatchObject({
      status: 401,
      code: "INVALID_CREDENTIALS",
      message: "Credenciales inválidas",
    });
  });
});
