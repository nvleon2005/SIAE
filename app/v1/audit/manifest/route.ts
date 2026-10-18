import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "La API de auditoría forense no está configurada.",
      code: "AUDIT_SERVICE_UNAVAILABLE",
    },
    { status: 501 },
  );
}
