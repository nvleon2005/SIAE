import { NextResponse } from "next/server";

function unavailable() {
  return NextResponse.json(
    {
      error: "El servicio de gestión de claves no está conectado al backend.",
      code: "KEY_MANAGEMENT_UNAVAILABLE",
    },
    { status: 501 },
  );
}

export async function GET() {
  return unavailable();
}

export async function POST() {
  return unavailable();
}
