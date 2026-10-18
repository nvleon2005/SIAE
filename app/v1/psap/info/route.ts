import { NextRequest } from "next/server";
import { getUserToken, backendFetch } from "@/lib/bff-helper";

export async function GET() {
  const token = await getUserToken();
  if (!token) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }
  return backendFetch("/v1/psap/info", { token, tag: "BFF /v1/psap/info GET" });
}
