import { NextRequest, NextResponse } from "next/server";
import { mapBackendRoleToFrontend } from "@/lib/role-mapping";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://127.0.0.1:8050";

export async function POST(request: NextRequest) {
  let body: {
    correo_electronico?: string;
    email?: string;
    username?: string;
    password?: string;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  const email = (body.correo_electronico ?? body.email ?? body.username ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!email && !password) {
    return NextResponse.json(
      { error: "Correo electrónico o usuario y contraseña son requeridos" },
      { status: 400 }
    );
  }

  if (!email) {
    return NextResponse.json(
      { error: "El correo electrónico o identificador de usuario es requerido" },
      { status: 400 }
    );
  }

  if (!password) {
    return NextResponse.json(
      { error: "La contraseña es requerida para iniciar sesión" },
      { status: 400 }
    );
  }

  try {
    const backendRes = await fetch(`${BACKEND_API_URL}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
      signal: AbortSignal.timeout(8000),
    });

    if (!backendRes.ok) {
      const errText = await backendRes.text();
      let errorMsg = "Credenciales incorrectas";
      try {
        const errJson = JSON.parse(errText) as { message?: string; error?: string };
        errorMsg = errJson.message ?? errJson.error ?? errorMsg;
      } catch {
        if (errText) errorMsg = errText;
      }
      return NextResponse.json({ error: errorMsg }, { status: backendRes.status });
    }

    let data: {
      id?: string;
      token?: string;
      access_token?: string;
      user?: { id?: string; username?: string; role?: string; name?: string; nombre_completo?: string };
    };
    try {
      data = await backendRes.json();
    } catch {
      return NextResponse.json({ error: "Respuesta de autenticación inválida" }, { status: 502 });
    }

    const token = data.token ?? data.access_token;
    const userId = data.user?.id ?? data.id;
    if (!token || !userId) {
      return NextResponse.json(
        { error: "El backend no devolvió una sesión válida" },
        { status: 502 }
      );
    }

    const frontendRole = mapBackendRoleToFrontend(data.user?.role ?? "user");
    const rawName = data.user?.nombre_completo ?? data.user?.name ?? data.user?.username;
    const userName = rawName && !/^[0-9a-f-]{36}$/i.test(rawName)
      ? rawName
      : email.split("@")[0];
    const response = NextResponse.json(
      {
        id: userId,
        correo_electronico: email,
        nombre_completo: userName,
        role: frontendRole,
      },
      { status: 200 }
    );

    const isHttps = request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
    const cookieOpts = {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60,
    };
    response.cookies.set("siae_token", token, cookieOpts);
    response.cookies.set("siae_role", frontendRole, { ...cookieOpts, httpOnly: false });
    response.cookies.set("siae_name", encodeURIComponent(userName), { ...cookieOpts, httpOnly: false });
    response.cookies.set("siae_email", encodeURIComponent(email), { ...cookieOpts, httpOnly: false });
    return response;
  } catch (error) {
    console.error("[BFF /v1/auth/login] Backend unavailable:", error);
    return NextResponse.json(
      { error: "Servicio de autenticación no disponible temporalmente" },
      { status: 503 }
    );
  }
}
