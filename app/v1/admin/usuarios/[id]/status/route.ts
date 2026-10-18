import { NextRequest } from "next/server";
import { getUserToken, backendFetch } from "@/lib/bff-helper";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getUserToken();
  if (!token) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return Response.json({ error: "ID requerido" }, { status: 400 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  return backendFetch(`/v1/admin/usuarios/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body,
    token,
    tag: `BFF /v1/admin/usuarios/${id}/status PATCH`,
  });
}
