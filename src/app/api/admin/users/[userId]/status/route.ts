import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    // 管理者認証は本番では必須（省略可）
    const { approvalStatus } = await req.json();
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(approvalStatus)) {
      return new Response(JSON.stringify({ error: '不正なステータス値です' }), { status: 400 });
    }
    await prisma.user.update({
      where: { id: params.userId },
      data: { approvalStatus },
    });
    return new Response(JSON.stringify({ message: 'ステータス更新完了' }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
