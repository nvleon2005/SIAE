import { backendFetch } from "@/lib/bff-helper";

export async function GET() {
  return backendFetch("/v1/catalogos/categorias", {
    tag: "BFF /v1/catalogos/categorias GET",
  });
}
