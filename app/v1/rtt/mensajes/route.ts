import { NextRequest, NextResponse } from "next/server";
import { persistRttMessage } from "@/lib/storage-helper";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const salaId = body.salaId || body.sala_id;
    const rolAutor = body.rolAutor || body.rol_autor || "ciudadano";
    const texto = (body.texto || "").trim();
    const esParcial = Boolean(body.esParcial);

    if (!salaId || !texto) {
      return NextResponse.json(
        { error: "salaId y texto son campos requeridos" },
        { status: 400 }
      );
    }

    const result = await persistRttMessage({
      salaId,
      rolAutor,
      texto,
      esParcial,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: "No se pudo registrar el mensaje RTT en PostgreSQL" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        messageId: result.messageId,
        mensaje: "Mensaje RTT persistido en PostgreSQL (mensajes_rtt)",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /v1/rtt/mensajes] Error:", error);
    return NextResponse.json(
      { error: "Error interno registrando mensaje RTT" },
      { status: 500 }
    );
  }
}
