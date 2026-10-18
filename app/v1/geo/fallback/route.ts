import { backendFetch } from "@/lib/bff-helper";

export async function GET() {
  return backendFetch("/v1/geo/fallback", { tag: "BFF /v1/geo/fallback GET" });
}
