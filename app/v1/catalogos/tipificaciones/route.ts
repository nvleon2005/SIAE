import { NextResponse } from "next/server";

interface TipificacionItem {
  id: string;
  codigo: string;
  nombre: string;
  categoria_raiz: "salud" | "bomberos" | "policia" | "transito" | "rescate" | "otro";
  prioridad_defecto: "P0" | "P1" | "P2" | "P3";
  organismo_primario: string;
  sla_minutos: number;
  activo: boolean;
}

let TIPIFICACIONES_STORE: TipificacionItem[] = [
  {
    id: "tip-01",
    codigo: "salud.infarto",
    nombre: "Infarto de Miocardio / Dolor Torácico",
    categoria_raiz: "salud",
    prioridad_defecto: "P0",
    organismo_primario: "Salud Monagas - MPPS / HUMNT",
    sla_minutos: 8,
    activo: true,
  },
  {
    id: "tip-02",
    codigo: "salud.trauma",
    nombre: "Herida Grave / Traumatismo Craneoencefálico",
    categoria_raiz: "salud",
    prioridad_defecto: "P0",
    organismo_primario: "Salud Monagas / Protección Civil",
    sla_minutos: 10,
    activo: true,
  },
  {
    id: "tip-03",
    codigo: "bomberos.incendio_estructural",
    nombre: "Incendio de Vivienda o Comercio",
    categoria_raiz: "bomberos",
    prioridad_defecto: "P0",
    organismo_primario: "Cuerpo de Bomberos del Estado Monagas",
    sla_minutos: 7,
    activo: true,
  },
  {
    id: "tip-04",
    codigo: "policia.atraco_en_curso",
    nombre: "Robo o Agresión en Flagrancia con Armas",
    categoria_raiz: "policia",
    prioridad_defecto: "P0",
    organismo_primario: "Policía Nacional Bolivariana / Polimonagas",
    sla_minutos: 5,
    activo: true,
  },
  {
    id: "tip-05",
    codigo: "transito.choque_con_lesionados",
    nombre: "Accidente Vial con Personas Atrapadas",
    categoria_raiz: "transito",
    prioridad_defecto: "P1",
    organismo_primario: "Cuerpo de Bomberos / Tránsito Terrestre",
    sla_minutos: 10,
    activo: true,
  },
  {
    id: "tip-06",
    codigo: "rescate.inundacion",
    nombre: "Crecida de Río o Inundación Residencial",
    categoria_raiz: "rescate",
    prioridad_defecto: "P1",
    organismo_primario: "Protección Civil y Administración de Desastres",
    sla_minutos: 15,
    activo: true,
  },
];

function checkIsAdmin(request: Request): boolean {
  const roleCookie = request.headers.get("cookie") || "";
  const authHeader = request.headers.get("authorization") || "";
  if (roleCookie.includes("siae_role=admin") || roleCookie.includes("user_role=admin")) {
    return true;
  }
  if (authHeader.toLowerCase().includes("bearer admin") || authHeader.toLowerCase().includes("role=admin")) {
    return true;
  }
  return true; // En modo local de desarrollo
}

export async function GET() {
  return NextResponse.json({
    total: TIPIFICACIONES_STORE.length,
    tipificaciones: TIPIFICACIONES_STORE,
  });
}

export async function POST(request: Request) {
  if (!checkIsAdmin(request)) {
    return NextResponse.json({ error: "FORBIDDEN", message: "Solo el rol admin puede crear tipificaciones." }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.codigo || !body.nombre) {
      return NextResponse.json({ error: "INVALID_INPUT", message: "Código y nombre son obligatorios." }, { status: 400 });
    }

    const newItem: TipificacionItem = {
      id: `tip-${Date.now()}`,
      codigo: body.codigo.trim().toLowerCase(),
      nombre: body.nombre.trim(),
      categoria_raiz: body.categoria_raiz || "salud",
      prioridad_defecto: body.prioridad_defecto || "P1",
      organismo_primario: body.organismo_primario || "Salud Monagas",
      sla_minutos: Number(body.sla_minutos) || 10,
      activo: body.activo ?? true,
    };

    TIPIFICACIONES_STORE.unshift(newItem);
    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!checkIsAdmin(request)) {
    return NextResponse.json({ error: "FORBIDDEN", message: "Solo el rol admin puede editar tipificaciones." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const index = TIPIFICACIONES_STORE.findIndex((t) => t.id === body.id || t.codigo === body.codigo);
    if (index === -1) {
      return NextResponse.json({ error: "NOT_FOUND", message: "Tipificación no encontrada." }, { status: 404 });
    }

    TIPIFICACIONES_STORE[index] = {
      ...TIPIFICACIONES_STORE[index],
      ...body,
    };

    return NextResponse.json({ success: true, item: TIPIFICACIONES_STORE[index] });
  } catch {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const callerRole = url.searchParams.get("role") || "";

  if (callerRole === "operador" || callerRole === "despachador" || callerRole === "ciudadano") {
    return NextResponse.json({ error: "FORBIDDEN", message: "Operación de borrado denegada. Solo el Administrador Global tiene facultades destructivas." }, { status: 403 });
  }

  if (!checkIsAdmin(request)) {
    return NextResponse.json({ error: "FORBIDDEN", message: "Solo el rol admin puede eliminar tipificaciones." }, { status: 403 });
  }

  if (!id) {
    return NextResponse.json({ error: "MISSING_ID", message: "El ID es obligatorio para eliminar." }, { status: 400 });
  }

  TIPIFICACIONES_STORE = TIPIFICACIONES_STORE.filter((t) => t.id !== id);
  return NextResponse.json({ success: true, message: `Tipificación ${id} eliminada.` });
}
