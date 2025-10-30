import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const boats = await prisma.boat.findMany({
    include: { owner: true },
    orderBy: { createdAt: 'desc' },
  });
  return new Response(
    JSON.stringify(
      boats.map(boat => ({
        id: boat.id,
        name: boat.name,
        ownerName: boat.owner?.name || '',
        location: boat.location,
        capacity: boat.capacity,
      }))
    ),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.boat.delete({ where: { id } });
  return new Response(JSON.stringify({ message: '削除しました' }), { status: 200 });
}
