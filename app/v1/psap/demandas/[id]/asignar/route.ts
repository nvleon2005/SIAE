import { NextRequest, NextResponse } from "next/server";
import { backendFetch, getUserToken } from "@/lib/bff-helper";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  const { id } = await params;
  return backendFetch(`/v1/psap/demandas/${encodeURIComponent(id)}/asignar`, {
    method: "POST",
    body,
    token: await getUserToken(request),
    tag: "BFF /v1/psap/demandas/[id]/asignar POST",
  });
}
