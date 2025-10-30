import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function GET(req: NextRequest) {
  try {
    // JWT検証
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: '認証が必要です' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: '無効なトークンです' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ADMIN権限チェック
    if (decoded.role !== 'ADMIN') {
      return new Response(
        JSON.stringify({ error: '権限がありません' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 全予約を取得
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        plan: {
          include: {
            boat: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return new Response(
      JSON.stringify(bookings),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('全予約取得エラー:', error);
    return new Response(
      JSON.stringify({ error: 'サーバーエラー', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
