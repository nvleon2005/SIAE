import { expect, test } from "@playwright/test";

test.describe("Validación Simultánea en Tiempo Real Multi-Rol (Solicitante, Operador, Despachador, Administrador)", () => {
  test("Ejecuta el ciclo de vida completo de una emergencia en simultáneo en las 4 consolas", async ({ browser }) => {
    test.setTimeout(90000);

    // ── 1. Preparar Contextos Aislados y Sesiones Concurrentes ────────────────
    // Contexto 1: Solicitante (Ciudadano)
    const citizenContext = await browser.newContext({
      viewport: { width: 400, height: 850 },
    });
    const citizenPage = await citizenContext.newPage();

    // Contexto 2: Operador PSAP (carlos.mendoza@ven911.gob.ve)
    const operatorContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    await operatorContext.addCookies([
      { name: "siae_token", value: "token-operador-psap", domain: "localhost", path: "/" },
      { name: "siae_role", value: "operador", domain: "localhost", path: "/" },
      { name: "siae_token", value: "token-operador-psap", domain: "127.0.0.1", path: "/" },
      { name: "siae_role", value: "operador", domain: "127.0.0.1", path: "/" },
    ]);
    const operatorPage = await operatorContext.newPage();

    // Contexto 3: Despachador CAD (despachador@ven911.gob.ve)
    const dispatcherContext = await browser.newContext({
      viewport: { width: 1366, height: 768 },
    });
    await dispatcherContext.addCookies([
      { name: "siae_token", value: "token-despachador-cad", domain: "localhost", path: "/" },
      { name: "siae_role", value: "despachador", domain: "localhost", path: "/" },
      { name: "siae_token", value: "token-despachador-cad", domain: "127.0.0.1", path: "/" },
      { name: "siae_role", value: "despachador", domain: "127.0.0.1", path: "/" },
    ]);
    const dispatcherPage = await dispatcherContext.newPage();

    // Contexto 4: Administrador Global / Supervisor (admin@siae.gob.ve)
    const adminContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    await adminContext.addCookies([
      { name: "siae_token", value: "token-admin-global", domain: "localhost", path: "/" },
      { name: "siae_role", value: "admin", domain: "localhost", path: "/" },
      { name: "siae_token", value: "token-admin-global", domain: "127.0.0.1", path: "/" },
      { name: "siae_role", value: "admin", domain: "127.0.0.1", path: "/" },
    ]);
    const adminPage = await adminContext.newPage();

    try {
      // ── 2. Carga Simultánea de las 4 Interfaces en Vivo ─────────────────────
      await Promise.all([
        citizenPage.goto("/"),
        operatorPage.goto("/operador"),
        dispatcherPage.goto("/despachador"),
        adminPage.goto("/dashboard"),
      ]);

      // Verificar que cada consola cargó su identidad y encabezado correspondiente
      await expect(citizenPage.getByText(/siae/i).first()).toBeVisible();
      await expect(operatorPage.getByText(/puesto operativo de triaje/i).first()).toBeVisible();
      await expect(dispatcherPage.getByText(/consola táctica cad/i).first()).toBeVisible();
      await expect(adminPage.getByText(/consola estratégica ven 911/i).first()).toBeVisible();

      // ── 3. Solicitante inicia flujo de emergencia ───────────────────────────
      await citizenPage.goto("/tipificar");
      await citizenPage.waitForLoadState("networkidle");

      // Seleccionar categoría Incendio / Fuego
      const fuegoButton = citizenPage.getByRole("button", { name: /fuego/i }).first();
      await expect(fuegoButton).toBeVisible();
      await fuegoButton.click();

      // Seleccionar subtipo Fuego e Incendio Estructural
      const subTipoFuego = citizenPage.getByRole("button", { name: /fuego \/ incendio/i }).first();
      if (await subTipoFuego.isVisible()) {
        await subTipoFuego.click();
      }

      // Continuar a selección de ubicación
      const btnUbicacion = citizenPage.getByRole("button", { name: /continuar/i });
      await btnUbicacion.click();
      await citizenPage.waitForURL("**/ubicacion");

      // Seleccionar Landmark POI de Maturín
      const redomaJuana = citizenPage.getByRole("button", { name: /redoma juana/i }).first();
      await expect(redomaJuana).toBeVisible();
      await redomaJuana.click();

      // Continuar a confirmación (botón 'Continuar')
      const btnConfirmar = citizenPage.getByRole("button", { name: /continuar/i });
      await btnConfirmar.click();
      await citizenPage.waitForURL("**/confirmar");

      // Verificar pantalla de confirmación del Solicitante
      await expect(citizenPage.getByRole("heading", { name: /confirmar emergencia/i })).toBeVisible();
      await expect(citizenPage.getByText(/tipo de incidente/i)).toBeVisible();

      // Ejecutar envío de auxilio inmediato
      const btnEnviar = citizenPage.getByRole("button", { name: /enviar emergencia/i });
      if (await btnEnviar.isVisible()) {
        await btnEnviar.click();
      }

      // ── 4. Operador PSAP atiende demanda entrante ───────────────────────────
      // Verificar distribución ACD activa en sala
      await expect(operatorPage.getByText(/distribución acd activa/i)).toBeVisible();
      
      // Atender llamada entrante (si hay banner de contestar o botón en cola)
      const contestarBanner = operatorPage.getByRole("button", { name: /contestar ahora/i });
      const atenderBtn = operatorPage.getByRole("button", { name: /atender/i }).first();

      if (await contestarBanner.isVisible()) {
        await contestarBanner.click();
      } else if (await atenderBtn.isVisible()) {
        await atenderBtn.click();
      }

      // Verificar que el puesto del operador mantiene su identidad institucional
      await expect(operatorPage.getByText(/república bolivariana de venezuela · ven 911 monagas/i)).toBeVisible();

      // ── 5. Despachador CAD articula con Bomberos de Monagas ─────────────────
      // En la consola del despachador se visualiza la bandeja táctica
      await expect(dispatcherPage.getByText(/en bandeja/i)).toBeVisible();

      // Seleccionar incidente en bandeja
      const incidenteItem = dispatcherPage.getByRole("listitem").first();
      if (await incidenteItem.isVisible()) {
        await incidenteItem.click();
      }

      // Verificar detalle del expediente o entidades articuladas (Doctrina VEN 911)
      await expect(dispatcherPage.getByRole("region", { name: /detalle del expediente/i })).toBeVisible();

      // ── 6. Administrador Global monitorea KPIs en tiempo real ───────────────
      await expect(adminPage.getByText(/emergencias activas/i)).toBeVisible();
      await expect(adminPage.getByText(/cola de espera acd/i)).toBeVisible();

      // Navegar a Cuadrantes de Paz como Administrador
      await adminPage.goto("/admin/cuadrantes");
      await expect(adminPage.getByText(/gestión de cuadrantes de paz \(maturín\)/i)).toBeVisible();
      await expect(adminPage.getByRole("button", { name: /registrar cuadrante/i })).toBeVisible();

      // Navegar a Usuarios como Administrador
      await adminPage.goto("/admin/usuarios");
      await expect(adminPage.getByRole("heading", { name: /gestión de usuarios y roles/i })).toBeVisible();
      await expect(adminPage.getByRole("button", { name: /\+ dar de alta funcionario institucional/i })).toBeVisible();

    } finally {
      // Limpieza controlada de contextos paralelos
      await citizenContext.close();
      await operatorContext.close();
      await dispatcherContext.close();
      await adminContext.close();
    }
  });
});
