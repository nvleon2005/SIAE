import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import pg from 'pg';
import crypto from 'crypto';

const { Pool } = pg;

async function testMinioAndDbPersistence() {
  console.log('========================================================================');
  console.log('PRUEBA DE PERSISTENCIA REAL: EVIDENCIAS EN MINIO S3 Y MENSAJES EN POSTGRESQL');
  console.log('========================================================================\n');

  const salaTestId = `sala-test-${Date.now()}`;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(salaTestId);
  const resolvedSalaUuid = isUuid ? salaTestId : crypto.createHash('md5').update(salaTestId).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');

  // Conexión S3 a MinIO
  const s3 = new S3Client({
    endpoint: 'http://127.0.0.1:9000',
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'siae_minio',
      secretAccessKey: 'siae_minio_pass'
    },
    forcePathStyle: true
  });

  // Conexión Postgres
  const pgPool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    user: 'siae',
    password: 'siae_dev_pass',
    database: 'siae'
  });

  try {
    // 1. Crear Sala en PostgreSQL
    console.log('[1/4] Creando sala transaccional en PostgreSQL...');
    const incId = crypto.randomUUID();
    await pgPool.query(
      `INSERT INTO incidencias (id, estado, codigo_tipificacion, texto_incidente, afectado, canales_activos, fecha_creacion, fecha_actualizacion)
       VALUES ($1, 'encolada', 'MEDICO_TEST', 'Incidente con prueba de MinIO', 'yo_mismo', ARRAY['voz','rtt'], NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [incId]
    );
    await pgPool.query(
      `INSERT INTO salas (id, incidente_id, estado, participantes, servidores_ice)
       VALUES ($1, $2, 'activa', '[]'::jsonb, '[]'::jsonb)
       ON CONFLICT (id) DO NOTHING`,
      [resolvedSalaUuid, incId]
    );
    console.log(`✓ Sala ${resolvedSalaUuid} registrada.`);

    // 2. Probar subida de Imagen/Foto a MinIO y registro en PostgreSQL
    console.log('\n[2/4] Enviando imagen de evidencia fotográfica del alertante (Base64 JPEG)...');
    const mockImageBuffer = Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;', 'binary');
    const base64Data = `data:image/gif;base64,${mockImageBuffer.toString('base64')}`;

    const uploadRes = await fetch('http://localhost:3000/v1/media/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        salaId: resolvedSalaUuid,
        tipo: 'foto',
        fileName: 'evidencia_ciudadano_rotura_tubo.gif',
        dataUrl: base64Data
      })
    });

    const uploadJson = await uploadRes.json();
    console.log('  -> Respuesta BFF /v1/media/upload:', uploadJson);

    if (!uploadRes.ok) {
      throw new Error(`Fallo en upload: ${JSON.stringify(uploadJson)}`);
    }

    const s3Key = uploadJson.media.clave_s3;
    console.log(`✓ Objeto almacenado bajo la clave S3: ${s3Key}`);

    // 3. Verificar directamente contra MinIO S3
    console.log('\n[3/4] Consultando objeto directamente en MinIO S3 (bucket: siae-media)...');
    const getCmd = new GetObjectCommand({
      Bucket: 'siae-media',
      Key: s3Key
    });
    const s3Obj = await s3.send(getCmd);
    console.log(`✓ Objeto recuperado de MinIO: ContentType=${s3Obj.ContentType}, ContentLength=${s3Obj.ContentLength} bytes`);

    // 4. Probar guardado de Mensajes RTT en PostgreSQL
    console.log('\n[4/4] Enviando mensajes RTT (texto en tiempo real) y guardando en PostgreSQL...');
    const rttRes1 = await fetch('http://localhost:3000/v1/rtt/mensajes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        salaId: resolvedSalaUuid,
        rolAutor: 'ciudadano',
        texto: 'Alerta médica: Paciente con pérdida de consciencia y dolor torácico.',
        esParcial: false
      })
    });
    const rttJson1 = await rttRes1.json();
    console.log('  -> Mensaje alertante persistido:', rttJson1);

    const rttRes2 = await fetch('http://localhost:3000/v1/rtt/mensajes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        salaId: resolvedSalaUuid,
        rolAutor: 'agente',
        texto: 'Puesto VEN 911 Monagas en línea. Ambulancia SAV #04 despachada en código rojo.',
        esParcial: false
      })
    });
    const rttJson2 = await rttRes2.json();
    console.log('  -> Mensaje operador persistido:', rttJson2);

    // 5. Verificar filas directamente en PostgreSQL
    console.log('\n[VERIFICACIÓN FORENSE EN BASE DE DATOS POSTGRESQL]');
    const mediaRows = await pgPool.query(
      `SELECT id, sala_id, tipo, tipo_mime, tamano_bytes, clave_s3, fecha_captura FROM archivos_media WHERE sala_id = $1`,
      [resolvedSalaUuid]
    );
    console.log(`✓ Registros en tabla 'archivos_media' (${mediaRows.rows.length} encontrados):`);
    console.table(mediaRows.rows);

    const rttRows = await pgPool.query(
      `SELECT id, sala_id, rol_autor, texto, fecha_envio FROM mensajes_rtt WHERE sala_id = $1 ORDER BY fecha_envio ASC`,
      [resolvedSalaUuid]
    );
    console.log(`✓ Registros en tabla 'mensajes_rtt' (${rttRows.rows.length} encontrados):`);
    console.table(rttRows.rows);

    console.log('\n========================================================================');
    console.log('PRUEBA DE EVIDENCIA EN MINIO Y BASE DE DATOS COMPLETADA EXITOSAMENTE');
    console.log('========================================================================');

  } catch (err) {
    console.error('Error durante la prueba de persistencia:', err);
    process.exit(1);
  } finally {
    await pgPool.end();
  }
}

testMinioAndDbPersistence();
