import { NextRequest } from "next/server";
import { backendFetch } from "@/lib/bff-helper";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get("categoria");
  if (!categoria) {
    return Response.json({ error: "Parámetro 'categoria' requerido" }, { status: 400 });
  }

  return backendFetch(
    `/v1/catalogos/subtipos?categoria=${encodeURIComponent(categoria)}`,
    { tag: "BFF /v1/catalogos/subtipos GET" }
  );
}
