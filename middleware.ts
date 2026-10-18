import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Rutas públicas (sin autenticación requerida) ───────────────────────────
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/admin/login",
  "/",
  "/tipificar",
  "/ubicacion",
  "/confirmar",
  "/sala",       // WebSocket JWT propio del backend
  "/onboarding", // Accesible post-registro antes de cookie
  "/offline",
  "/camino-seguro",
  "/historial",
  "/perfil",
  "/ajustes",
];

// ─── Roles que constituyen personal operativo (no son solicitantes) ──────────
const STAFF_ROLES = new Set([
  "admin",
  "operador",
  "operator",
  "despachador",
  "dispatcher",
  "supervisor",
  "interprete_lsv",
]);

// ─── Tabla de acceso por ruta → roles permitidos ─────────────────────────────
// Cada entrada define qué roles pueden acceder a ese prefijo de ruta.
// Si el rol no está en la lista → se redirige a su home propio.
const ROUTE_ACL: Array<{ prefix: string; allowed: Set<string> }> = [
  // Consola de triaje Operador (+ Supervisor, Despachador y Admin en modo sala unificada)
  {
    prefix: "/operador",
    allowed: new Set(["operador", "operator", "supervisor", "interprete_lsv", "despachador", "dispatcher", "admin"]),
  },
  // Consola táctica CAD Despachador (+ Supervisor, Operador y Admin)
  {
    prefix: "/despachador",
    allowed: new Set(["despachador", "dispatcher", "supervisor", "operador", "operator", "admin"]),
  },
  // Centro de intermediación LSV: Intérprete + Operador + Supervisor + Admin
  {
    prefix: "/admin/cint",
    allowed: new Set(["interprete_lsv", "operador", "supervisor", "admin"]),
  },
  // Gestión de usuarios y administración: SOLO admin global
  {
    prefix: "/admin/usuarios",
    allowed: new Set(["admin"]),
  },
  // Auditoría: solo admin y supervisor
  {
    prefix: "/admin/audit",
    allowed: new Set(["admin", "supervisor"]),
  },
  // Ajustes de puesto para todo el personal operativo
  {
    prefix: "/admin/ajustes",
    allowed: STAFF_ROLES,
  },
  // Panel PSAP principal (/admin): Supervisor controla sala general; admin lo usa para auditoria
  // Operador y Despachador tienen sus consolas propias y NO acceden aquí
  {
    prefix: "/admin",
    allowed: new Set(["supervisor", "admin"]),
  },
  // Panel de métricas y KPIs: solo admin y supervisor
  {
    prefix: "/dashboard",
    allowed: new Set(["admin", "supervisor"]),
  },
];

// ─── Destino home por rol (consola principal de cada rol) ────────────────────
function getHomeByRole(role: string): string {
  switch (role) {
    case "admin":          return "/dashboard";
    case "operador":
    case "operator":       return "/operador";
    case "despachador":
    case "dispatcher":     return "/despachador";
    case "supervisor":     return "/admin";
    case "interprete_lsv": return "/admin/cint";
    default:               return "/";  // solicitante → inicio PWA
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar archivos estáticos, APIs internas y recursos Next.js
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/v1") ||
    pathname.startsWith("/icons") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token    = request.cookies.get("siae_token")?.value;
  const role     = (request.cookies.get("siae_role")?.value ?? "").toLowerCase();
  const isAuth   = Boolean(token);
  const isStaff  = STAFF_ROLES.has(role);
  const isCitizen = isAuth && !isStaff;

  // ── 1. Ruta pública ──────────────────────────────────────────────────────
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isPublic) {
    // Autenticado intentando ir a login → redirigir a su home
    if (isAuth && (pathname === "/login" || pathname === "/register" || pathname === "/admin/login")) {
      return NextResponse.redirect(new URL(getHomeByRole(role), request.url));
    }
    // Solicitante autenticado en "/" → quedarse (es su portal)
    return NextResponse.next();
  }

  // ── 2. No autenticado → forzar login ────────────────────────────────────
  if (!isAuth) {
    const isStaffRoute =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/operador") ||
      pathname.startsWith("/despachador");
    const targetLogin = isStaffRoute ? "/admin/login" : "/login";
    const loginUrl = new URL(targetLogin, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 3. Solicitante intentando rutas de personal → su portal ─────────────
  if (isCitizen) {
    const isStaffRoute =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/operador") ||
      pathname.startsWith("/despachador");
    if (isStaffRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ── 4. Control de acceso por rol (ACL de rutas) ──────────────────────────
  // Buscar la regla más específica que coincida (orden importante: más específica primero)
  for (const rule of ROUTE_ACL) {
    const matches = pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`);
    if (matches) {
      if (!rule.allowed.has(role)) {
        // Rol no autorizado → redirigir a su consola propia sin exponer 403
        return NextResponse.redirect(new URL(getHomeByRole(role), request.url));
      }
      // Rol autorizado → continuar
      return NextResponse.next();
    }
  }

  // ── 5. Raíz "/" con personal operativo autenticado → su home ────────────
  if (pathname === "/" && isAuth && isStaff) {
    return NextResponse.redirect(new URL(getHomeByRole(role), request.url));
  }

  // ── 6. Cualquier otra ruta protegida → permitir si está autenticado ──────
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
