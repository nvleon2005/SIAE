import { NextRequest, NextResponse } from "next/server";
import { mapBackendRoleToFrontend } from "@/lib/role-mapping";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://127.0.0.1:8050";

export async function POST(request: NextRequest) {
  let body: {
    nombre_completo?: string;
    correo_electronico?: string;
    password?: string;
  } = {};

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  const nombre   = (body.nombre_completo ?? "").trim();
  const email    = (body.correo_electronico ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Correo electrónico y contraseña son requeridos" },
      { status: 400 }
    );
  }

  // Política mínima de contraseña (8 caracteres)
  if (password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres" },
      { status: 400 }
    );
  }

  // Validación estricta: No permitir caracteres especiales como acentos
  const ACCENT_REGEX = /[áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛñÑçÇ´`^¨~]/;
  if (nombre && ACCENT_REGEX.test(nombre)) {
    return NextResponse.json(
      { error: "El registro no permite acentos en el nombre. Use solo letras estándar (ej: Maria en vez de María)." },
      { status: 400 }
    );
  }

  if (nombre && !/^[a-zA-Z\s]+$/.test(nombre)) {
    return NextResponse.json(
      { error: "El nombre solo puede contener letras de la A a la Z y espacios (sin caracteres especiales)." },
      { status: 400 }
    );
  }

  if (ACCENT_REGEX.test(email)) {
    return NextResponse.json(
      { error: "El correo electrónico no puede contener acentos." },
      { status: 400 }
    );
  }

  if (ACCENT_REGEX.test(password)) {
    return NextResponse.json(
      { error: "La contraseña no puede contener acentos ni tildes." },
      { status: 400 }
    );
  }

  // ── Llamada al backend Go real ──────────────────────────────────────────
  try {
    const backendRes = await fetch(`${BACKEND_API_URL}/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre_completo:   nombre || email.split("@")[0],
        username:          email,
        correo_electronico: email,
        password,
        role: "user", // Los ciudadanos siempre se registran con rol user
      }),
      signal: AbortSignal.timeout(8000),
    });

    const responseText = await backendRes.text().catch(() => "");
    let responseData: Record<string, unknown> = {};
    try { responseData = JSON.parse(responseText) as Record<string, unknown>; } catch { /* ok */ }

    if (!backendRes.ok) {
      const errorMsg =
        (responseData.error as string) ??
        (responseData.message as string) ??
        "No se pudo completar el registro";
      return NextResponse.json({ error: errorMsg }, { status: backendRes.status });
    }

    // Registro exitoso — el backend retorna { id, message, user: { id, username, role } }
    const userId    = (responseData.id as string) ??
                      ((responseData.user as Record<string, unknown>)?.id as string);
    if (!userId) {
      return NextResponse.json(
        { error: "El backend registró la solicitud sin devolver un identificador de usuario" },
        { status: 502 }
      );
    }
    const userRole  = (
                        (responseData.user as Record<string, unknown>)?.role as string
                      ) ?? "user";
    const frontendRole = mapBackendRoleToFrontend(userRole);

    // Emitir sesión automática post-registro: login inmediato
    const loginRes = await fetch(`${BACKEND_API_URL}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
      signal: AbortSignal.timeout(8000),
    });

    if (!loginRes.ok) {
      return NextResponse.json(
        { error: "La cuenta fue creada, pero no se pudo iniciar sesión automáticamente. Inicia sesión." },
        { status: 503 }
      );
    }
    const loginData = await loginRes.json().catch(() => ({})) as {
      token?: string;
      access_token?: string;
    };
    const token = loginData.token ?? loginData.access_token;
    if (!token) {
      return NextResponse.json(
        { error: "La cuenta fue creada, pero el backend no devolvió una sesión válida. Inicia sesión." },
        { status: 503 }
      );
    }

    const response = NextResponse.json(
      {
        id:               userId,
        correo_electronico: email,
        nombre_completo:  nombre || email.split("@")[0],
        role:             frontendRole,
        authenticated:    true,
        message:          "Registro completado. ¡Bienvenido a SIAE!",
      },
      { status: 201 }
    );

    // Emitir cookies de sesión si el login automático fue exitoso
    if (token) {
      const isHttps = request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
      const cookieOpts = {
        httpOnly: true,
        secure:   isHttps,
        sameSite: "lax" as const,
        path:     "/",
        maxAge:   60 * 60, // 1 hora
      };

      response.cookies.set("siae_token", token, cookieOpts);
      response.cookies.set("siae_role",  frontendRole, { ...cookieOpts, httpOnly: false });
      response.cookies.set("siae_name",  encodeURIComponent(nombre || email.split("@")[0]), { ...cookieOpts, httpOnly: false });
      response.cookies.set("siae_email", encodeURIComponent(email), { ...cookieOpts, httpOnly: false });
    }

    return response;
  } catch (err) {
    console.error("[BFF /v1/auth/register] Backend unreachable:", err);
    return NextResponse.json(
      { error: "Servicio de registro no disponible temporalmente" },
      { status: 503 }
    );
  }
}
