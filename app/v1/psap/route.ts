import { NextRequest } from "next/server";
import { backendFetch, getUserToken } from "@/lib/bff-helper";

export async function GET(request: NextRequest) {
  return backendFetch(`/v1/psap${request.nextUrl.search}`, {
    token: await getUserToken(request),
    tag: "BFF /v1/psap GET",
  });
}
