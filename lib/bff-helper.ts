import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://127.0.0.1:8050";

 

export async function getUserToken(req?: Request): Promise<string | null> {
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      return authHeader.slice(7).trim();
    }
  }
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("siae_token")?.value ?? null;
    if (token) return token;
  } catch {
    // cookies() can fail outside request context
  }
  return null;
}

export async function backendFetch(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string | null;
    tag?: string;
    timeout?: number;
  }
): Promise<NextResponse> {
  const { method = "GET", body, token, tag = "BFF", timeout = 10000 } = options;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const backendRes = await fetch(`${BACKEND_API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeout),
    });

    const data = await backendRes.json().catch(() => ({}));
    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(`[${tag}] Error:`, err);
    return NextResponse.json(
      { error: "Servicio no disponible temporalmente" },
      { status: 503 }
    );
  }
}
