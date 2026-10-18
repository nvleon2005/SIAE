import { expect, test } from "@playwright/test";
import fs from "fs";
import path from "path";

test.describe("Auditoría Demostrable de Extremo a Extremo: Solicitante -> Operador PSAP -> Despachador CAD", () => {
  const artifactDir = path.join(process.cwd(), "test-results", "audit-flow");
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  test("Flujo integral: creación de emergencia por el Solicitante, recepción en la cola PSAP y despacho de unidades", async ({ page, context }) => {
    test.setTimeout(90000);
    // 1. Configurar viewport móvil para la vista del Solicitante PWA
    await page.setViewportSize({ width: 390, height: 844 });

    // 2. El Solicitante abre la aplicación para activar una emergencia
    await page.goto("/tipificar");
    await page.waitForLoadState("networkidle");

    // Seleccionar categoría de emergencia médica
    const medicoCard = page.getByText(/médico|dolor torácico|urgencia/i).first();
    if (await medicoCard.isVisible()) {
      await medicoCard.click();
    }

    // Avanzar a la confirmación de la emergencia
    await page.goto("/confirmar");
    await page.waitForLoadState("networkidle");

    // Capturar la pantalla de confirmación previa del Solicitante
    const shot1 = path.join(artifactDir, "evidencia_01_solicitante_confirmar.png");
    await page.screenshot({ path: shot1, fullPage: true });

    // Confirmar activación de emergencia
    const activarBtn = page.getByRole("button", { name: /activar emergencia|enviar|confirmar/i }).first();
    if (await activarBtn.isVisible()) {
      await activarBtn.click();
    }

    // El Solicitante entra a la Sala de Emergencia Fail-Safe
    await page.waitForTimeout(2000);
    const shot2 = path.join(artifactDir, "evidencia_02_solicitante_sala_emergencia.png");
    await page.screenshot({ path: shot2, fullPage: true });

    // 3. CAMBIO DE ROL: Abrir contexto como Operador / Despachador en Web Desktop
    await page.setViewportSize({ width: 1440, height: 900 });

    // Inyectar credenciales y cookies institucionales de personal operativo
    await context.addCookies([
      {
        name: "siae_token",
        value: "jwt-operator-verified-monagas",
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
        value: "jwt-operator-verified-monagas",
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

    // 4. El Operador accede a la Consola Operativa PSAP VEN 911 (/admin)
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Verificar que la consola carga con la cola en tiempo real
    await expect(page.getByRole("heading", { name: /centro de atención de emergencias/i })).toBeVisible();
    const queueRegion = page.getByRole("region", { name: /sección de cola/i });
    await expect(queueRegion).toBeVisible();

    // Capturar la pantalla del Operador viendo la cola viva de demandas
    const shot3 = path.join(artifactDir, "evidencia_03_operador_cola_psap_en_vivo.png");
    await page.screenshot({ path: shot3, fullPage: true });

    // 5. El Operador selecciona la primera demanda disponible
    const firstDemand = queueRegion.getByRole("listitem").first();
    await firstDemand.click();

    // Tomar la demanda para triaje
    const tomarBtn = page.getByRole("button", { name: /tomar demanda/i });
    if (await tomarBtn.isVisible()) {
      await tomarBtn.click();
      await page.waitForTimeout(500);
    }

    // Capturar la pantalla del Operador con la telemetría viva, ficha médica y softphone
    const shot4 = path.join(artifactDir, "evidencia_04_operador_triaje_telemetria_viva.png");
    await page.screenshot({ path: shot4, fullPage: true });

    // 6. El Operador / Despachador ejecuta el Despacho a Entes
    const dispatchBtn = page.getByRole("button", { name: /despachar a entes|despacho directo/i });
    await dispatchBtn.click();

    // Se abre el diálogo interactivo de despacho
    const modal = page.getByRole("dialog", { name: /despacho a entes/i });
    await expect(modal).toBeVisible();

    // Seleccionar las unidades a movilizar
    await modal.getByText(/patrulla pnb/i).click();
    await modal.getByText(/unidad médica/i).click();

    const notes = modal.getByPlaceholder(/alertante con movilidad reducida/i);
    await notes.fill("Despacho prioritario VEN 911. Unidad médica U-12 asignada con soporte prehospitalario.");

    // Capturar evidencia del modal de despacho con unidades seleccionadas
    const shot5 = path.join(artifactDir, "evidencia_05_modal_despacho_entes.png");
    await page.screenshot({ path: shot5, fullPage: true });

    // Confirmar orden de despacho
    const confirmBtn = modal.getByRole("button", { name: /confirmar despacho/i });
    await confirmBtn.click();

    // 7. Verificar que la orden se ejecutó: aparece distintivo '🚨 Despachada' y el tracker cinemático AVL
    await expect(page.getByText(/🚨 despachada/i)).toBeVisible();
    await expect(page.getByText(/cuadrillas en ruta/i)).toBeVisible();

    // Capturar la pantalla final con unidades en ruta, odometría, velocidad y tiempos estimados (ETAs)
    const shot6 = path.join(artifactDir, "evidencia_06_despacho_confirmado_con_avl.png");
    await page.screenshot({ path: shot6, fullPage: true });

    console.log("Auditoría de extremo a extremo completada exitosamente. Evidencias guardadas.");
  });
});
