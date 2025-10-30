import { getTokenPayload } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return new Response(JSON.stringify({ error: '認証情報がありません' }), { status: 401 });
    }
    const payload = getTokenPayload(token);
    if (!payload || !payload.userId) {
      return new Response(JSON.stringify({ error: '認証情報が不正です' }), { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.role !== 'BOAT_OWNER') {
      return new Response(JSON.stringify({ error: 'オーナー権限がありません' }), { status: 403 });
    }
    if (user.approvalStatus !== 'APPROVED') {
      return new Response(JSON.stringify({ error: 'アカウントが承認されていません' }), { status: 403 });
    }
    // ...既存の船登録処理...
    return new Response(JSON.stringify({ message: '船登録成功' }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
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
