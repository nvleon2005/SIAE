import { NextRequest } from "next/server";
import { getUserToken, backendFetch } from "@/lib/bff-helper";

export async function POST(request: NextRequest) {
  const token = await getUserToken();
  if (!token) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }
  const body = await request.json();
  return backendFetch("/v1/incidentes", {
    method: "POST",
    body,
    token,
    tag: "BFF /v1/incidentes POST",
    timeout: 15000,
  });
}

export async function GET() {
  const token = await getUserToken();
  if (!token) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }
  return backendFetch("/v1/incidentes", { token, tag: "BFF /v1/incidentes GET" });
}
