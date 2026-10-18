import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { mapBackendRoleToFrontend, mapFrontendRoleToBackend } from "@/lib/role-mapping";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://127.0.0.1:8050";

async function getAdminToken(request?: NextRequest): Promise<string | null> {
  if (request) {
    const auth = request.headers.get("authorization");
    if (auth && auth.startsWith("Bearer ")) {
      return auth.slice(7);
    }
  }
  const cookieStore = await cookies();
  return cookieStore.get("siae_token")?.value ?? null;
}

async function proxyToBackend(
  method: string,
  path: string,
  token: string,
  body?: unknown
): Promise<Response> {
  const opts: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal: AbortSignal.timeout(10000),
  };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }
  return fetch(`${BACKEND_API_URL}${path}`, opts);
}

// GET /v1/admin/usuarios — Lista todos los usuarios del sistema
export async function GET(request: NextRequest) {
  const token = await getAdminToken(request);
  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  const backendPath = `/v1/admin/usuarios${queryString ? `?${queryString}` : ""}`;

  try {
    const backendRes = await proxyToBackend("GET", backendPath, token);
    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    const rawData = data as { usuarios?: Array<Record<string, unknown>>; total?: number };
    const usuarios = (rawData.usuarios ?? []).map((u) => ({
      ...u,
      role: mapBackendRoleToFrontend((u.role as string) ?? ""),
    }));

    return NextResponse.json({
      usuarios,
      total: rawData.total ?? usuarios.length,
    });
  } catch (err) {
    console.error("[BFF /v1/admin/usuarios GET] Error:", err);
    return NextResponse.json(
      { error: "Servicio no disponible temporalmente" },
      { status: 503 }
    );
  }
}

// POST /v1/admin/usuarios — Crear nuevo usuario del sistema (solo admin)
export async function POST(request: NextRequest) {
  const token = await getAdminToken(request);
  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const frontendRole = (body.role as string) ?? "";
  const backendRole = mapFrontendRoleToBackend(frontendRole);

  try {
    const backendRes = await proxyToBackend("POST", "/v1/admin/usuarios", token, {
      ...body,
      role: backendRole,
    });
    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[BFF /v1/admin/usuarios POST] Error:", err);
    return NextResponse.json(
      { error: "Servicio no disponible temporalmente" },
      { status: 503 }
    );
  }
}
