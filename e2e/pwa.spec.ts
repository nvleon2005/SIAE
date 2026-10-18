import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("el manifest expone shortcuts de emergencia y Camino Seguro", async ({ page }) => {
  await page.goto("/");
  const manifestResponse = await page.request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBeTruthy();
  const manifest = await manifestResponse.json();

  expect(manifest.display).toBe("standalone");
  expect(manifest.shortcuts.map((shortcut: { url: string }) => shortcut.url)).toEqual(
    expect.arrayContaining(["/?action=emergency", "/camino-seguro"]),
  );
});

test("la página offline conserva una acción para volver a la Home", async ({ page }) => {
  await page.goto("/offline");
  await expect(page.getByRole("heading", { name: /sin conexión/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /volver a la home/i })).toHaveAttribute("href", "/");
});

test("Camino Seguro permite activar y confirmar que el usuario está bien", async ({ page }) => {
  await page.goto("/camino-seguro");
  await page.getByRole("radio", { name: "30 minutos" }).check();
  await page.getByRole("button", { name: /activar camino seguro/i }).click();

  await expect(page.getByRole("heading", { name: /camino seguro activo/i })).toBeVisible();
  await expect(page.getByRole("timer")).toContainText(/(30:00|29:5\d)/);
  await page.getByRole("button", { name: /estoy bien/i }).click();
  await expect(page.getByRole("button", { name: /activar camino seguro/i })).toBeVisible();
});

test("las rutas públicas del ciudadano no tienen violaciones axe", async ({ page }) => {
  test.setTimeout(120000);
  for (const route of [
    "/",
    "/onboarding",
    "/tipificar",
    "/ubicacion",
    "/confirmar",
    "/login",
    "/register",
    "/perfil",
    "/ajustes",
    "/offline",
    "/camino-seguro",
    "/historial",
    "/dashboard",
    "/admin",
  ]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, `Violaciones axe en ${route}`).toEqual([]);
  }
});

test("mantiene reflow y foco visible en móvil con escalas grandes", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/perfil?tab=accesibilidad");

  const textScale = page.getByLabel("Tamaño de texto");
  for (const scale of ["1.5", "2"]) {
    await textScale.evaluate((el: HTMLInputElement, val: string) => {
      el.value = val;
      el.dispatchEvent(new Event("change", { bubbles: true }));
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }, scale);
    const layout = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      contentWidth: document.documentElement.scrollWidth,
    }));
    expect(layout.contentWidth, `desbordamiento con escala ${scale}`).toBeLessThanOrEqual(layout.viewportWidth + 2);
  }

  const resetButton = page.getByRole("button", { name: /restablecer accesibilidad/i });
  await resetButton.focus();
  await expect(resetButton).toBeFocused();
  await expect(resetButton).toHaveCSS("outline-style", "solid");
});

test("permite completar acciones críticas con teclado", async ({ page }) => {
  await page.goto("/tipificar");
  const medicalButton = page.getByRole("button", { name: "Médico" });
  await medicalButton.focus();
  await medicalButton.press("Enter");
  await expect(page.getByRole("heading", { name: /qué tipo de problema médico/i })).toBeVisible();

  const cardiacButton = page.getByRole("button", { name: "Corazón" });
  await cardiacButton.focus();
  await cardiacButton.press("Enter");
  await expect(page.getByRole("button", { name: /continuar/i })).toBeVisible();

});

test("flujo crítico online crea una emergencia desde tipificación", async ({ page, context }) => {
  await page.route("**/v1/emergencias", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        id: "emerg-e2e-online",
        estado: "creada",
        psap_id: "psap-monagas",
        sala: {
          id: "sala-e2e-online",
          token: "mock-token",
          url_websocket: "wss://mock.local/v1/salas/stream",
          expires_in_s: 300,
        },
      }),
    });
  });
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 9.7489, longitude: -63.1798, accuracy: 12 });
  await page.goto("/tipificar");
  await page.getByRole("button", { name: "Médico" }).click();
  await page.getByRole("button", { name: "Corazón" }).click();
  await page.getByRole("button", { name: /continuar/i }).click();
  await expect(page).toHaveURL(/\/ubicacion$/);
  await expect(page.getByText(/9\.7489/)).toBeVisible();
  await page.getByRole("button", { name: /continuar/i }).click();
  await expect(page).toHaveURL(/\/confirmar$/);
  await page.getByRole("button", { name: /enviar emergencia/i }).click();
  await expect(page.getByText("ACTIVANDO...", { exact: true })).toBeVisible();
  await expect(page.getByText("En cola", { exact: true })).toBeVisible({ timeout: 12000 });
});

test("flujo crítico offline encola la emergencia", async ({ page, context }) => {
  await page.route("**/v1/emergencias", async (route) => {
    await route.abort("failed");
  });
  await page.goto("/ubicacion");
  await expect(page.getByRole("heading", { name: /dónde estás/i })).toBeVisible();
  await page.getByRole("button", { name: /casa/i }).click();
  await page.getByRole("button", { name: /continuar/i }).click();
  await expect(page).toHaveURL(/\/confirmar$/);
  await context.setOffline(true);
  await page.getByRole("button", { name: /enviar emergencia/i }).click();
  await expect(page.getByText("En cola", { exact: true })).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("EN COLA", { exact: true })).toBeVisible();
  await context.setOffline(false);
});

test("ubicación permite seleccionar puntos de referencia (POI) de Maturín", async ({ page }) => {
  await page.goto("/ubicacion");
  await expect(page.getByText(/Puntos de referencia conocidos \(Maturín\)/i)).toBeVisible();

  const juanaButton = page.getByRole("button", { name: /Redoma Juana la Avanzadora/i });
  await expect(juanaButton).toBeVisible();
  await juanaButton.click();
  await expect(juanaButton).toHaveAttribute("aria-pressed", "true");

  const addressInput = page.getByLabel(/Dirección o punto de referencia/i);
  await expect(addressInput).toHaveValue(/Av\. Bicentenario/i);
});

test("consola CInt LSV expone softphone tripartito accesible para intérpretes", async ({ page, context }) => {
  await context.addCookies([
    {
      name: "siae_token",
      value: "jwt-cint-interpreter-verified",
      domain: "localhost",
      path: "/",
    },
    {
      name: "siae_role",
      value: "interprete_lsv",
      domain: "localhost",
      path: "/",
    },
    {
      name: "siae_token",
      value: "jwt-cint-interpreter-verified",
      domain: "127.0.0.1",
      path: "/",
    },
    {
      name: "siae_role",
      value: "interprete_lsv",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await page.goto("/admin/cint");
  await expect(page.getByRole("heading", { name: /Consola CInt|Centro de Intermediación/i })).toBeVisible();
  await expect(page.getByRole("region", { name: /Video del ciudadano en Lengua de Señas/i })).toBeVisible();
  await expect(page.getByRole("region", { name: /Panel operativo y comunicación/i })).toBeVisible();
  await expect(page.getByRole("region", { name: /Subtítulos en vivo/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Cerrar Intervención/i })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations, "Violaciones axe en /admin/cint").toEqual([]);
});

