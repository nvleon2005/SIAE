import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import pg from 'pg';
import crypto from 'crypto';

const { Pool } = pg;

async function runMultimediaTripletAudit() {
  console.log('========================================================================');
  console.log('AUDITORÍA FORENSE DE EVIDENCIAS: IMAGEN, SONIDO/AUDIO Y TEXTO');
  console.log('========================================================================\n');

  const salaTestId = `sala-audit-${Date.now()}`;
  const resolvedSalaUuid = crypto.createHash('md5').update(salaTestId).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');

  const s3 = new S3Client({
    endpoint: 'http://127.0.0.1:9000',
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'siae_minio',
      secretAccessKey: 'siae_minio_pass'
    },
    forcePathStyle: true
  });

  const pgPool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    user: 'siae',
    password: 'siae_dev_pass',
    database: 'siae'
  });

  try {
    // 1. Crear Sala transaccional
    console.log('[1/4] Creando sala transaccional e incidente...');
    const incId = crypto.randomUUID();
    await pgPool.query(
      `INSERT INTO incidencias (id, estado, codigo_tipificacion, texto_incidente, afectado, canales_activos, fecha_creacion, fecha_actualizacion)
       VALUES ($1, 'encolada', 'MEDICO_P0_TEST', 'Paciente politraumatizado en vía pública', 'otra_persona', ARRAY['voz','rtt','video'], NOW(), NOW())`,
      [incId]
    );
    await pgPool.query(
      `INSERT INTO salas (id, incidente_id, estado, participantes, servidores_ice)
       VALUES ($1, $2, 'activa', '[]'::jsonb, '[]'::jsonb)`,
      [resolvedSalaUuid, incId]
    );
    console.log(`✓ Sala ${resolvedSalaUuid} e incidente ${incId} creados.`);

    // 2. Persistir IMAGEN
    console.log('\n[2/4] Persistiendo evidencia de IMAGEN (PNG/GIF) en MinIO S3 + PostgreSQL...');
    const mockImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const imageRes = await fetch('http://localhost:3000/v1/media/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        salaId: resolvedSalaUuid,
        incidenteId: incId,
        tipo: 'foto',
        fileName: 'foto_evidencia_accidente.png',
        dataUrl: `data:image/png;base64,${mockImageBuffer.toString('base64')}`
      })
    });
    const imageJson = await imageRes.json();
    console.log('  -> Imagen guardada:', imageJson.media);

    // 3. Persistir SONIDO / AUDIO (WAV sintético de 44 bytes de cabecera RIFF)
    console.log('\n[3/4] Persistiendo evidencia de SONIDO / AUDIO (Nota de voz / Audio ambiental WAV) en MinIO S3 + PostgreSQL...');
    const wavHeader = Buffer.from([
      0x52, 0x49, 0x46, 0x46, // "RIFF"
      0x24, 0x00, 0x00, 0x00, // Chunk size: 36 + data size (4) = 40
      0x57, 0x41, 0x56, 0x45, // "WAVE"
      0x66, 0x6d, 0x74, 0x20, // "fmt "
      0x10, 0x00, 0x00, 0x00, // Subchunk1Size (16 for PCM)
      0x01, 0x00,             // AudioFormat (1 = PCM)
      0x01, 0x00,             // NumChannels (1 mono)
      0x44, 0xac, 0x00, 0x00, // SampleRate (44100 Hz)
      0x88, 0x58, 0x01, 0x00, // ByteRate (44100 * 2)
      0x02, 0x00,             // BlockAlign (2)
      0x10, 0x00,             // BitsPerSample (16)
      0x64, 0x61, 0x74, 0x61, // "data"
      0x04, 0x00, 0x00, 0x00, // Subchunk2Size (4 bytes)
      0x00, 0x00, 0x00, 0x00  // 2 samples de audio silencio
    ]);

    const audioRes = await fetch('http://localhost:3000/v1/media/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        salaId: resolvedSalaUuid,
        incidenteId: incId,
        tipo: 'audio',
        fileName: 'nota_voz_alertante.wav',
        dataUrl: `data:audio/wav;base64,${wavHeader.toString('base64')}`
      })
    });
    const audioJson = await audioRes.json();
    console.log('  -> Audio guardado:', audioJson.media);

    // 4. Persistir TEXTO (Mensajes RTT y texto del incidente)
    console.log('\n[4/4] Persistiendo evidencia de TEXTO (Mensajes RTT en PostgreSQL)...');
    const textoRes1 = await fetch('http://localhost:3000/v1/rtt/mensajes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        salaId: resolvedSalaUuid,
        rolAutor: 'ciudadano',
        texto: 'Por favor ayuden, un vehículo arrolló a un transeúnte en la Av. Bolívar frente a la Catedral.',
        esParcial: false
      })
    });
    const textoJson1 = await textoRes1.json();
    console.log('  -> Texto alertante persistido:', textoJson1);

    const textoRes2 = await fetch('http://localhost:3000/v1/rtt/mensajes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        salaId: resolvedSalaUuid,
        rolAutor: 'agente',
        texto: 'Copiado. Cuadrante CP-01 activado. Ambulancia SAV #04 de HUMNT despachada con ETA 4 minutos.',
        esParcial: false
      })
    });
    const textoJson2 = await textoRes2.json();
    console.log('  -> Texto operador persistido:', textoJson2);

    // 5. Verificación física y forense cruzada
    console.log('\n========================================================================');
    console.log('CONSULTA DIRECTA SQL EN BASE DE DATOS POSTGRESQL');
    console.log('========================================================================');
    const mediaCheck = await pgPool.query(
      `SELECT id, tipo, tipo_mime, tamano_bytes, clave_s3, fecha_captura FROM archivos_media WHERE sala_id = $1 ORDER BY fecha_captura ASC`,
      [resolvedSalaUuid]
    );
    console.table(mediaCheck.rows);

    const rttCheck = await pgPool.query(
      `SELECT id, rol_autor, texto, fecha_envio FROM mensajes_rtt WHERE sala_id = $1 ORDER BY fecha_envio ASC`,
      [resolvedSalaUuid]
    );
    console.table(rttCheck.rows);

    // 6. Verificación en MinIO S3 de ambos objetos
    console.log('\n========================================================================');
    console.log('CONSULTA DIRECTA S3 EN CONTENEDOR MINIO');
    console.log('========================================================================');
    for (const row of mediaCheck.rows) {
      const getCmd = new GetObjectCommand({
        Bucket: 'siae-media',
        Key: row.clave_s3
      });
      const s3Obj = await s3.send(getCmd);
      console.log(`✓ Verificado en MinIO: clave='${row.clave_s3}', ContentType='${s3Obj.ContentType}', ContentLength=${s3Obj.ContentLength} bytes`);
    }

    console.log('\n>>> AUDITORÍA COMPLETADA: IMAGEN, SONIDO/AUDIO Y TEXTO PERSISTEN Y SE RECUPERAN CON ÉXITO <<<\n');
  } catch (err) {
    console.error('Error durante la auditoría:', err);
    process.exit(1);
  } finally {
    await pgPool.end();
  }
}

runMultimediaTripletAudit();
