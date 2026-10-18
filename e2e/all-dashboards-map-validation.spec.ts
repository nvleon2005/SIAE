import { test, expect } from "@playwright/test";

test.describe("Validación Visual Rigurosa de Mapas en Todos los Dashboards", () => {
  test("1. Dashboard Despachador CAD (/despachador) - Mapa Táctico 100% Completo", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.context().addCookies([
      { name: "siae_token", value: "jwt-despachador-test", domain: "localhost", path: "/" },
      { name: "siae_role", value: "despachador", domain: "localhost", path: "/" },
    ]);

    await page.goto("/despachador");
    await page.waitForTimeout(2500);

    const mapCanvas = page.locator("#mapa canvas").first();
    await expect(mapCanvas).toBeVisible();

    // Medir dimensiones del canvas
    const box = await mapCanvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(400);
    expect(box!.height).toBeGreaterThan(350);

    // Captura de evidencia
    await page.screenshot({ path: "test-results/map_despachador_cad_full.png" });
  });

  test("2. Dashboard Supervisión & Métricas (/dashboard) - Mapa Táctico AVL Cuadrantes", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.context().addCookies([
      { name: "siae_token", value: "jwt-supervisor-test", domain: "localhost", path: "/" },
      { name: "siae_role", value: "supervisor", domain: "localhost", path: "/" },
    ]);

    await page.goto("/dashboard");
    await page.waitForTimeout(1500);

    // Click en la pestaña de Mapa de Emergencias
    const mapTab = page.getByRole("button", { name: /mapa de emergencias/i });
    await mapTab.click();
    await page.waitForTimeout(2500);

    const mapCanvas = page.locator("section[aria-label*='Geolocalización'] canvas").first();
    await expect(mapCanvas).toBeVisible();

    const box = await mapCanvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(500);
    expect(box!.height).toBeGreaterThan(450);

    await page.screenshot({ path: "test-results/map_dashboard_avl_full.png" });
  });

  test("3. Portal Ciudadano - Ubicación y Landmarks (/ubicacion)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/ubicacion");
    await page.waitForTimeout(1500);

    // Seleccionar punto de referencia Redoma Juana la Avanzadora
    const juanaBtn = page.getByRole("button", { name: /redoma juana la avanzadora/i });
    await juanaBtn.click();
    await page.waitForTimeout(2000);

    const mapCanvas = page.locator(".map-picker canvas").first();
    await expect(mapCanvas).toBeVisible();

    const box = await mapCanvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(300);
    expect(box!.height).toBeGreaterThan(200);

    await page.screenshot({ path: "test-results/map_ubicacion_ciudadano_full.png" });
  });

  test("4. Camino Seguro Ciudadano (/camino-seguro) - Monitoreo GPS en Vivo", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/camino-seguro");

    // Activar Camino Seguro
    await page.getByRole("radio", { name: "30 minutos" }).check();
    await page.getByRole("button", { name: /activar camino seguro/i }).click();
    await expect(page.getByRole("heading", { name: /camino seguro activo/i })).toBeVisible();
    await page.waitForTimeout(2000);

    const mapCanvas = page.locator(".maplibregl-canvas").first();
    await expect(mapCanvas).toBeVisible();

    const box = await mapCanvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(300);
    expect(box!.height).toBeGreaterThan(200);

    await page.screenshot({ path: "test-results/map_camino_seguro_full.png" });
  });
});
