import { NextRequest } from "next/server";
import { getUserToken, backendFetch } from "@/lib/bff-helper";

export async function GET() {
  const token = await getUserToken();
  if (!token) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }
  return backendFetch("/v1/contactos", { token, tag: "BFF /v1/contactos GET" });
}

export async function POST(request: NextRequest) {
  const token = await getUserToken();
  if (!token) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }
  const body = await request.json();
  return backendFetch("/v1/contactos", {
    method: "POST",
    body,
    token,
    tag: "BFF /v1/contactos POST",
  });
}
