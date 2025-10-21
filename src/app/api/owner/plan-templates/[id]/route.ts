import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// テンプレート詳細取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const template = await prisma.planTemplate.findFirst({
      where: {
        id: params.id,
        boat: {
          ownerId: decoded.userId
        }
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

    if (!template) {
      return NextResponse.json({ error: 'テンプレートが見つかりません' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('テンプレート取得エラー:', error);
    return NextResponse.json({ error: 'テンプレート取得に失敗しました' }, { status: 500 });
  }
}

// テンプレート更新
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const body = await request.json();

    // テンプレートの所有権確認
    const existingTemplate = await prisma.planTemplate.findFirst({
      where: {
        id: params.id,
        boat: {
          ownerId: decoded.userId
        }
      }
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: 'テンプレートが見つかりません' }, { status: 404 });
    }

  const { name, description, fishType, price, departureTime, returnTime, maxPeople } = body;

    // テンプレート更新
    const updatedTemplate = await prisma.planTemplate.update({
      where: { id: params.id },
      data: {
        name,
        description,
        fishType,
        price: price ? parseInt(price) : undefined,
        departureTime,
        returnTime,
        maxPeople: maxPeople ? parseInt(maxPeople) : undefined
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

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('テンプレート更新エラー:', error);
    return NextResponse.json({ error: 'テンプレート更新に失敗しました' }, { status: 500 });
  }
}

// テンプレート削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // テンプレートの所有権確認
    const template = await prisma.planTemplate.findFirst({
      where: {
        id: params.id,
        boat: {
          ownerId: decoded.userId
        }
      }
    });

    if (!template) {
      return NextResponse.json({ error: 'テンプレートが見つかりません' }, { status: 404 });
    }

    // テンプレート削除
    await prisma.planTemplate.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'テンプレートを削除しました' });
  } catch (error) {
    console.error('テンプレート削除エラー:', error);
    return NextResponse.json({ error: 'テンプレート削除に失敗しました' }, { status: 500 });
  }
}
