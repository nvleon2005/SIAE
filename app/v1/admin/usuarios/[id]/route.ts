import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAdminToken(request);
  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const backendRes = await fetch(`${BACKEND_API_URL}/v1/admin/usuarios/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    const data = await backendRes.json().catch(() => ({}));
    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error(`[BFF /v1/admin/usuarios/${id} PATCH] Error:`, err);
    return NextResponse.json(
      { error: "Servicio no disponible temporalmente" },
      { status: 503 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAdminToken(request);
  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  try {
    console.log("[BFF DELETE] sending to backend:", `${BACKEND_API_URL}/v1/admin/usuarios/${encodeURIComponent(id)}`, "Token present:", !!token);
    const backendRes = await fetch(`${BACKEND_API_URL}/v1/admin/usuarios/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    const data = await backendRes.json().catch(() => ({}));
    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error(`[BFF /v1/admin/usuarios/${id} DELETE] Error:`, err);
    return NextResponse.json(
      { error: "Servicio no disponible temporalmente" },
      { status: 503 }
    );
  }
}
