import { NextRequest, NextResponse } from "next/server";
import { mapBackendRoleToFrontend } from "@/lib/role-mapping";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://127.0.0.1:8050";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get("siae_token")?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${BACKEND_API_URL}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (!backendRes.ok) {
      if (backendRes.status === 401 || backendRes.status === 403) {
        return NextResponse.json({ authenticated: false }, { status: backendRes.status });
      }
      return NextResponse.json(
        { error: "No se pudo validar la sesión con el backend" },
        { status: 503 }
      );
    }

    const payload: unknown = await backendRes.json();
    const userData = isRecord(payload) && isRecord(payload.user) ? payload.user : payload;
    if (!isRecord(userData)) {
      return NextResponse.json({ error: "Respuesta de sesión inválida" }, { status: 502 });
    }

    const id = typeof userData.id === "string" ? userData.id : undefined;
    const email =
      typeof userData.correo_electronico === "string"
        ? userData.correo_electronico
        : typeof userData.username === "string" ? userData.username : undefined;
    if (!id || !email) {
      return NextResponse.json(
        { error: "El backend no devolvió la identidad completa de la sesión" },
        { status: 502 }
      );
    }

    const role = mapBackendRoleToFrontend(
      typeof userData.role === "string" ? userData.role : "user"
    );
    const name =
      typeof userData.nombre_completo === "string"
        ? userData.nombre_completo
        : typeof userData.name === "string" ? userData.name : email.split("@")[0];

    return NextResponse.json({
      authenticated: true,
      user: {
        id,
        correo_electronico: email,
        nombre_completo: name,
        role,
      },
    });
  } catch (error) {
    console.error("[BFF /v1/auth/session] Backend unavailable:", error);
    return NextResponse.json(
      { error: "No se pudo validar la sesión con el backend" },
      { status: 503 }
    );
  }
}
