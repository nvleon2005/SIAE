import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({
    sala_id: id,
    token: "livekit-token-" + id,
    server_url: "ws://localhost:7880",
    url_websocket: `ws://localhost:8080/ws/sala/${id}`,
    joined_at: new Date().toISOString(),
  }, { status: 200 });
}
