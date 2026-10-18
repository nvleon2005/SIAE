import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Sesión cerrada" }, { status: 200 });

  // Limpiar cookies HttpOnly de sesión
  const cookieBase = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0, // Expiración inmediata
  };

  response.cookies.set("siae_token", "", { ...cookieBase, expires: new Date(0) });
  response.cookies.set("siae_role", "", { ...cookieBase, httpOnly: false, expires: new Date(0) });

  return response;
}
