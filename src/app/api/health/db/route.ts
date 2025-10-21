import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const rows: any = await prisma.$queryRawUnsafe("SELECT NOW() as now");
    return NextResponse.json({ ok: true, now: rows?.[0]?.now ?? null });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
