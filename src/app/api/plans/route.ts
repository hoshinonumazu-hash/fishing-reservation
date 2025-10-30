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
      const p: any = plan as any;
      const startTime = p.startTime || '07:00';
      const endTime = p.endTime || (() => {
        const [sh, sm] = startTime.split(':').map(Number);
        const endTotal = sh * 60 + sm + plan.duration;
        const eh = String(Math.floor(endTotal / 60)).padStart(2, '0');
        const em = String(endTotal % 60).padStart(2, '0');
        return `${eh}:${em}`;
      })();
      const formattedPlan = {
        id: plan.id,
        boatId: plan.boatId,
        title: plan.title,
        description: plan.description || '',
        area: plan.boat.location,
        fishTypes: plan.fishType.split(','),
        price: plan.price,
        maxCapacity: plan.maxPeople,
        departureTime: startTime,
        returnTime: endTime,
        startTime,
        endTime,
        meetingPlace: (p.meetingPlace as string | null) || plan.boat.location,
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
    const formattedPlans = plans.map((plan) => {
      const p: any = plan as any;
      const startTime = p.startTime || '07:00';
      const endTime = p.endTime || (() => {
        const [sh, sm] = startTime.split(':').map(Number);
        const endTotal = sh * 60 + sm + plan.duration;
        const eh = String(Math.floor(endTotal / 60)).padStart(2, '0');
        const em = String(endTotal % 60).padStart(2, '0');
        return `${eh}:${em}`;
      })();

      return {
        id: plan.id,
        boatId: plan.boatId,
        title: plan.title,
        description: plan.description || '',
        fishType: plan.fishType,
        duration: plan.duration,
        maxPeople: plan.maxPeople,
        area: plan.boat.location,
        fishTypes: plan.fishType.split(','),
        price: plan.price,
        maxCapacity: plan.maxPeople,
        departureTime: startTime,
        returnTime: endTime,
        startTime: startTime,
        endTime: endTime,
        meetingPlace: (p.meetingPlace as string | null) || plan.boat.location,
        imageUrl: plan.boat.imageUrl || '',
        date: plan.date ? (typeof plan.date === 'string' ? plan.date : plan.date.toISOString()) : undefined,
        boat: {
          id: plan.boat.id,
          name: plan.boat.name,
          location: plan.boat.location,
        },
        template: plan.templateId ? {
          id: plan.templateId,
          name: plan.title, // テンプレート名がない場合はプラン名を使用
        } : null,
      };
    });

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
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return new Response(JSON.stringify({ error: '認証情報がありません' }), { status: 401 });
    }
    // JWTからユーザーID取得
    const { getTokenPayload } = await import('@/lib/auth');
    const payload = getTokenPayload(token);
    if (!payload || !payload.userId) {
      return new Response(JSON.stringify({ error: '認証情報が不正です' }), { status: 401 });
    }
    // DBからユーザー取得
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.role !== 'BOAT_OWNER') {
      return new Response(JSON.stringify({ error: 'オーナー権限がありません' }), { status: 403 });
    }
    if (user.approvalStatus !== 'APPROVED') {
      return new Response(JSON.stringify({ error: 'アカウントが承認されていません' }), { status: 403 });
    }
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
      startTime,
      endTime,
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
      include: { owner: true },
    });

    if (!boat) {
      return new Response(JSON.stringify({ message: '指定された船が見つかりません' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // オーナーの承認ステータス確認
    if (boat.owner.role === 'BOAT_OWNER' && boat.owner.approvalStatus !== 'APPROVED') {
      return new Response(JSON.stringify({ message: 'オーナーアカウントが承認されていません' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 開始/終了とdurationの整合
    const toMinutes = (t?: string) => {
      if (!t || typeof t !== 'string') return null;
      const [h, m] = t.split(':').map((n: string) => Number(n));
      if (Number.isNaN(h) || Number.isNaN(m)) return null;
      return h * 60 + m;
    };
    const sTime = (startTime as string) || (departureTime as string) || '07:00';
    const eTime = (endTime as string) || (returnTime as string) || '12:00';
    const sMin = toMinutes(sTime);
    const eMin = toMinutes(eTime);
    const dur = typeof duration === 'number' ? duration : (sMin !== null && eMin !== null ? eMin - sMin : 300);

    // プランをDBに作成
    const newPlan = await prisma.fishingPlan.create({
      data: {
        title,
        description: description || '',
        fishType: fishTypeString,
        price: parsedPrice,
        duration: Number(dur),
        maxPeople: maxPeople ? Number(maxPeople) : (maxCapacity ? Number(maxCapacity) : 10),
        date: date ? new Date(date) : new Date(),
        boatId: String(boatId),
        templateId: templateId ?? null,
        startTime: sTime,
        endTime: eTime,
        meetingPlace: (meetingPlace as string) || boat.location,
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
  departureTime: sTime,
  returnTime: eTime,
  startTime: sTime,
  endTime: eTime,
  meetingPlace: (meetingPlace as string) || boat.location,
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
