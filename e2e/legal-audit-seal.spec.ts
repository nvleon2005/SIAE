import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Fase 4: Auditoría Legal — Sellado Criptográfico SHA-256 y Descarga de Traza", () => {
  test.beforeEach(async ({ context }) => {
    // Autenticar como operador PSAP
    await context.addCookies([
      {
        name: "siae_token",
        value: "test-operator-jwt-token",
        domain: "localhost",
        path: "/",
      },
      {
        name: "siae_role",
        value: "supervisor",
        domain: "localhost",
        path: "/",
      },
      {
        name: "siae_token",
        value: "test-operator-jwt-token",
        domain: "127.0.0.1",
        path: "/",
      },
      {
        name: "siae_role",
        value: "supervisor",
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
  });

  test("1. Despliega el sello criptográfico SHA-256 en la consola PSAP (/admin) con descarga de acta", async ({ page }) => {
    await page.goto("/admin");

    // Seleccionar la demanda DEM-2048
    const queueRegion = page.getByRole("region", { name: /sección de cola/i });
    await expect(queueRegion).toBeVisible();
    await queueRegion.getByText("DEM-2048").click();

    // Localizar el sello criptográfico
    const sealRegion = page.getByRole("region", { name: /sello criptográfico de auditoría legal/i });
    await expect(sealRegion).toBeVisible();

    // Validar cabecera y estatus inalterable
    await expect(sealRegion.getByText(/sellado criptográfico sha-256/i)).toBeVisible();
    await expect(sealRegion.getByText(/integridad inalterable/i)).toBeVisible();

    // Validar presencia del hash SHA-256 (64 hex characters)
    const codeEl = sealRegion.locator("code");
    await expect(codeEl).toBeVisible();
    const hashText = await codeEl.textContent();
    expect(hashText?.trim().length).toBe(64);
    expect(/^[0-9a-f]{64}$/.test(hashText?.trim() || "")).toBe(true);

    // Validar y capturar evento de descarga del acta forense JSON
    const downloadPromise = page.waitForEvent("download");
    const downloadBtn = sealRegion.getByRole("button", { name: /descargar acta forense/i });
    await expect(downloadBtn).toBeVisible();
    await downloadBtn.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("siae_acta_forense_DEM-2048.json");
  });

  test("2. Cumplimiento estricto de accesibilidad WCAG 2.1 AA en el sello criptográfico", async ({ page }) => {
    await page.goto("/admin");
    const queueRegion = page.getByRole("region", { name: /sección de cola/i });
    await queueRegion.getByText("DEM-2048").click();

    const sealRegion = page.getByRole("region", { name: /sello criptográfico de auditoría legal/i });
    await expect(sealRegion).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include('[aria-label="Sello criptográfico de auditoría legal"]')
      .analyze();

    expect(results.violations, "Violaciones de accesibilidad en el sello criptográfico").toEqual([]);
  });

  test("3. Despliega el sello forense y descarga en el portal de historial del alertante (/historial)", async ({ page }) => {
    await page.goto("/historial");

    // Seleccionar la emergencia EM-2048
    const itemBtn = page.getByRole("button", { name: /ver detalle de em-2048/i });
    await expect(itemBtn).toBeVisible();
    await itemBtn.click();

    // Drawer de detalle abierto
    await expect(page.getByRole("heading", { name: /em-2048 · caída en la calle/i })).toBeVisible();

    // Sello criptográfico presente en el drawer
    const sealRegion = page.getByRole("region", { name: /sello criptográfico de auditoría legal/i });
    await expect(sealRegion).toBeVisible();
    await expect(sealRegion.getByText(/sellado criptográfico sha-256/i)).toBeVisible();

    // Descarga del acta para el ciudadano
    const downloadPromise = page.waitForEvent("download");
    const downloadBtn = sealRegion.getByRole("button", { name: /descargar acta forense/i });
    await downloadBtn.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("siae_acta_forense_EM-2048.json");
  });
});
