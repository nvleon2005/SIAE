import { NextRequest, NextResponse } from "next/server";
import { listMediaBySala } from "@/lib/storage-helper";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const records = await listMediaBySala(id);
    return NextResponse.json({
      salaId: id,
      total: records.length,
      evidencias: records,
    });
  } catch (error) {
    console.error("[API /v1/media/sala/[id]] Error:", error);
    return NextResponse.json({ error: "Error consultando evidencias" }, { status: 500 });
  }
}
