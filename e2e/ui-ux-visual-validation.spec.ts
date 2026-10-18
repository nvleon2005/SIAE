import { test } from "@playwright/test";

test.describe.serial("Validaciones Visuales UI/UX - Consola de Despacho PSAP", () => {
  test.beforeEach(async ({ context }) => {
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

  test("1. Captura Modo Claro Desktop (1440x900)", async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    // Seleccionar demanda DEM-2048 para desplegar telemetría completa
    const queueRegion = page.getByRole("region", { name: /sección de cola/i });
    await queueRegion.getByText("DEM-2048").click();

    await page.screenshot({
      path: "test-results/ui-ux-01-desktop-light.png",
      fullPage: true,
    });
  });

  test("2. Captura Modal de Despacho a Entes Abierto", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    const queueRegion = page.getByRole("region", { name: /sección de cola/i });
    await queueRegion.getByText("DEM-2048").click();

    // Abrir modal de despacho
    const dispatchBtn = page.getByRole("button", { name: /despachar a entes|despacho directo/i });
    await dispatchBtn.click();

    const modal = page.getByRole("dialog", { name: /despacho a entes/i });
    await modal.waitFor({ state: "visible" });

    // Seleccionar bomberos y ambulancia para mostrar múltiples entes
    const bomberosBtn = modal.getByRole("button", { name: /cuadrilla autobomba/i });
    await bomberosBtn.click();

    // Llenar notas operativas
    const notesInput = modal.getByPlaceholder(/alertante con movilidad reducida/i);
    await notesInput.fill("Rescate y soporte de vía aérea urgente. Cuadrilla bomberil y unidad médica en camino.");

    await page.screenshot({
      path: "test-results/ui-ux-02-modal-despacho-entes.png",
      fullPage: true,
    });
  });

  test("3. Captura Estado Despachada con Cuadrillas en Ruta", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    const queueRegion = page.getByRole("region", { name: /sección de cola/i });
    await queueRegion.getByText("DEM-2048").click();

    // Despachar
    const dispatchBtn = page.getByRole("button", { name: /despachar a entes|despacho directo/i });
    await dispatchBtn.click();

    const modal = page.getByRole("dialog", { name: /despacho a entes/i });
    await modal.waitFor({ state: "visible" });

    const confirmBtn = modal.getByRole("button", { name: /confirmar despacho/i });
    await confirmBtn.click();

    await modal.waitFor({ state: "hidden" });
    await page.getByText(/🚨 despachada/i).first().waitFor({ state: "visible" });

    await page.screenshot({
      path: "test-results/ui-ux-03-estado-despachada.png",
      fullPage: true,
    });
  });

  test("4. Captura Modo Oscuro Desktop (Dark Theme)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Conmutar a modo oscuro mediante botón de tema en header o clase dark en html
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });

    const queueRegion = page.getByRole("region", { name: /sección de cola/i });
    await queueRegion.getByText("DEM-2048").click();

    await page.screenshot({
      path: "test-results/ui-ux-04-desktop-dark.png",
      fullPage: true,
    });
  });

  test("5. Captura Vista Móvil Responsiva (390x844)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    await page.screenshot({
      path: "test-results/ui-ux-05-mobile-responsive.png",
      fullPage: true,
    });
  });
});
