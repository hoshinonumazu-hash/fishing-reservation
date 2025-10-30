import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenPayload } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return new Response(JSON.stringify({ error: '認証情報がありません' }), { status: 401 });
    }
    const payload = getTokenPayload(token);
    if (!payload || payload.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: '管理者権限がありません' }), { status: 403 });
    }
    const userId = params.userId;
    await prisma.user.update({
      where: { id: userId },
      data: { approvalStatus: 'REJECTED' },
    });
    return new Response(JSON.stringify({ message: '拒否しました' }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
