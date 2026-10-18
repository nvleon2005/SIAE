import nextConfig from "../next.config";

describe("security headers and network config", () => {
  it("declares transport, framing, permissions and CSP protections", async () => {
    const configuredHeaders = await nextConfig.headers?.();
    const headers = configuredHeaders?.[0]?.headers ?? [];
    const values = new Map(headers.map((header) => [header.key, header.value]));

    const csp = values.get("Content-Security-Policy") ?? "";
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("ws://127.0.0.1:8080");
    expect(csp).toContain("ws://127.0.0.1:7880");
    expect(csp).toContain("http://127.0.0.1:8080");

    expect(values.get("Strict-Transport-Security")).toContain("max-age=31536000");
    expect(values.get("Permissions-Policy")).toContain("usb=()");
    expect(values.get("X-Content-Type-Options")).toBe("nosniff");
    expect(values.get("X-Frame-Options")).toBe("DENY");
  });

  it("configures rewrites to route /v1/ requests to the backend gateway", async () => {
    const rewrites = await nextConfig.rewrites?.();
    const rewriteList = Array.isArray(rewrites) ? rewrites : rewrites?.beforeFiles ?? [];

    expect(rewriteList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/v1/salas/:id/unirse",
          destination: expect.stringContaining("/v1/salas/:id/join"),
        }),
        expect.objectContaining({
          source: expect.stringContaining("/v1/"),
          destination: expect.stringContaining("/v1/:path*"),
        }),
      ])
    );
  });
});