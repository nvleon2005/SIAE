import { NextRequest, NextResponse } from "next/server";
import { backendFetch, getUserToken } from "@/lib/bff-helper";

async function authorizeAdmin(request: NextRequest): Promise<
  { token: string } | { response: NextResponse }
> {
  const token = await getUserToken(request);
  if (!token) {
    return { response: NextResponse.json({ error: "Autenticación requerida" }, { status: 401 }) };
  }

  const response = await backendFetch("/v1/auth/me", {
    token,
    tag: "BFF /v1/geo/cuadrantes auth",
    timeout: 4000,
  });
  if (response.status === 401 || response.status === 403) {
    return { response: NextResponse.json({ error: "No autorizado" }, { status: response.status }) };
  }
  if (!response.ok) {
    return { response: NextResponse.json({ error: "No se pudo validar la sesión administrativa" }, { status: 503 }) };
  }

  let data: { role?: unknown; user?: { role?: unknown } };
  try {
    data = await response.json();
  } catch {
    return { response: NextResponse.json({ error: "Respuesta de autorización inválida" }, { status: 502 }) };
  }

  const role = String(data.user?.role ?? data.role ?? "").toLowerCase();
  if (role !== "admin" && role !== "supervisor") {
    return { response: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };
  }
  return { token };
}

async function proxyRequest(
  request: NextRequest,
  method: "GET" | "POST" | "PUT" | "DELETE",
) {
  const authorization = method === "GET" ? null : await authorizeAdmin(request);
  if (authorization && "response" in authorization) return authorization.response;

  let body: unknown;
  if (method === "POST" || method === "PUT") {
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
    }
  }

  return backendFetch(`/v1/geo/cuadrantes${request.nextUrl.search}`, {
    method,
    body,
    token: authorization && "token" in authorization ? authorization.token : await getUserToken(request),
    tag: `BFF /v1/geo/cuadrantes ${method}`,
    timeout: 5000,
  });
}

export async function GET(request: NextRequest) {
  return proxyRequest(request, "GET");
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, "POST");
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, "PUT");
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, "DELETE");
}
