import { describe, it, expect } from "vitest";
import { POST as handleAuditManifest } from "@/app/v1/audit/manifest/route";
import { POST as handleRotateKeys, GET as handleGetKeys } from "@/app/v1/admin/keys/rotate/route";

describe("Rutas de auditoría y gestión de claves", () => {
  it("POST /v1/audit/manifest no certifica ni persiste manifiestos localmente", async () => {
    const response = await handleAuditManifest();
    expect(response.status).toBe(501);

    const body = await response.json();
    expect(body.code).toBe("AUDIT_SERVICE_UNAVAILABLE");
  });

  it("GET /v1/admin/keys/rotate reports that key management is unavailable", async () => {
    const response = await handleGetKeys();
    expect(response.status).toBe(501);

    const body = await response.json();
    expect(body.code).toBe("KEY_MANAGEMENT_UNAVAILABLE");
  });

  it("POST /v1/admin/keys/rotate does not claim to rotate keys locally", async () => {
    const response = await handleRotateKeys();
    expect(response.status).toBe(501);

    const body = await response.json();
    expect(body.code).toBe("KEY_MANAGEMENT_UNAVAILABLE");
  });
});
