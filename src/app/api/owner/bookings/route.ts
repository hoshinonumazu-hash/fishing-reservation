import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function GET(req: NextRequest) {
  try {
    // 認証チェック
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ message: '認証が必要です' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.substring(7);
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return new Response(
        JSON.stringify({ message: 'トークンが無効です' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = decoded.userId;

    // ユーザーがBOAT_OWNERか確認
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'BOAT_OWNER') {
      return new Response(
        JSON.stringify({ message: 'アクセス権限がありません' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // オーナーの船舶を取得
    const boats = await prisma.boat.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });

    const boatIds = boats.map((b) => b.id);

    // それらの船のプランを取得
    const plans = await prisma.fishingPlan.findMany({
      where: { boatId: { in: boatIds } },
      select: { id: true },
    });

    const planIds = plans.map((p) => p.id);

    // それらのプランの予約を取得
    const bookings = await prisma.booking.findMany({
      where: { planId: { in: planIds } },
      include: {
        plan: {
          include: {
            boat: true,
            template: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return new Response(JSON.stringify(bookings), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('予約取得エラー:', error);
    return new Response(
      JSON.stringify({
        message: 'サーバーエラーが発生しました',
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
