import { NextResponse } from 'next/server';
import type { FishingPlan } from '@/FishingPlan';

// 暫定的な釣りプランのモックデータ
const plans: FishingPlan[] = [
  {
    id: 1,
    title: '東京湾マダイ釣り体験',
    description: '初心者歓迎！経験豊富な船長がマダイ釣りのコツを教えます。',
    area: '三浦半島',
    fishTypes: ['マダイ', 'アジ'],
    price: 12000,
    maxCapacity: 8,
    departureTime: '07:00',
    returnTime: '14:00',
    meetingPlace: '三浦漁港',
    imageUrl: '/images/boat1.jpg',
    boatOwnerId: 101,
  },
  {
    id: 2,
    title: '相模湾シーバスジギング',
    description: '大物狙い！最新の魚群探知機でシーバスの群れを追います。',
    area: 'lluminate山',
    fishTypes: ['シーバス', 'タチウオ'],
    price: 15000,
    maxCapacity: 6,
    departureTime: '06:30',
    returnTime: '15:00',
    meetingPlace: '湘南マリーナ',
    imageUrl: '/images/boat2.jpg',
    boatOwnerId: 102,
  },
  {
    id: 3,
    title: '金沢八景沖 アジ五目釣り',
    description: '家族で楽しめるアジ釣りプラン。釣った魚は居酒屋で調理可能！',
    area: '金沢八景',
    fishTypes: ['アジ', 'サバ', 'イワシ'],
    price: 9000,
    maxCapacity: 10,
    departureTime: '08:00',
    returnTime: '13:00',
    meetingPlace: '八景島シーサイドステーション',
    imageUrl: '/images/boat3.jpg',
    boatOwnerId: 103,
  },
];

/**
 * 釣りプラン一覧を取得するAPI
 * @route GET /api/plans
 */
export async function GET() {
  // 実際のアプリケーションではここでデータベースからデータを取得します
  return NextResponse.json(plans);
}

/**
 * 新しい釣りプランを作成するAPI
 * @route POST /api/plans
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, area, fishTypes, price, maxCapacity, departureTime, returnTime, meetingPlace } = body;

    // 簡単なバリデーション
    if (!title || !description || !area || !fishTypes || !price || !maxCapacity || !departureTime || !returnTime || !meetingPlace) {
      return NextResponse.json({ message: '必須項目が不足しています。' }, { status: 400 });
    }

    const newPlan: FishingPlan = {
      id: plans.length + 1, // 簡易的なID採番
      ...body,
    };

    // 本来はここでデータベースに保存します
    plans.push(newPlan);
    console.log('新しいプランが追加されました:', newPlan);

    return NextResponse.json({ message: 'プランが正常に作成されました。', plan: newPlan }, { status: 201 });
  } catch (error) {
    console.error('プラン作成エラー:', error);
    return NextResponse.json({ message: 'サーバーでエラーが発生しました。' }, { status: 500 });
  }
}
