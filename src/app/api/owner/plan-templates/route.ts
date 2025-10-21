import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// テンプレート一覧取得
export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // オーナーの船舶を取得
    const boats = await prisma.boat.findMany({
      where: { ownerId: decoded.userId },
      select: { id: true }
    });
    
    const boatIds = boats.map(b => b.id);
    
    // その船舶のテンプレート一覧を取得
    const templates = await prisma.planTemplate.findMany({
      where: {
        boatId: { in: boatIds }
      },
      include: {
        boat: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('テンプレート取得エラー:', error);
    return NextResponse.json({ error: 'テンプレート取得に失敗しました' }, { status: 500 });
  }
}

// テンプレート新規作成
export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const body = await request.json();

    const { name, description, fishType, price, departureTime, returnTime, maxPeople, boatId } = body;

    // バリデーション
    if (!name || !fishType || !price || !departureTime || !returnTime || !maxPeople || !boatId) {
      return NextResponse.json({ error: '必須項目が入力されていません' }, { status: 400 });
    }

    // 船舶の所有権確認
    const boat = await prisma.boat.findFirst({
      where: {
        id: boatId,
        ownerId: decoded.userId
      }
    });

    if (!boat) {
      return NextResponse.json({ error: '指定された船舶が見つかりません' }, { status: 404 });
    }

    // テンプレート作成
    const template = await prisma.planTemplate.create({
      data: {
        name,
        description,
        fishType,
        price: parseInt(price),
        departureTime,
        returnTime,
        maxPeople: parseInt(maxPeople),
        boatId
      },
      include: {
        boat: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('テンプレート作成エラー:', error);
    return NextResponse.json({ error: 'テンプレート作成に失敗しました' }, { status: 500 });
  }
}
