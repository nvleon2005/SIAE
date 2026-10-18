import { NextRequest } from "next/server";
import { getUserToken, backendFetch } from "@/lib/bff-helper";

export async function GET() {
  const token = await getUserToken();
  if (!token) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }
  return backendFetch("/v1/perfiles/me", { token, tag: "BFF /v1/perfiles/me GET" });
}

export async function PUT(request: NextRequest) {
  const token = await getUserToken();
  if (!token) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }
  const body = await request.json();
  return backendFetch("/v1/perfiles/me", {
    method: "PUT",
    body,
    token,
    tag: "BFF /v1/perfiles/me PUT",
  });
}

export async function POST(request: NextRequest) {
  const token = await getUserToken();
  if (!token) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }
  const body = await request.json();
  return backendFetch("/v1/perfiles", {
    method: "POST",
    body,
    token,
    tag: "BFF /v1/perfiles POST",
  });
}

export async function DELETE() {
  const token = await getUserToken();
  if (!token) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }
  return backendFetch("/v1/perfiles", {
    method: "DELETE",
    token,
    tag: "BFF /v1/perfiles DELETE",
  });
}
