export const runtime = "nodejs";
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

    // ユーザー存在チェック（ロールは問わず自分の船一覧は取得可）
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return new Response(
        JSON.stringify({ message: 'セッションが無効です。再ログインしてください' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // オーナーの船舶を取得（memo, recentFishも含める）
    const boats = await prisma.boat.findMany({
      where: { ownerId: userId },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        capacity: true,
        imageUrl: true,
        memo: true,
        recentFish: true,
        allowMultipleBookings: true,
      },
    });

    return new Response(JSON.stringify(boats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('船舶取得エラー:', error);
    return new Response(
      JSON.stringify({
        message: 'サーバーエラーが発生しました',
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(req: NextRequest) {
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
    } catch {
      return new Response(
        JSON.stringify({ message: 'トークンが無効です' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = decoded.userId as string;

    // ユーザー取得（BOAT_OWNERでなければ自動昇格してから作成）
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return new Response(
        JSON.stringify({ message: 'セッションが無効です。再ログインしてください' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (user.role !== 'BOAT_OWNER' && user.role !== 'ADMIN') {
      user = await prisma.user.update({ where: { id: userId }, data: { role: 'BOAT_OWNER' } });
    }

    const body = await req.json();
    const { name, location, capacity, description, imageUrl, memo, recentFish, allowMultipleBookings } = body || {};

    // バリデーション
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(JSON.stringify({ message: '船名は必須です' }), { status: 400 });
    }
    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      return new Response(JSON.stringify({ message: '所在地は必須です' }), { status: 400 });
    }
    const cap = Number(capacity);
    if (!Number.isInteger(cap) || cap <= 0) {
      return new Response(JSON.stringify({ message: '定員は1以上の整数で指定してください' }), { status: 400 });
    }

    // 追加
    const boat = await prisma.boat.create({
      data: {
        name: name.trim(),
        location: location.trim(),
        capacity: cap,
        description: description ? String(description) : null,
        imageUrl: imageUrl ? String(imageUrl) : null,
        memo: memo ? String(memo) : null,
        recentFish: recentFish ? String(recentFish) : null,
        allowMultipleBookings: allowMultipleBookings !== undefined ? Boolean(allowMultipleBookings) : true,
        ownerId: userId,
      },
    });

    return new Response(JSON.stringify(boat), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('船舶作成エラー:', error);
    const anyErr: any = error;
    const payload = {
      message: 'サーバーエラーが発生しました',
      error: anyErr?.message || String(error),
      code: anyErr?.code,
      meta: anyErr?.meta,
    };
    return new Response(JSON.stringify(payload), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
