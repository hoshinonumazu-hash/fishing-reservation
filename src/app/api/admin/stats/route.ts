import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenPayload } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return new Response(JSON.stringify({ error: '認証情報がありません' }), { status: 401 });
    }
    const payload = getTokenPayload(token);
    if (!payload || payload.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: '管理者権限がありません' }), { status: 403 });
    }
    // 今月の期間
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    // 今月の予約件数（APPROVEDのみ）
    const monthlyBookings = await prisma.booking.count({
      where: {
        status: 'APPROVED',
        createdAt: { gte: firstDay, lte: lastDay },
      },
    });
    // 今月の売上
    const monthlyRevenueAgg = await prisma.booking.aggregate({
      where: {
        status: 'APPROVED',
        createdAt: { gte: firstDay, lte: lastDay },
      },
      _sum: { totalPrice: true },
    });
    const monthlyRevenue = monthlyRevenueAgg._sum.totalPrice || 0;
    // 今月の新規登録ユーザー数
    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: firstDay, lte: lastDay },
      },
    });
    // 承認待ちオーナー数
    const pendingOwners = await prisma.user.count({
      where: {
        role: 'BOAT_OWNER',
        approvalStatus: 'PENDING',
      },
    });
    return new Response(
      JSON.stringify({ monthlyBookings, monthlyRevenue, newUsers, pendingOwners }),
      { status: 200 }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
