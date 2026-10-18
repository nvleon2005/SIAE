import { NextRequest, NextResponse } from "next/server";
import { uploadMediaEvidence } from "@/lib/storage-helper";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let salaId: string | undefined;
    let incidenteId: string | undefined;
    let fileName: string | undefined;
    let mimeType: string | undefined;
    let fileBuffer: Buffer | null = null;
    let tipo: "foto" | "video" | "audio" = "foto";

    // 1. Soporte JSON Base64 (capturas directas de cámara, notas de voz o canvas)
    if (contentType.includes("application/json")) {
      const body: unknown = await request.json();
      if (typeof body !== "object" || body === null || Array.isArray(body)) {
        return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
      }
      const payload = body as Record<string, unknown>;
      const rawSalaId = payload.salaId ?? payload.sala_id ?? payload.demandId;
      if (typeof rawSalaId !== "string" || !rawSalaId.trim()) {
        return NextResponse.json({ error: "Se requiere el identificador de la sala" }, { status: 400 });
      }
      salaId = rawSalaId;
      incidenteId = typeof payload.incidenteId === "string"
        ? payload.incidenteId
        : typeof payload.incidente_id === "string" ? payload.incidente_id : undefined;
      fileName = typeof payload.fileName === "string" ? payload.fileName : undefined;
      const rawTipo = payload.tipo;
      if (rawTipo !== "foto" && rawTipo !== "video" && rawTipo !== "audio") {
        return NextResponse.json({ error: "Tipo de evidencia inválido" }, { status: 400 });
      }
      tipo = rawTipo;

      const base64Data = payload.dataUrl ?? payload.base64 ?? payload.image;
      if (typeof base64Data !== "string" || !base64Data) {
        return NextResponse.json(
          { error: "Se requiere un archivo de evidencia" },
          { status: 400 }
        );
      }

      const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches && matches[1] && matches[2]) {
        mimeType = matches[1];
        fileBuffer = Buffer.from(matches[2], "base64");
      } else {
        return NextResponse.json({ error: "Formato de archivo de evidencia inválido" }, { status: 400 });
      }
    }
    // 2. Soporte Multipart Form Data (subida de archivos por input type="file")
    else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const rawSalaId = formData.get("salaId");
      if (typeof rawSalaId !== "string" || !rawSalaId.trim()) {
        return NextResponse.json({ error: "Se requiere el identificador de la sala" }, { status: 400 });
      }
      salaId = rawSalaId;
      incidenteId = (formData.get("incidenteId") as string) || undefined;
      const rawTipo = formData.get("tipo") as string;
      if (rawTipo !== "foto" && rawTipo !== "video" && rawTipo !== "audio") {
        return NextResponse.json({ error: "Tipo de evidencia inválido" }, { status: 400 });
      }
      tipo = rawTipo;

      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "Se requiere un archivo en el campo 'file'" },
          { status: 400 }
        );
      }

      fileName = file.name;
      mimeType = file.type;
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      return NextResponse.json(
        { error: "Content-Type no soportado. Use application/json o multipart/form-data" },
        { status: 415 }
      );
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json(
        { error: "El archivo está vacío o no se pudo decodificar" },
        { status: 400 }
      );
    }
    if (
      !salaId ||
      !fileName ||
      !mimeType ||
      !/^(image|video|audio)\//i.test(mimeType) ||
      mimeType === "image/svg+xml"
    ) {
      return NextResponse.json({ error: "Metadatos o tipo MIME de evidencia inválidos" }, { status: 400 });
    }
    if ((tipo === "foto" && !mimeType.startsWith("image/")) ||
        (tipo === "video" && !mimeType.startsWith("video/")) ||
        (tipo === "audio" && !mimeType.startsWith("audio/"))) {
      return NextResponse.json({ error: "El tipo de evidencia no coincide con el archivo" }, { status: 400 });
    }

    // Subir a MinIO S3 y registrar en PostgreSQL (archivos_media)
    const result = await uploadMediaEvidence({
      salaId,
      incidenteId,
      fileName,
      fileBuffer,
      mimeType,
      tipo,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: "Fallo al almacenar en MinIO", details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        mensaje: "Evidencia almacenada con éxito en MinIO S3 y registrada en PostgreSQL",
        media: {
          id: result.mediaId,
          bucket: result.bucket,
          clave_s3: result.claveS3,
          tamano_bytes: result.tamanoBytes,
          tipo_mime: result.tipoMime,
          almacenado_en: "MinIO S3 (siae-media)",
          base_de_datos: "PostgreSQL (archivos_media)",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /v1/media/upload] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor procesando archivo de medios" },
      { status: 500 }
    );
  }
}
