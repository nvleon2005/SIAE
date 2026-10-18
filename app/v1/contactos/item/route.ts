import { NextRequest } from "next/server";
import { getUserToken, backendFetch } from "@/lib/bff-helper";

export async function PUT(request: NextRequest) {
  const token = await getUserToken();
  if (!token) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return Response.json({ error: "id requerido" }, { status: 400 });
  }

  const body = await request.json();
  return backendFetch(`/v1/contactos/item?id=${id}`, {
    method: "PUT",
    body,
    token,
    tag: "BFF /v1/contactos/item PUT",
  });
}

export async function DELETE(request: NextRequest) {
  const token = await getUserToken();
  if (!token) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return Response.json({ error: "id requerido" }, { status: 400 });
  }

  return backendFetch(`/v1/contactos/item?id=${id}`, {
    method: "DELETE",
    token,
    tag: "BFF /v1/contactos/item DELETE",
  });
}
