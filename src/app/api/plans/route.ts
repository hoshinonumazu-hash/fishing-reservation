import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Next.js Route Handler - GET (プラン一覧取得)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const boatId = searchParams.get('boatId');
    const planId = searchParams.get('planId');
    const q = searchParams.get('q');
    const area = searchParams.get('area');
    const fishType = searchParams.get('fishType');
    const maxPrice = searchParams.get('maxPrice');

    // 特定のプランIDを取得
    if (planId) {
      const plan = await prisma.fishingPlan.findUnique({
        where: { id: String(planId) },
        include: {
          boat: true,
        },
      });

      if (!plan) {
        return new Response(
          JSON.stringify({ message: 'プランが見つかりません' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // フロントエンド互換のフォーマットに変換
      const formattedPlan = {
        id: plan.id,
        boatId: plan.boatId,
        title: plan.title,
        description: plan.description || '',
        area: plan.boat.location,
        fishTypes: plan.fishType.split(','),
        price: plan.price,
        maxCapacity: plan.maxPeople,
        departureTime: '07:00', // TODO: DBスキーマに追加
        returnTime: '12:00', // TODO: DBスキーマに追加
        meetingPlace: plan.boat.location,
        imageUrl: plan.boat.imageUrl || '',
        date: plan.date ? (typeof plan.date === 'string' ? plan.date : plan.date.toISOString()) : undefined,
      };

      return new Response(JSON.stringify(formattedPlan), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // フィルタリング条件の構築
    const where: any = {};

    if (boatId) {
      where.boatId = String(boatId);
    }

    if (fishType) {
      where.fishType = {
        contains: fishType,
      };
    }

    if (maxPrice) {
      where.price = {
        lte: Number(maxPrice),
      };
    }

    // プラン一覧を取得
    const plans = await prisma.fishingPlan.findMany({
      where,
      include: {
        boat: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // フロントエンド互換のフォーマットに変換
    const formattedPlans = plans.map((plan) => ({
      id: plan.id,
      boatId: plan.boatId,
      title: plan.title,
      description: plan.description || '',
      area: plan.boat.location,
      fishTypes: plan.fishType.split(','),
      price: plan.price,
      maxCapacity: plan.maxPeople,
      departureTime: '07:00', // TODO: DBスキーマに追加
      returnTime: '12:00', // TODO: DBスキーマに追加
      meetingPlace: plan.boat.location,
      imageUrl: plan.boat.imageUrl || '',
      date: plan.date ? (typeof plan.date === 'string' ? plan.date : plan.date.toISOString()) : undefined,
    }));

    // 追加のフィルタリング（クライアント側）
    let filtered = formattedPlans;

    if (q) {
      filtered = filtered.filter(
        (p) =>
          p.title.includes(q) ||
          p.description.includes(q) ||
          p.fishTypes.some((f) => f.includes(q))
      );
    }

    if (area) {
      filtered = filtered.filter((p) => p.area.includes(area));
    }

    return new Response(JSON.stringify(filtered), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('プラン取得エラー:', error);
    return new Response(
      JSON.stringify({
        message: 'プランの取得に失敗しました',
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST (プラン作成)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      area,
      price,
      fishTypes,
      fishType,
      imageUrl,
      description,
      maxCapacity,
      maxPeople,
      departureTime,
      returnTime,
      meetingPlace,
      boatId,
      weekday,
      date,
      duration,
      templateId,
    } = body;

    // 必須項目チェック
    if (!title) {
      return new Response(JSON.stringify({ message: 'タイトルの項目が未記入です' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (price === undefined || price === null || price === '') {
      return new Response(JSON.stringify({ message: '料金の項目が未記入です' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // fishTypesは未記入でもOK

    if (!boatId || typeof boatId !== 'string' || boatId.trim() === '') {
      return new Response(JSON.stringify({ message: '船の項目が未記入です' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // price型変換
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice)) {
      return new Response(JSON.stringify({ message: '料金が不正です' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // fishTypes配列をカンマ区切り文字列に変換（fishTypeも受け付ける）
    let fishTypeString = '';
    if (fishType && typeof fishType === 'string') {
      fishTypeString = fishType;
    } else if (typeof fishTypes === 'string') {
      fishTypeString = fishTypes;
    } else if (Array.isArray(fishTypes)) {
      fishTypeString = fishTypes.join(',');
    }

    if (!fishTypeString) {
      return new Response(JSON.stringify({ message: '対象魚種が不正です' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 船が存在するか確認
    const boat = await prisma.boat.findUnique({
      where: { id: String(boatId) },
    });

    if (!boat) {
      return new Response(JSON.stringify({ message: '指定された船が見つかりません' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // プランをDBに作成

    const newPlan = await prisma.fishingPlan.create({
      data: {
        title,
        description: description || '',
        fishType: fishTypeString,
        price: parsedPrice,
        duration: duration ? Number(duration) : 300, // デフォルト5時間
        maxPeople: maxPeople ? Number(maxPeople) : (maxCapacity ? Number(maxCapacity) : 10),
        date: date ? new Date(date) : new Date(),
        boatId: String(boatId),
        templateId: templateId ?? null,
      },
    });

    // フロントエンド互換のフォーマット
    const formattedPlan = {
      id: newPlan.id,
      boatId: newPlan.boatId,
      title: newPlan.title,
      description: newPlan.description || '',
      area: boat.location,
      fishTypes: newPlan.fishType.split(','),
      price: newPlan.price,
      maxCapacity: newPlan.maxPeople,
      departureTime: departureTime || '07:00',
      returnTime: returnTime || '12:00',
      meetingPlace: meetingPlace || boat.location,
      imageUrl: imageUrl || boat.imageUrl || '',
      weekday,
      date: newPlan.date ? (typeof newPlan.date === 'string' ? newPlan.date : newPlan.date.toISOString()) : undefined,
    };

    return new Response(
      JSON.stringify({ message: 'プランが追加されました', plan: formattedPlan }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('プラン作成エラー:', error);
    return new Response(
      JSON.stringify({
        message: 'プランの作成に失敗しました',
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
