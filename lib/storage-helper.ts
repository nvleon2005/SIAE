import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import pg from "pg";
import crypto from "crypto";

const { Pool } = pg;

// ─── Cliente MinIO S3 ──────────────────────────────────────────────────────────
const s3Endpoint = process.env.S3_ENDPOINT || "http://127.0.0.1:9000";
const s3AccessKey = process.env.MINIO_ROOT_USER || "siae_minio";
const s3SecretKey = process.env.MINIO_ROOT_PASSWORD || "siae_minio_pass";
export const BUCKET_MEDIA = process.env.S3_BUCKET_MEDIA || "siae-media";
export const BUCKET_GRABACIONES = process.env.S3_BUCKET_GRABACIONES || "siae-grabaciones";

export const s3Client = new S3Client({
  endpoint: s3Endpoint,
  region: "us-east-1",
  credentials: {
    accessKeyId: s3AccessKey,
    secretAccessKey: s3SecretKey,
  },
  forcePathStyle: true, // Requerido para direccionamiento por path en MinIO
});

// ─── Pool PostgreSQL ───────────────────────────────────────────────────────────
const pgPool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "siae",
  password: process.env.DB_PASSWORD || "siae_dev_pass",
  database: process.env.DB_NAME || "siae",
  max: 10,
  idleTimeoutMillis: 30000,
});

export interface UploadMediaOptions {
  salaId: string;
  incidenteId?: string;
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
  tipo: "foto" | "video" | "audio";
}

export interface UploadMediaResult {
  ok: boolean;
  mediaId: string;
  claveS3: string;
  bucket: string;
  tamanoBytes: number;
  tipoMime: string;
  error?: string;
}

/**
 * Asegura la existencia de una sala en PostgreSQL antes de asociar evidencia o mensajes.
 */
async function ensureSalaExists(salaId: string): Promise<string> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(salaId);
  const resolvedUuid = isUuid ? salaId : crypto.createHash("md5").update(salaId).digest("hex").replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");

  try {
    const check = await pgPool.query(`SELECT id FROM salas WHERE id = $1`, [resolvedUuid]);
    if (check.rows.length > 0) {
      return resolvedUuid;
    }

    // Crear registro en incidencias para satisfacer foreign key
    const incidenteId = crypto.randomUUID();
    await pgPool.query(
      `INSERT INTO incidencias (
         id, estado, codigo_tipificacion, texto_incidente, afectado, canales_activos, fecha_creacion, fecha_actualizacion
       ) VALUES ($1, 'encolada', 'MEDICO_GENERAL', 'Incidente con evidencia multimedia', 'yo_mismo', ARRAY['voz','rtt'], NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [incidenteId]
    );

    await pgPool.query(
      `INSERT INTO salas (
         id, incidente_id, estado, participantes, servidores_ice, fecha_creacion
       ) VALUES ($1, $2, 'activa', '[]'::jsonb, '[]'::jsonb, NOW())
       ON CONFLICT (id) DO NOTHING`,
      [resolvedUuid, incidenteId]
    );
    return resolvedUuid;
  } catch (err) {
    console.error("[StorageHelper] Error garantizando sala en Postgres:", err);
    return resolvedUuid;
  }
}

/**
 * Sube una fotografía o archivo de evidencia a MinIO (S3) y registra su fila en PostgreSQL (archivos_media).
 */
export async function uploadMediaEvidence(
  opts: UploadMediaOptions
): Promise<UploadMediaResult> {
  const mediaId = crypto.randomUUID();
  const safeSalaUuid = await ensureSalaExists(opts.salaId);
  const s3Key = `evidencias/${safeSalaUuid}/${Date.now()}_${opts.fileName}`;

  try {
    // 1. Guardar archivo binario en MinIO S3
    const putCmd = new PutObjectCommand({
      Bucket: BUCKET_MEDIA,
      Key: s3Key,
      Body: opts.fileBuffer,
      ContentType: opts.mimeType,
      Metadata: {
        "x-siae-sala-id": safeSalaUuid,
        "x-siae-media-id": mediaId,
        "x-siae-tipo": opts.tipo,
        "x-siae-uploaded-at": new Date().toISOString(),
      },
    });

    await s3Client.send(putCmd);

    // 2. Registrar metadatos en PostgreSQL (archivos_media) con consulta parametrizada contra SQLi
    let safeIncidenteUuid: string | null = null;
    if (opts.incidenteId) {
      const isIncUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(opts.incidenteId);
      safeIncidenteUuid = isIncUuid
        ? opts.incidenteId
        : crypto.createHash("md5").update(opts.incidenteId).digest("hex").replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
    }

    await pgPool.query(
      `INSERT INTO archivos_media (
         id, sala_id, incidente_id, tipo, tipo_mime, tamano_bytes, clave_s3, fecha_captura
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        mediaId,
        safeSalaUuid,
        safeIncidenteUuid,
        opts.tipo,
        opts.mimeType,
        opts.fileBuffer.length,
        s3Key,
      ]
    );

    return {
      ok: true,
      mediaId,
      claveS3: s3Key,
      bucket: BUCKET_MEDIA,
      tamanoBytes: opts.fileBuffer.length,
      tipoMime: opts.mimeType,
    };
  } catch (error) {
    console.error("[StorageHelper] Error subiendo evidencia a MinIO/Postgres:", error);
    return {
      ok: false,
      mediaId,
      claveS3: s3Key,
      bucket: BUCKET_MEDIA,
      tamanoBytes: opts.fileBuffer.length,
      tipoMime: opts.mimeType,
      error: String(error),
    };
  }
}

/**
 * Guarda un mensaje RTT o texto en PostgreSQL (mensajes_rtt).
 */
export async function persistRttMessage(opts: {
  salaId: string;
  rolAutor: "ciudadano" | "agente" | "interprete";
  texto: string;
  esParcial?: boolean;
}): Promise<{ ok: boolean; messageId: string }> {
  const messageId = crypto.randomUUID();
  const safeSalaUuid = await ensureSalaExists(opts.salaId);

  try {
    await pgPool.query(
      `INSERT INTO mensajes_rtt (
         id, sala_id, rol_autor, texto, es_parcial, fecha_envio
       ) VALUES ($1, $2, $3, $4, $5, NOW())`,
      [messageId, safeSalaUuid, opts.rolAutor, opts.texto, Boolean(opts.esParcial)]
    );
    return { ok: true, messageId };
  } catch (err) {
    console.error("[StorageHelper] Error guardando mensaje RTT en Postgres:", err);
    return { ok: false, messageId };
  }
}

/**
 * Lista las evidencias multimedia asociadas a una sala desde PostgreSQL y MinIO.
 */
export async function listMediaBySala(salaId: string) {
  const safeSalaUuid = await ensureSalaExists(salaId);
  try {
    const res = await pgPool.query(
      `SELECT id, sala_id, incidente_id, tipo, tipo_mime, tamano_bytes, clave_s3, fecha_captura
       FROM archivos_media
       WHERE sala_id = $1
       ORDER BY fecha_captura DESC`,
      [safeSalaUuid]
    );
    return res.rows;
  } catch (err) {
    console.error("[StorageHelper] Error consultando archivos_media:", err);
    return [];
  }
}
