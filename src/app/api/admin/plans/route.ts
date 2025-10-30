import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const plans = await prisma.fishingPlan.findMany({
    include: { boat: true },
    orderBy: { createdAt: 'desc' },
  });
  return new Response(
    JSON.stringify(
      plans.map(plan => ({
        id: plan.id,
        title: plan.title,
        boatName: plan.boat?.name || '',
        price: plan.price,
        date: plan.date ? (typeof plan.date === 'string' ? plan.date : plan.date.toISOString().slice(0, 10)) : '',
      }))
    ),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.fishingPlan.delete({ where: { id } });
  return new Response(JSON.stringify({ message: '削除しました' }), { status: 200 });
}
