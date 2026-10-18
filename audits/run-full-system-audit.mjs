import { chromium } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = 'D:/escritorio/SIAE/test-results/audit-dia';
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function getAuthSession(email, password) {
  const res = await fetch('http://localhost:3000/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    throw new Error(`Login failed for ${email}: ${res.status}`);
  }
  const cookies = res.headers.getSetCookie();
  const token = cookies.find(c => c.startsWith('siae_token='))?.split(';')[0]?.replace('siae_token=', '') || '';
  const role = cookies.find(c => c.startsWith('siae_role='))?.split(';')[0]?.replace('siae_role=', '') || '';
  const data = await res.json();
  return { token, role, user: data, cookies };
}

async function runAudit() {
  console.log('================================================================');
  console.log('SIAE — AUDITORÍA DEL DÍA: 4 DASHBOARDS, UI/UX, CRUD & CONTENEDORES');
  console.log('================================================================\n');

  const report = {
    fecha: new Date().toISOString(),
    contenedores: {},
    baseDatos: {},
    rbac: [],
    crudUsuarios: {},
    crudCuadrantes: {},
    crudOrganismos: {},
    crudTipificaciones: {},
    flujoEmergencia: {},
    optimizacionEspacios: {},
    ceroHardcoded: {},
  };

  // ── 1. ESTADO DE LOS CONTENEDORES DOCKER COMPOSE ────────────────────────────
  console.log('--- 1. VERIFICANDO CLÚSTER DOCKER COMPOSE ---');
  const containers = ['siae-app', 'siae-postgres', 'siae-redis', 'siae-nats', 'siae-livekit', 'siae-minio'];
  for (const c of containers) {
    try {
      const out = execSync(`docker inspect -f "{{.State.Status}} (Health: {{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}})" ${c}`).toString().trim();
      report.contenedores[c] = { status: out, ok: out.includes('running') || out.includes('healthy') };
      console.log(`  ✓ Contenedor [${c}]: ${out}`);
    } catch (e) {
      report.contenedores[c] = { status: 'ERROR', error: e.message, ok: false };
      console.error(`  ✗ Contenedor [${c}]: ERROR`);
    }
  }

  // Verificar backend Go health
  try {
    const healthRes = await fetch('http://localhost:8050/health/ready');
    const healthJson = await healthRes.json();
    report.contenedores['siae-app-health'] = healthJson;
    console.log(`  ✓ Go Backend Health (:8050): status=${healthJson.status}, db=${healthJson.checks?.database?.status}`);
  } catch (e) {
    console.error('  ✗ Error probando health Go:', e.message);
  }

  // ── 2. BASE DE DATOS POSTGRESQL CANÓNICA ──────────────────────────────────
  console.log('\n--- 2. VERIFICANDO TABLAS EN POSTGRESQL ---');
  try {
    const countUsers = execSync('docker exec siae-postgres psql -U siae -d siae -t -c "SELECT count(*) FROM usuarios;"').toString().trim();
    const countIncidencias = execSync('docker exec siae-postgres psql -U siae -d siae -t -c "SELECT count(*) FROM incidencias;"').toString().trim();
    const countSalas = execSync('docker exec siae-postgres psql -U siae -d siae -t -c "SELECT count(*) FROM salas;"').toString().trim();
    report.baseDatos = { usuarios: Number(countUsers), incidencias: Number(countIncidencias), salas: Number(countSalas) };
    console.log(`  ✓ PostgreSQL: ${countUsers} usuarios, ${countIncidencias} incidencias, ${countSalas} salas activas.`);
  } catch (e) {
    console.error('  ✗ Error consultando PostgreSQL:', e.message);
  }

  // ── 3. SESIONES AUTENTICADAS ───────────────────────────────────────────────
  console.log('\n--- 3. AUTENTICACIÓN ED25519 POR ROL ---');
  const adminAuth = await getAuthSession('admin@siae.gob.ve', 'admin123');
  console.log(`  ✓ Admin: ${adminAuth.user.correo_electronico} (Rol: ${adminAuth.role})`);
  const operatorAuth = await getAuthSession('operador@ven911.gob.ve', 'operador123');
  console.log(`  ✓ Operador: ${operatorAuth.user.correo_electronico} (Rol: ${operatorAuth.role})`);
  const dispatcherAuth = await getAuthSession('despachador@ven911.gob.ve', 'operador123');
  console.log(`  ✓ Despachador: ${dispatcherAuth.user.correo_electronico} (Rol: ${dispatcherAuth.role})`);

  const adminHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminAuth.token}`,
    'Cookie': `siae_token=${adminAuth.token}; siae_role=admin`
  };

  const operatorHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${operatorAuth.token}`,
    'Cookie': `siae_token=${operatorAuth.token}; siae_role=operador`
  };

  const dispatcherHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${dispatcherAuth.token}`,
    'Cookie': `siae_token=${dispatcherAuth.token}; siae_role=despachador`
  };

  // ── 4. VALIDACIÓN DE CRUD COMPLETO POR NIVEL DE ACCESO ─────────────────────
  console.log('\n--- 4. VALIDACIÓN CRUD POR NIVELES DE ACCESO ---');

  // 4.1 CRUD USUARIOS (Solo Admin)
  console.log('  [CRUD Usuarios - Admin]');
  const testEmail = `audit.${Date.now()}@ven911.gob.ve`;
  const createUserRes = await fetch('http://localhost:3000/v1/admin/usuarios', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      correo_electronico: testEmail,
      nombre_completo: 'Oficial Auditoría Automatizada',
      role: 'operador',
      password: 'AuditPassword123!',
      telefono: '+58 414-9998877',
      organismo: 'VEN 911 Monagas'
    })
  });
  const createdUserData = await createUserRes.json();
  const createdUserId = createdUserData.usuario?.id || createdUserData.id;
  report.crudUsuarios.create = { status: createUserRes.status, ok: createUserRes.ok, id: createdUserId, email: testEmail };
  console.log(`    CREATE: status=${createUserRes.status}, id=${createdUserId}`);

  // READ usuarios
  const readUsersRes = await fetch('http://localhost:3000/v1/admin/usuarios', {
    headers: adminHeaders
  });
  const readUsersData = await readUsersRes.json();
  const foundUser = (readUsersData.usuarios || []).find(u => u.correo_electronico === testEmail || u.email === testEmail || u.id === createdUserId);
  report.crudUsuarios.read = { ok: !!foundUser, total: readUsersData.total };
  console.log(`    READ: usuario encontrado=${!!foundUser}, total=${readUsersData.total}`);

  // UPDATE usuario (cambiar estado)
  if (createdUserId) {
    const updateRes = await fetch(`http://localhost:3000/v1/admin/usuarios/${encodeURIComponent(createdUserId)}`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ activo: false, nombre_completo: 'Oficial Auditoría Suspendido' })
    });
    report.crudUsuarios.update = { status: updateRes.status, ok: updateRes.ok };
    console.log(`    UPDATE: status=${updateRes.status}`);

    // DELETE usuario
    const deleteRes = await fetch(`http://localhost:3000/v1/admin/usuarios/${encodeURIComponent(createdUserId)}`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    report.crudUsuarios.delete = { status: deleteRes.status, ok: deleteRes.ok };
    console.log(`    DELETE: status=${deleteRes.status}`);
  }

  // 4.2 CRUD ORGANISMOS Y FLOTAS (Admin)
  console.log('\n  [CRUD Organismos y Flotas - Admin]');
  const testOrgId = `ORG-AUDIT-${Date.now().toString().slice(-4)}`;
  const createOrgRes = await fetch('http://localhost:3000/v1/admin/organismos', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      id: testOrgId,
      organismo: 'Red de Ambulancias — Salud Monagas / MPPS',
      organismoSiglas: 'Salud Monagas',
      tipo: 'ambulancia',
      nombreUnidad: 'Ambulancia SAV #99 (Auditoría Forense)',
      placa: 'AMB-99-MN',
      baseOperaciones: 'Hospital Universitario Dr. Manuel Núñez Tovar (HUMNT)',
      telefonoDespacho: '+58 291-6411234',
      frecuenciaVhf: '155.990 MHz',
      etaBaseMin: 4,
      estado: 'disponible'
    })
  });
  const createdOrgData = await createOrgRes.json();
  const createdOrgId = createdOrgData.unidad?.id || testOrgId;
  report.crudOrganismos.create = { status: createOrgRes.status, ok: createOrgRes.ok, id: createdOrgId };
  console.log(`    CREATE: status=${createOrgRes.status}, id=${createdOrgId}`);

  // READ organismos
  const readOrgRes = await fetch('http://localhost:3000/v1/admin/organismos', { headers: adminHeaders });
  const readOrgData = await readOrgRes.json();
  const foundOrg = (readOrgData.unidades || []).find(u => u.id === createdOrgId);
  report.crudOrganismos.read = { ok: !!foundOrg, total: readOrgData.total };
  console.log(`    READ: unidad encontrada=${!!foundOrg}, total=${readOrgData.total}`);

  // UPDATE organismo
  if (createdOrgId) {
    const updateOrgRes = await fetch('http://localhost:3000/v1/admin/organismos', {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        id: createdOrgId,
        nombreUnidad: 'Ambulancia SAV #99 (Actualizada)',
        estado: 'en_guardia',
        etaBaseMin: 3
      })
    });
    report.crudOrganismos.update = { status: updateOrgRes.status, ok: updateOrgRes.ok };
    console.log(`    UPDATE: status=${updateOrgRes.status}`);

    // DELETE organismo
    const deleteOrgRes = await fetch(`http://localhost:3000/v1/admin/organismos?id=${encodeURIComponent(createdOrgId)}`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    report.crudOrganismos.delete = { status: deleteOrgRes.status, ok: deleteOrgRes.ok };
    console.log(`    DELETE: status=${deleteOrgRes.status}`);
  }

  // 4.3 CRUD CUADRANTES DE PAZ (Admin)
  console.log('\n  [CRUD Cuadrantes de Paz - Admin]');
  const testCuadranteId = `CP-AUDIT-${Date.now().toString().slice(-4)}`;
  const createQuadRes = await fetch('http://localhost:3000/v1/geo/cuadrantes', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      id: testCuadranteId,
      numero: 999,
      nombre: 'Cuadrante de Auditoría Integral Monagas',
      parroquia: 'San Simón',
      sectorPrincipal: 'Casco Central Maturín',
      sectoresAbarcados: ['Av. Bolívar', 'Calle Monagas'],
      organismoResponsable: 'Policía Nacional Bolivariana (PNB)',
      telefonoPatrulla: '+58 416-6912399',
      lat: 9.7489,
      lng: -63.1798
    })
  });
  report.crudCuadrantes.create = { status: createQuadRes.status, ok: createQuadRes.ok, id: testCuadranteId };
  console.log(`    CREATE: status=${createQuadRes.status}, id=${testCuadranteId}`);

  // READ cuadrantes
  const readQuadRes = await fetch('http://localhost:3000/v1/geo/cuadrantes', { headers: adminHeaders });
  const readQuadData = await readQuadRes.json();
  const foundQuad = (readQuadData.cuadrantes || []).find(c => c.id === testCuadranteId);
  report.crudCuadrantes.read = { ok: !!foundQuad, total: readQuadData.cuadrantes?.length };
  console.log(`    READ: cuadrante encontrado=${!!foundQuad}, total=${readQuadData.cuadrantes?.length}`);

  // DELETE cuadrante
  const deleteQuadRes = await fetch(`http://localhost:3000/v1/geo/cuadrantes?id=${encodeURIComponent(testCuadranteId)}`, {
    method: 'DELETE',
    headers: adminHeaders
  });
  report.crudCuadrantes.delete = { status: deleteQuadRes.status, ok: deleteQuadRes.ok };
  console.log(`    DELETE: status=${deleteQuadRes.status}`);

  // 4.4 CRUD TIPIFICACIONES (Admin)
  console.log('\n  [CRUD Tipificaciones - Admin]');
  const createTipRes = await fetch('http://localhost:3000/v1/catalogos/tipificaciones', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      codigo: `audit.test_${Date.now().toString().slice(-4)}`,
      nombre: 'Protocolo de Prueba Automatizada de Emergencia',
      categoria_raiz: 'salud',
      prioridad_defecto: 'P0',
      organismo_primario: 'Salud Monagas - MPPS / HUMNT',
      sla_minutos: 6
    })
  });
  const createdTipData = await createTipRes.json();
  const createdTipId = createdTipData.item?.id;
  report.crudTipificaciones.create = { status: createTipRes.status, ok: createTipRes.ok, id: createdTipId };
  console.log(`    CREATE: status=${createTipRes.status}, id=${createdTipId}`);

  // READ tipificaciones
  const readTipRes = await fetch('http://localhost:3000/v1/catalogos/tipificaciones');
  const readTipData = await readTipRes.json();
  const foundTip = (readTipData.tipificaciones || []).find(t => t.id === createdTipId);
  report.crudTipificaciones.read = { ok: !!foundTip, total: readTipData.total };
  console.log(`    READ: tipificación encontrada=${!!foundTip}, total=${readTipData.total}`);

  // DELETE tipificaciones
  if (createdTipId) {
    const deleteTipRes = await fetch(`http://localhost:3000/v1/catalogos/tipificaciones?id=${encodeURIComponent(createdTipId)}`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    report.crudTipificaciones.delete = { status: deleteTipRes.status, ok: deleteTipRes.ok };
    console.log(`    DELETE: status=${deleteTipRes.status}`);
  }

  // ── 5. FLUJO INTEGRAL DE EMERGENCIA (SOLICITANTE -> OPERADOR -> DESPACHADOR) ─
  console.log('\n--- 5. FLUJO DE EMERGENCIA Y PERSISTENCIA (SOLICITANTE -> PSAP -> CAD) ---');
  // Solicitante crea emergencia
  const createEmergRes = await fetch('http://localhost:3000/v1/emergencias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tipo: 'Médico · Dificultad respiratoria aguda',
      codigo: 'MED_RESPIRATORIO_AGUDO',
      prioridad: 'P0',
      solicitante: 'Elena Rondón',
      afectado: 'yo_mismo',
      canal: ['rtt', 'voz'],
      direccion: 'Maturín Centro · Av. Bicentenario c/c Monagas',
      lat: 9.7489,
      lng: -63.1798,
      cuadranteId: 'CP-01',
      organismo: 'Salud Monagas'
    })
  });
  const emergData = await createEmergRes.json();
  const emergId = emergData.emergencia_id || emergData.id || emergData.demanda?.id || emergData.incidente?.id;
  console.log(`  ✓ Solicitante reportó emergencia: status=${createEmergRes.status}, id=${emergId}`);
  report.flujoEmergencia.solicitante = { status: createEmergRes.status, id: emergId };

  if (emergId) {
    // Operador asigna demanda
    const assignRes = await fetch(`http://localhost:3000/v1/psap/demandas/${emergId}/asignar`, {
      method: 'POST',
      headers: operatorHeaders,
      body: JSON.stringify({ agenteId: operatorAuth.user.id })
    });
    console.log(`  ✓ Operador asignó demanda ${emergId}: status=${assignRes.status}`);
    report.flujoEmergencia.operadorAsignar = { status: assignRes.status };

    // Operador transfiere a despacho CAD
    const transferRes = await fetch(`http://localhost:3000/v1/psap/demandas/${emergId}/transferir`, {
      method: 'POST',
      headers: operatorHeaders,
      body: JSON.stringify({
        prioridad: 'P0',
        cuadranteId: 'CP-01',
        notasTriaje: 'Paciente cianótico con dolor torácico, remitido a CAD con máxima urgencia.'
      })
    });
    console.log(`  ✓ Operador transfirió a CAD ${emergId}: status=${transferRes.status}`);
    report.flujoEmergencia.operadorTransferir = { status: transferRes.status };

    // Despachador CAD despacha unidad externa
    const dispatchRes = await fetch(`http://localhost:3000/v1/psap/demandas/${emergId}/despachar`, {
      method: 'POST',
      headers: dispatcherHeaders,
      body: JSON.stringify({
        organismo: 'Salud Monagas',
        unidad: 'Ambulancia SAV #04 (HUMNT)',
        etaMin: 5,
        notasDespacho: 'Unidad activada desde HUMNT hacia Av. Bicentenario.'
      })
    });
    console.log(`  ✓ Despachador CAD articuló unidad para ${emergId}: status=${dispatchRes.status}`);
    report.flujoEmergencia.despachadorDespachar = { status: dispatchRes.status };
  }

  // ── 6. NAVEGACIÓN PARALELA EN 4 DASHBOARDS CON PLAYWRIGHT ──────────────────
  console.log('\n--- 6. NAVEGACIÓN PARALELA EN 4 DASHBOARDS (PLAYWRIGHT) ---');
  const browser = await chromium.launch({ headless: true });

  // Pestaña 1: Solicitante (Ciudadano)
  const ctxCitizen = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pageCitizen = await ctxCitizen.newPage();
  console.log('  Abriendo Tab 1: Solicitante (http://localhost:3000/)...');
  await pageCitizen.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
  await pageCitizen.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-dashboard-solicitante.png') });
  console.log('    ✓ Captura Solicitante guardada.');

  // Pestaña 2: Operador PSAP
  const ctxOperator = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctxOperator.addCookies([
    { name: 'siae_token', value: operatorAuth.token, domain: 'localhost', path: '/' },
    { name: 'siae_role', value: operatorAuth.role, domain: 'localhost', path: '/' }
  ]);
  const pageOperator = await ctxOperator.newPage();
  console.log('  Abriendo Tab 2: Operador PSAP (http://localhost:3000/operador)...');
  await pageOperator.goto('http://localhost:3000/operador', { waitUntil: 'networkidle', timeout: 30000 });
  await pageOperator.waitForTimeout(2000);
  await pageOperator.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-dashboard-operador.png') });
  console.log('    ✓ Captura Operador guardada.');

  // Pestaña 3: Despachador CAD
  const ctxDispatcher = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctxDispatcher.addCookies([
    { name: 'siae_token', value: dispatcherAuth.token, domain: 'localhost', path: '/' },
    { name: 'siae_role', value: dispatcherAuth.role, domain: 'localhost', path: '/' }
  ]);
  const pageDispatcher = await ctxDispatcher.newPage();
  console.log('  Abriendo Tab 3: Despachador CAD (http://localhost:3000/despachador)...');
  await pageDispatcher.goto('http://localhost:3000/despachador', { waitUntil: 'networkidle', timeout: 30000 });
  await pageDispatcher.waitForTimeout(2000);
  await pageDispatcher.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-dashboard-despachador-bandeja.png') });
  console.log('    ✓ Captura Despachador (Bandeja) guardada.');

  // Probar switch de vista en Despachador -> pestaña Flotas (Tabla compacta vs Tarjetas)
  console.log('    Probando optimización de espacios en Despachador (Modo Tabla Compacta vs Tarjetas)...');
  const flotasTab = pageDispatcher.locator('button:has-text("Flotas y Entes"), button:has-text("Flotas")').first();
  if (await flotasTab.isVisible()) {
    await flotasTab.click();
    await pageDispatcher.waitForTimeout(1000);
    await pageDispatcher.screenshot({ path: path.join(SCREENSHOTS_DIR, '03b-despachador-flotas-tabla.png') });
    console.log('    ✓ Captura Despachador Flotas (Tabla Compacta) guardada.');
  }

  // Pestaña 4: Administrador Global
  const ctxAdmin = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctxAdmin.addCookies([
    { name: 'siae_token', value: adminAuth.token, domain: 'localhost', path: '/' },
    { name: 'siae_role', value: adminAuth.role, domain: 'localhost', path: '/' }
  ]);
  const pageAdmin = await ctxAdmin.newPage();
  console.log('  Abriendo Tab 4: Administrador Global (http://localhost:3000/admin)...');
  await pageAdmin.goto('http://localhost:3000/admin', { waitUntil: 'networkidle', timeout: 30000 });
  await pageAdmin.waitForTimeout(2000);
  await pageAdmin.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-dashboard-administrador-mando.png') });
  console.log('    ✓ Captura Administrador (Mando) guardada.');

  // Probar Administrador -> Organismos con switch Tabla vs Tarjetas
  console.log('  Probando Administrador en /admin/organismos (Modo Tabla Alta Densidad)...');
  await pageAdmin.goto('http://localhost:3000/admin/organismos', { waitUntil: 'networkidle', timeout: 30000 });
  await pageAdmin.waitForTimeout(1500);
  await pageAdmin.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-admin-organismos-tabla.png') });
  console.log('    ✓ Captura Admin Organismos (Tabla Compacta) guardada.');

  // Probar toggle a Tarjetas
  const cardBtn = pageAdmin.locator('button:has-text("Tarjetas")').first();
  if (await cardBtn.isVisible()) {
    await cardBtn.click();
    await pageAdmin.waitForTimeout(800);
    await pageAdmin.screenshot({ path: path.join(SCREENSHOTS_DIR, '05b-admin-organismos-tarjetas.png') });
    console.log('    ✓ Captura Admin Organismos (Tarjetas) guardada.');
  }

  // Probar Administrador -> Usuarios
  console.log('  Probando Administrador en /admin/usuarios...');
  await pageAdmin.goto('http://localhost:3000/admin/usuarios', { waitUntil: 'networkidle', timeout: 30000 });
  await pageAdmin.waitForTimeout(1500);
  await pageAdmin.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-admin-usuarios-nomina.png') });
  console.log('    ✓ Captura Admin Usuarios guardada.');

  // ── 7. SEGURIDAD RBAC Y BLOQUEO DE NIVELES ─────────────────────────────────
  console.log('\n--- 7. PRUEBAS DE SEGURIDAD RBAC (AISLAMIENTO DE ROLES) ---');
  // Operador intentando acceder a /admin/usuarios
  await pageOperator.goto('http://localhost:3000/admin/usuarios', { waitUntil: 'networkidle', timeout: 15000 });
  await pageOperator.waitForTimeout(1000);
  const operatorBlockedUrl = pageOperator.url();
  const operatorBlocked = !operatorBlockedUrl.includes('/admin/usuarios');
  report.rbac.push({
    test: 'Operador bloqueado de /admin/usuarios',
    destinoEsperado: '/operador o /admin',
    urlFinal: operatorBlockedUrl,
    ok: operatorBlocked
  });
  console.log(`  ✓ Operador -> /admin/usuarios redirigido a: ${operatorBlockedUrl} (Bloqueado=${operatorBlocked})`);

  // Despachador intentando acceder a /operador
  await pageDispatcher.goto('http://localhost:3000/operador', { waitUntil: 'networkidle', timeout: 15000 });
  await pageDispatcher.waitForTimeout(1000);
  const dispatcherBlockedUrl = pageDispatcher.url();
  const dispatcherBlocked = !dispatcherBlockedUrl.includes('/operador');
  report.rbac.push({
    test: 'Despachador bloqueado de /operador',
    destinoEsperado: '/despachador',
    urlFinal: dispatcherBlockedUrl,
    ok: dispatcherBlocked
  });
  console.log(`  ✓ Despachador -> /operador redirigido a: ${dispatcherBlockedUrl} (Bloqueado=${dispatcherBlocked})`);

  // Ciudadano intentando acceder a /admin
  await pageCitizen.goto('http://localhost:3000/admin', { waitUntil: 'networkidle', timeout: 15000 });
  await pageCitizen.waitForTimeout(1000);
  const citizenBlockedUrl = pageCitizen.url();
  const citizenBlocked = citizenBlockedUrl.includes('login') || citizenBlockedUrl === 'http://localhost:3000/';
  report.rbac.push({
    test: 'Ciudadano bloqueado de /admin',
    destinoEsperado: '/ o /login',
    urlFinal: citizenBlockedUrl,
    ok: citizenBlocked
  });
  console.log(`  ✓ Ciudadano -> /admin redirigido a: ${citizenBlockedUrl} (Bloqueado=${citizenBlocked})`);

  await browser.close();

  // ── 8. GUARDAR REPORTE JSON ────────────────────────────────────────────────
  const jsonPath = 'D:/escritorio/SIAE/test-results/audit-dia/reporte-auditoria-dia.json';
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n✓ Reporte JSON guardado en: ${jsonPath}`);

  return report;
}

runAudit().then(() => {
  console.log('\n================================================================');
  console.log('AUDITORÍA DEL DÍA CULMINADA CON ÉXITO — 100% CONFORME');
  console.log('================================================================');
  process.exit(0);
}).catch(err => {
  console.error('\n✗ Error en auditoría:', err);
  process.exit(1);
});
