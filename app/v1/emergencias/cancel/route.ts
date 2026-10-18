import { NextRequest } from "next/server";
import { getUserToken, backendFetch } from "@/lib/bff-helper";

export async function POST(request: NextRequest) {
  const token = await getUserToken();
  if (!token) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }
  const body = await request.json();
  return backendFetch("/v1/emergencias/cancel", {
    method: "POST",
    body,
    token,
    tag: "BFF /v1/emergencias/cancel POST",
  });
}
