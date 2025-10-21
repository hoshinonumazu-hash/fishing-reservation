
import { NextRequest } from 'next/server';
import type { FishingPlan } from '../../../types';

// ダミーデータ（FishingPlan型に準拠）
let plans: FishingPlan[] = [
  {
    id: 1,
    boatId: 1,
    title: '三浦半島 マダイ釣り半日コース',
    description: '初心者向け！マダイを狙う半日コース',
    area: '三浦半島',
    fishTypes: ['マダイ', 'イサキ'],
    price: 12000,
    maxCapacity: 10,
    departureTime: '07:00',
    returnTime: '12:00',
    meetingPlace: '三浦港',
    imageUrl: '',
    weekday: '土',
  },
  {
    id: 2,
    boatId: 1,
    title: '三浦半島 アジ五目釣り',
    description: 'アジ・サバ・イサキが狙える五目釣り',
    area: '三浦半島',
    fishTypes: ['アジ', 'サバ', 'イサキ'],
    price: 9000,
    maxCapacity: 8,
    departureTime: '06:00',
    returnTime: '11:00',
    meetingPlace: '三浦港',
    imageUrl: '',
    weekday: '日',
  },
  {
    id: 3,
    boatId: 2,
    title: '館山 シーバス船',
    description: 'ルアーフィッシング専門船',
    area: '館山',
    fishTypes: ['シーバス', 'タチウオ'],
    price: 15000,
    maxCapacity: 6,
    departureTime: '17:00',
    returnTime: '22:00',
    meetingPlace: '館山港',
    imageUrl: '',
    weekday: '金',
  },
];




// Next.js Route Handler
export async function GET(req: NextRequest) {
  // クエリパラメータでboatId指定時はその船のプランのみ返す
  const { searchParams } = new URL(req.url);
  const boatId = searchParams.get('boatId');
  let filtered = plans;
  if (boatId) {
    filtered = plans.filter((p) => String(p.boatId) === String(boatId));
  }
  return new Response(JSON.stringify(filtered), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      area,
      price,
      fishTypes,
      imageUrl,
      description,
      maxCapacity,
      departureTime,
      returnTime,
      meetingPlace,
      boatId,
      weekday,
    } = body;
    // 必須項目チェック
    if (!title || !area || price === undefined || !fishTypes || !boatId || !weekday) {
      return new Response(JSON.stringify({ message: '必須項目が不足しています' }), {
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
    // fishTypes配列チェック
    let parsedFishTypes = fishTypes;
    if (typeof fishTypes === 'string') {
      parsedFishTypes = fishTypes.split(',').map((f: string) => f.trim()).filter((f: string) => f);
    }
    if (!Array.isArray(parsedFishTypes) || parsedFishTypes.length === 0) {
      return new Response(JSON.stringify({ message: '対象魚種が不正です' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const newPlan: FishingPlan = {
      id: plans.length + 1,
      boatId: Number(boatId),
      title,
      area,
      price: parsedPrice,
      fishTypes: parsedFishTypes,
      imageUrl: imageUrl || '',
      description: description || '',
      maxCapacity: maxCapacity !== undefined ? Number(maxCapacity) : 0,
      departureTime: departureTime || '',
      returnTime: returnTime || '',
      meetingPlace: meetingPlace || '',
      weekday,
    };
    plans.push(newPlan);
    return new Response(JSON.stringify({ message: 'プランが追加されました', plan: newPlan }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ message: 'リクエストのパースに失敗しました' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
