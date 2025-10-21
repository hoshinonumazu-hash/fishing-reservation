export const runtime = "nodejs";
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const boats = await prisma.boat.findMany({
      select: {
        id: true,
        name: true,
        ownerId: true,
        location: true, // 出港エリア
        capacity: true,
        imageUrl: true,
        memo: true,
        recentFish: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return new Response(JSON.stringify(boats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ message: 'DBエラー', error: String(e) }), { status: 500 });
  }
}
