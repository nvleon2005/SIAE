import { chromium } from '@playwright/test';

async function runLiveVisualDemo() {
  console.log('========================================================================');
  console.log('INICIANDO DEMOSTRACIÓN VISUAL EN VIVO: 3 CONSOLAS SIMULTÁNEAS EN PANTALLA');
  console.log('========================================================================\n');

  // Lanzar navegador visible (headless: false) con tiempo de visualización
  const browser = await chromium.launch({
    headless: false,
    slowMo: 400,
    args: ['--start-maximized']
  });

  // Contexto 1: Administrador Global
  const adminCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  await adminCtx.addCookies([
    { name: 'siae_token', value: 'admin-jwt-token', domain: 'localhost', path: '/' },
    { name: 'siae_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'siae_name', value: encodeURIComponent('Administrador SIAE'), domain: 'localhost', path: '/' }
  ]);
  const adminPage = await adminCtx.newPage();

  // Contexto 2: Operador Call-Taker (Triaje PSAP)
  const opCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  await opCtx.addCookies([
    { name: 'siae_token', value: 'operador-jwt-token', domain: 'localhost', path: '/' },
    { name: 'siae_role', value: 'operador', domain: 'localhost', path: '/' },
    { name: 'siae_name', value: encodeURIComponent('Operador VEN 911'), domain: 'localhost', path: '/' }
  ]);
  const opPage = await opCtx.newPage();

  // Contexto 3: Despachador Táctico CAD
  const dispCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  await dispCtx.addCookies([
    { name: 'siae_token', value: 'despachador-jwt-token', domain: 'localhost', path: '/' },
    { name: 'siae_role', value: 'despachador', domain: 'localhost', path: '/' },
    { name: 'siae_name', value: encodeURIComponent('Despachador CAD VEN 911'), domain: 'localhost', path: '/' }
  ]);
  const dispPage = await dispCtx.newPage();

  try {
    console.log('[1/5] Cargando simultáneamente las 3 pestañas...');
    await Promise.all([
      adminPage.goto('http://localhost:3000/dashboard'),
      opPage.goto('http://localhost:3000/operador'),
      dispPage.goto('http://localhost:3000/despachador')
    ]);

    await Promise.all([
      adminPage.waitForLoadState('networkidle'),
      opPage.waitForLoadState('networkidle'),
      dispPage.waitForLoadState('networkidle')
    ]);
    console.log('✓ 3 Consolas cargadas en pantalla.');

    // ── INTERACCIÓN EN PESTAÑA 1: ADMINISTRADOR ──────────────────────────────
    console.log('\n[2/5] Mostrando consola de Administrador (/dashboard)...');
    await adminPage.bringToFront();
    await adminPage.waitForTimeout(1500);

    // Navegar a /admin/usuarios
    console.log('  -> Admin navegando a /admin/usuarios (Nómina)');
    await adminPage.goto('http://localhost:3000/admin/usuarios');
    await adminPage.waitForLoadState('networkidle');
    await adminPage.waitForTimeout(1000);

    // Buscar en la tabla
    const searchInput = adminPage.getByPlaceholder(/buscar usuario/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('operador');
      await adminPage.waitForTimeout(800);
      await searchInput.fill('');
      await adminPage.waitForTimeout(500);
    }

    // Abrir modal Nuevo Usuario
    const nuevoUserBtn = adminPage.getByRole('button', { name: /nuevo usuario|nuevo funcionario/i });
    if (await nuevoUserBtn.isVisible()) {
      await nuevoUserBtn.click();
      await adminPage.waitForTimeout(1200);
      const closeBtn = adminPage.getByRole('button', { name: /cancelar|cerrar/i }).first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }

    // Navegar a /admin/cuadrantes
    console.log('  -> Admin navegando a /admin/cuadrantes (Cuadrantes de Paz)');
    await adminPage.goto('http://localhost:3000/admin/cuadrantes');
    await adminPage.waitForLoadState('networkidle');
    await adminPage.waitForTimeout(1200);

    // ── INTERACCIÓN EN PESTAÑA 2: OPERADOR DE TRIAJE ─────────────────────────
    console.log('\n[3/5] Pasando a Pestaña 2: Operador de Triaje (/operador)...');
    await opPage.bringToFront();
    await opPage.waitForTimeout(1500);

    // Seleccionar una emergencia de la cola
    const demandItems = opPage.locator('[role="listitem"], .cursor-pointer').filter({ hasText: /P0|P1|P2|Médico|Incendio|Tráfico|Seguridad/i });
    const countDemands = await demandItems.count();
    console.log(`  -> Demandas activas visibles en cola: ${countDemands}`);

    if (countDemands > 0) {
      console.log('  -> Operador seleccionando primer incidente crítico P0...');
      await demandItems.first().click();
      await opPage.waitForTimeout(1500);

      // Escribir notas clínicas de triaje si existe el campo
      const notesArea = opPage.locator('textarea, input[placeholder*="triage"], input[placeholder*="notas"]').first();
      if (await notesArea.isVisible()) {
        await notesArea.fill('Paciente hemodinámicamente inestable con requerimiento de soporte vital avanzado (SAV). Cuadrante CP-01 confirmado.');
        await opPage.waitForTimeout(1000);
      }

      // Tomar demanda o transferir a CAD
      const transferBtn = opPage.getByRole('button', { name: /transferir|remitir|enviar a cad/i }).first();
      if (await transferBtn.isVisible()) {
        console.log('  -> Operador transfiriendo formalmente el caso a Despacho CAD...');
        await transferBtn.click();
        await opPage.waitForTimeout(1500);

        // Si abre modal de confirmación
        const confirmTransfer = opPage.getByRole('button', { name: /confirmar|transferir ahora/i });
        if (await confirmTransfer.isVisible()) {
          await confirmTransfer.click();
          await opPage.waitForTimeout(1000);
        }
      }
    }

    // ── INTERACCIÓN EN PESTAÑA 3: DESPACHADOR TÁCTICO CAD ────────────────────
    console.log('\n[4/5] Pasando a Pestaña 3: Despachador Táctico CAD (/despachador)...');
    await dispPage.bringToFront();
    await dispPage.waitForTimeout(1500);

    // Seleccionar la demanda en la mesa de despacho
    const cadItems = dispPage.locator('.cursor-pointer, [role="listitem"]').filter({ hasText: /P0|P1|Maturín|Salud|Bomberos/i });
    if (await cadItems.count() > 0) {
      console.log('  -> Despachador seleccionando demanda transferida...');
      await cadItems.first().click();
      await dispPage.waitForTimeout(1200);

      // Abrir modal de despacho a entes
      const dispatchBtn = dispPage.getByRole('button', { name: /despachar|asignar unidades|despacho directo/i }).first();
      if (await dispatchBtn.isVisible()) {
        console.log('  -> Abriendo diálogo táctico de Despacho a Entes...');
        await dispatchBtn.click();
        await dispPage.waitForTimeout(1500);

        // Confirmar orden de despacho
        const confirmDispatchBtn = dispPage.getByRole('button', { name: /confirmar despacho|despachar ahora/i });
        if (await confirmDispatchBtn.isVisible()) {
          console.log('  -> Confirmando despacho de ambulancia SAV...');
          await confirmDispatchBtn.click();
          await dispPage.waitForTimeout(2000);
        }
      }

      // Mostrar acción "Marcar en sitio"
      const arrivedBtn = dispPage.getByRole('button', { name: /marcar en sitio/i }).first();
      if (await arrivedBtn.isVisible()) {
        console.log('  -> Móvil reporta arribo en la escena. Despachador marca en sitio.');
        await arrivedBtn.click();
        await dispPage.waitForTimeout(1500);
      }
    }

    // ── RETORNO A PESTAÑA 1: DASHBOARD SINCRONIZADO ──────────────────────────
    console.log('\n[5/5] Volviendo a Pestaña 1: Administrador (/dashboard) para ver actualización viva...');
    await adminPage.bringToFront();
    await adminPage.goto('http://localhost:3000/dashboard');
    await adminPage.waitForLoadState('networkidle');
    await adminPage.waitForTimeout(3000);
    console.log('✓ Métricas consolidadas en tiempo real visualizadas por el Administrador.');

  } finally {
    console.log('\nFinalizando demostración en vivo...');
    await adminCtx.close();
    await opCtx.close();
    await dispCtx.close();
    await browser.close();
    console.log('========================================================================');
    console.log('DEMOSTRACIÓN VISUAL SIMULTÁNEA COMPLETADA EXITOSAMENTE');
    console.log('========================================================================\n');
  }
}

runLiveVisualDemo().catch(console.error);
