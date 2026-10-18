import { NextRequest } from "next/server";
import { backendFetch } from "@/lib/bff-helper";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return Response.json(
      { error: "Parámetros 'lat' y 'lng' requeridos" },
      { status: 400 }
    );
  }

  return backendFetch(
    `/v1/geo/resolve?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
    { tag: "BFF /v1/geo/resolve GET" }
  );
}
