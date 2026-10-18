import { NextRequest, NextResponse } from "next/server";
import { backendFetch, getUserToken } from "@/lib/bff-helper";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  return backendFetch(`/v1/salas/${encodeURIComponent(id)}/join`, {
    method: "POST",
    body,
    token: await getUserToken(request),
    tag: "BFF /v1/salas/[id]/unirse POST",
  });
}
