import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe.serial("Consola de Despacho y Operadores PSAP (Fase 1)", () => {
  test.beforeEach(async ({ context }) => {
    // Autenticar como supervisor de guardia PSAP (con acceso autorizado a /admin)
    await context.addCookies([
      {
        name: "siae_token",
        value: "test-supervisor-jwt-token",
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
        value: "test-supervisor-jwt-token",
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

  test("1. Carga la consola de despacho con telemetría viva y datos médicos", async ({ page }) => {
    await page.goto("/admin");

    // Verificar cabecera institucional
    await expect(page.getByRole("heading", { name: /centro de atención de emergencias/i })).toBeVisible();
    await expect(page.getByText(/consola despacho ven 911/i)).toBeVisible();

    // Verificar lista de demandas y selección
    const queueRegion = page.getByRole("region", { name: /sección de cola/i });
    await expect(queueRegion).toBeVisible();
    await expect(queueRegion.getByText(/DEM-2048/i)).toBeVisible();

    // Seleccionar demanda P0
    await queueRegion.getByText("DEM-2048").click();

    // Verificar telemetría satelital y dispositivo (cero hardcode)
    await expect(page.getByText(/telemetría satelital & dispositivo/i)).toBeVisible();
    await expect(page.getByText(/precisión gps satelital/i)).toBeVisible();
    await expect(page.getByText(/cuadrante de paz asignado/i)).toBeVisible();
    await expect(page.getByText(/batería/i)).toBeVisible();

    // Verificar ficha médica del alertante
    await expect(page.getByText(/ficha médica y perfil de accesibilidad/i)).toBeVisible();
    await expect(page.getByText(/grupo sanguíneo/i)).toBeVisible();
    await expect(page.getByText(/alergias conocidas/i)).toBeVisible();
  });

  test("2. Ejecuta el flujo de Despacho a Entes con modal interactivo", async ({ page }) => {
    await page.goto("/admin");

    // Seleccionar demanda en la cola
    const queueRegion = page.getByRole("region", { name: /sección de cola/i });
    await queueRegion.getByText("DEM-2048").click();

    // Tomar la demanda primero para habilitar despacho o usar despacho directo
    const tomarBtn = page.getByRole("button", { name: /tomar demanda/i });
    if (await tomarBtn.isVisible()) {
      await tomarBtn.click();
    }

    // Abrir modal de despacho
    const dispatchBtn = page.getByRole("button", { name: /despachar a entes|despacho directo/i });
    await expect(dispatchBtn).toBeVisible();
    await dispatchBtn.click();

    // Verificar diálogo accesible con foco atrapado
    const modal = page.getByRole("dialog", { name: /despacho a entes/i });
    await expect(modal).toBeVisible();

    // Verificar opciones de entes disponibles
    await expect(modal.getByText(/patrulla pnb/i)).toBeVisible();
    await expect(modal.getByText(/unidad médica/i)).toBeVisible();
    await expect(modal.getByText(/cuadrilla autobomba/i)).toBeVisible();

    // Añadir nota operativa de despacho
    const notesInput = modal.getByPlaceholder(/alertante con movilidad reducida/i);
    await notesInput.fill("Unidad de rescate requerida en planta baja. Portón abierto.");

    // Confirmar orden de despacho
    const confirmBtn = modal.getByRole("button", { name: /confirmar despacho/i });
    await confirmBtn.click();

    // Verificar que el modal se cierra y la demanda muestra estado despachada
    await expect(modal).not.toBeVisible();
    await expect(page.getByText(/🚨 despachada/i)).toBeVisible();
    await expect(page.getByText(/cuadrillas en ruta/i)).toBeVisible();
  });

  test("3. Captura visual (Visual Testing Snapshot) de la consola de despacho", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/admin");

    // Tomar captura de pantalla de alta densidad
    await page.screenshot({
      path: "test-results/dispatch-console-desktop.png",
      fullPage: true,
    });
  });

  test("4. Cumplimiento estricto de Accesibilidad WCAG 2.1 AA en consola PSAP", async ({ page }) => {
    test.setTimeout(60000);
    await page.goto("/admin");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, "Violaciones de accesibilidad en /admin").toEqual([]);
  });

  test("5. Blindaje RBAC: Supervisor no puede acceder a /admin/usuarios", async ({ page }) => {
    await page.goto("/admin/usuarios");

    // Debe ser redirigido de vuelta a /admin por el middleware o guard
    await page.waitForURL("**/admin");
    expect(page.url()).toContain("/admin");
    expect(page.url()).not.toContain("/admin/usuarios");
  });

  test("6. Fase 3: Monitor de ETAs vivos y acción 'Marcar en sitio' sincronizada", async ({ page, context }) => {
    test.setTimeout(60000);
    await page.goto("/admin");

    const queueRegion = page.getByRole("region", { name: /sección de cola/i });
    await queueRegion.getByText("DEM-2048").click();

    // Despacho directo si está disponible
    const dispatchBtn = page.getByRole("button", { name: /despachar a entes|despacho directo/i });
    await expect(dispatchBtn).toBeVisible();
    await dispatchBtn.click();

    const modal = page.getByRole("dialog", { name: /despacho a entes/i });
    await expect(modal).toBeVisible();

    const confirmBtn = modal.getByRole("button", { name: /confirmar despacho/i });
    await confirmBtn.click();

    // Comprobar que el monitor reactivo de cuadrillas en ruta está activo
    await expect(page.getByText(/cuadrillas en ruta/i)).toBeVisible();
    await expect(page.getByRole("progressbar").first()).toBeVisible();

    // Marcar en sitio
    const markArrivedBtn = page.getByRole("button", { name: /marcar en sitio/i }).first();
    await expect(markArrivedBtn).toBeVisible();
    await markArrivedBtn.click();

    // Comprobar que el badge cambia a "En sitio"
    await expect(page.getByText(/en sitio/i).first()).toBeVisible();

    // Verificar en la sala del alertante (/sala/DEM-2048)
    const citizenPage = await context.newPage();
    await citizenPage.goto("/sala/DEM-2048?role=ciudadano");

    // Debe mostrar el monitor de unidades despachadas
    await expect(citizenPage.getByRole("region", { name: /seguimiento de unidades despachadas/i })).toBeVisible({ timeout: 10000 });
    await citizenPage.close();
  });
});
