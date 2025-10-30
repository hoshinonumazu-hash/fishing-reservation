import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    const { userId } = params;

    // 自分自身を削除しようとしていないかチェック
    if (userId === decoded.userId) {
      return new Response(
        JSON.stringify({ error: '自分自身を削除することはできません' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ユーザーを削除
    await prisma.user.delete({
      where: { id: userId },
    });

    return new Response(
      JSON.stringify({ message: 'ユーザーを削除しました' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('ユーザー削除エラー:', error);
    
    // ユーザーが存在しない場合
    if (error.code === 'P2025') {
      return new Response(
        JSON.stringify({ error: 'ユーザーが見つかりません' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'サーバーエラー', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
