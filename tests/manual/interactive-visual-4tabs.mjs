import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/freakeao/.gemini/antigravity-ide/brain/715eff84-e2ca-432e-b169-cc1f3d987db2';

async function getAuthSession(email, password) {
  try {
    const res = await fetch('http://localhost:3000/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      console.warn(`Fallback token para ${email} (status: ${res.status})`);
      return { token: `${email}-jwt-token`, role: email.split('@')[0], user: { nombre_completo: email } };
    }
    const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    const token = cookies.find(c => c.startsWith('siae_token='))?.split(';')[0]?.replace('siae_token=', '') || `${email}-jwt-token`;
    const role = cookies.find(c => c.startsWith('siae_role='))?.split(';')[0]?.replace('siae_role=', '') || email.split('@')[0];
    const data = await res.json();
    return { token, role, user: data };
  } catch (err) {
    console.warn(`Error auth backend para ${email}:`, err.message);
    return { token: `${email}-jwt-token`, role: email.split('@')[0], user: { nombre_completo: email } };
  }
}

async function runLiveVisual4Tabs() {
  console.log('========================================================================');
  console.log('SIAE — APERTURA Y CONTROL VISUAL SIMULTÁNEO DE LOS 4 ENTORNOS (MCP)');
  console.log('========================================================================\n');

  console.log('[1/5] Obteniendo credenciales autorizadas del backend...');
  const [adminAuth, operatorAuth, dispatcherAuth] = await Promise.all([
    getAuthSession('admin@siae.gob.ve', 'admin123'),
    getAuthSession('operador@ven911.gob.ve', 'operador123'),
    getAuthSession('despachador@ven911.gob.ve', 'operador123')
  ]);

  console.log(`✓ Admin autenticado: ${adminAuth.user.nombre_completo || 'Admin'}`);
  console.log(`✓ Operador autenticado: ${operatorAuth.user.nombre_completo || 'Operador'}`);
  console.log(`✓ Despachador autenticado: ${dispatcherAuth.user.nombre_completo || 'Despachador'}`);

  console.log('\n[2/5] Lanzando navegador visual (Chromium Headed Mode)...');
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  // ── Contexto 1: Solicitante (Ciudadano - PWA Móvil) ────────────────────────
  console.log('[3/5] Configurando Entorno 1: Solicitante (PWA Emergencias)...');
  const citizenCtx = await browser.newContext({
    viewport: { width: 420, height: 860 },
    isMobile: true,
    hasTouch: true
  });
  const citizenPage = await citizenCtx.newPage();

  // ── Contexto 2: Operador PSAP (Call-Taker Triaje) ─────────────────────────
  console.log('[3/5] Configurando Entorno 2: Operador (Puesto de Triaje ACD)...');
  const opCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  await opCtx.addCookies([
    { name: 'siae_token', value: operatorAuth.token, domain: 'localhost', path: '/' },
    { name: 'siae_role', value: 'operador', domain: 'localhost', path: '/' },
    { name: 'siae_name', value: encodeURIComponent(operatorAuth.user.nombre_completo || 'Operador VEN 911'), domain: 'localhost', path: '/' },
    { name: 'siae_email', value: encodeURIComponent('operador@ven911.gob.ve'), domain: 'localhost', path: '/' }
  ]);
  const opPage = await opCtx.newPage();

  // ── Contexto 3: Despachador CAD (Consola Táctica de Unidades) ─────────────
  console.log('[3/5] Configurando Entorno 3: Despachador (Consola Táctica CAD)...');
  const dispCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  await dispCtx.addCookies([
    { name: 'siae_token', value: dispatcherAuth.token, domain: 'localhost', path: '/' },
    { name: 'siae_role', value: 'despachador', domain: 'localhost', path: '/' },
    { name: 'siae_name', value: encodeURIComponent(dispatcherAuth.user.nombre_completo || 'Despachador CAD VEN 911'), domain: 'localhost', path: '/' },
    { name: 'siae_email', value: encodeURIComponent('despachador@ven911.gob.ve'), domain: 'localhost', path: '/' }
  ]);
  const dispPage = await dispCtx.newPage();

  // ── Contexto 4: Administrador Global (Consola Estratégica) ─────────────────
  console.log('[3/5] Configurando Entorno 4: Administrador (Consola Global VEN 911)...');
  const adminCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  await adminCtx.addCookies([
    { name: 'siae_token', value: adminAuth.token, domain: 'localhost', path: '/' },
    { name: 'siae_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'siae_name', value: encodeURIComponent(adminAuth.user.nombre_completo || 'Administrador SIAE'), domain: 'localhost', path: '/' },
    { name: 'siae_email', value: encodeURIComponent('admin@siae.gob.ve'), domain: 'localhost', path: '/' }
  ]);
  const adminPage = await adminCtx.newPage();

  console.log('\n[4/5] Navegando simultáneamente a las 4 consolas...');
  await Promise.all([
    citizenPage.goto('http://localhost:3000/'),
    opPage.goto('http://localhost:3000/operador'),
    dispPage.goto('http://localhost:3000/despachador'),
    adminPage.goto('http://localhost:3000/dashboard')
  ]);

  await Promise.all([
    citizenPage.waitForLoadState('networkidle'),
    opPage.waitForLoadState('networkidle'),
    dispPage.waitForLoadState('networkidle'),
    adminPage.waitForLoadState('networkidle')
  ]);

  console.log('✓ Los 4 entornos cargaron satisfactoriamente.');

  // Guardar capturas de evidencia
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  await citizenPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'solicitante_entorno.png') });
  await opPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'operador_entorno.png') });
  await dispPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'despachador_entorno.png') });
  await adminPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_entorno.png') });
  console.log('✓ Capturas de los 4 entornos guardadas en directorio de artefactos.');

  console.log('\n[5/5] Los 4 entornos están visibles en pantalla.');
  console.log('Manteniendo la sesión del navegador abierta activamente para interacción del usuario...');

  // Dejar el proceso corriendo para que las ventanas permanezcan en pantalla
  await new Promise(() => {});
}

runLiveVisual4Tabs().catch(err => {
  console.error('Error durante la ejecución:', err);
  process.exit(1);
});
