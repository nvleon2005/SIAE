import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { mapFrontendRoleToBackend } from "@/lib/role-mapping";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://127.0.0.1:8050";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("siae_token")?.value ?? null;
  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
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
    const backendRes = await fetch(
      `${BACKEND_API_URL}/v1/admin/usuarios/${encodeURIComponent(id)}/role`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: backendRole }),
        signal: AbortSignal.timeout(10000),
      }
    );

    const data = await backendRes.json().catch(() => ({}));
    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error(`[BFF /v1/admin/usuarios/${id}/role PATCH] Error:`, err);
    return NextResponse.json(
      { error: "Servicio no disponible temporalmente" },
      { status: 503 }
    );
  }
}
