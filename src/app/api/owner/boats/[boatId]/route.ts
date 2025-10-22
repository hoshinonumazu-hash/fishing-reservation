export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// 船舶情報取得
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ boatId: string }> }
) {
  const params = await context.params;
  const boatId = params.boatId;

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

    // 船舶を取得
    const boat = await prisma.boat.findUnique({
      where: { id: boatId },
    });

    if (!boat) {
      return new Response(
        JSON.stringify({ message: '船舶が見つかりません' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // オーナー確認
    if (boat.ownerId !== userId) {
      return new Response(
        JSON.stringify({ message: 'この船舶の編集権限がありません' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(boat), {
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

// 船舶情報更新
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ boatId: string }> }
) {
  const params = await context.params;
  const boatId = params.boatId;

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

    // 船舶を取得
    const boat = await prisma.boat.findUnique({
      where: { id: boatId },
    });

    if (!boat) {
      return new Response(
        JSON.stringify({ message: '船舶が見つかりません' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // オーナー確認
    if (boat.ownerId !== userId) {
      return new Response(
        JSON.stringify({ message: 'この船舶の編集権限がありません' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // リクエストボディを取得
  const body = await req.json();
  const { name, description, location, capacity, imageUrl, memo, recentFish, allowMultipleBookings } = body;

    // バリデーション
    if (!name || !name.trim()) {
      return new Response(
        JSON.stringify({ message: '船名を入力してください' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!location || !location.trim()) {
      return new Response(
        JSON.stringify({ message: '出港エリアを入力してください' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!capacity || capacity < 1) {
      return new Response(
        JSON.stringify({ message: '定員は1名以上を指定してください' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 船舶情報を更新
    const updatedBoat = await prisma.boat.update({
      where: { id: boatId },
      data: {
        name,
        description: description || null,
        location,
        capacity: Number(capacity),
        imageUrl: imageUrl || null,
        memo: memo ?? null,
        recentFish: recentFish ?? null,
        allowMultipleBookings: allowMultipleBookings !== undefined ? Boolean(allowMultipleBookings) : undefined,
      },
    });

    return new Response(
      JSON.stringify({
        message: '船舶情報を更新しました',
        boat: updatedBoat,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('船舶更新エラー:', error);
    return new Response(
      JSON.stringify({
        message: 'サーバーエラーが発生しました',
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// 船舶削除（プランや予約がある場合は409）
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ boatId: string }> }
) {
  const params = await context.params;
  const boatId = params.boatId;

  try {

    // 認証
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ message: '認証が必要です' }), { status: 401 });
    }
    let decoded: any;
    try {
      decoded = jwt.verify(authHeader.substring(7), JWT_SECRET);
    } catch {
      return new Response(JSON.stringify({ message: 'トークンが無効です' }), { status: 401 });
    }
    const userId = decoded.userId;

    const boat = await prisma.boat.findUnique({ where: { id: boatId } });
    if (!boat) return new Response(JSON.stringify({ message: '船舶が見つかりません' }), { status: 404 });
    if (boat.ownerId !== userId) return new Response(JSON.stringify({ message: '削除権限がありません' }), { status: 403 });

    // 紐づくプランやテンプレートも一括削除（DBのonDelete: Cascadeに依存）
    await prisma.boat.delete({ where: { id: boatId } });
    return new Response(JSON.stringify({ message: '削除しました' }), { status: 200 });
  } catch (error) {
    console.error('船舶削除エラー:', error);
    return new Response(JSON.stringify({ message: 'サーバーエラー' }), { status: 500 });
  }
}
