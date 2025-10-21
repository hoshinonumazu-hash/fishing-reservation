import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, name, phone, email, participants, date, message } = body;

    // バリデーション
    if (!planId) {
      return new Response(
        JSON.stringify({ message: 'プランIDが指定されていません' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!name || !name.trim()) {
      return new Response(
        JSON.stringify({ message: 'お名前を入力してください' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!phone || !phone.trim()) {
      return new Response(
        JSON.stringify({ message: '電話番号を入力してください' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!/^[0-9-]+$/.test(phone)) {
      return new Response(
        JSON.stringify({ message: '電話番号は数字とハイフンのみで入力してください' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!participants || participants < 1) {
      return new Response(
        JSON.stringify({ message: '参加人数は1名以上を指定してください' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // プランの存在確認とデータ取得
    const plan = await prisma.fishingPlan.findUnique({
      where: { id: String(planId) },
      include: {
        boat: true, // 船の情報も取得（allowMultipleBookings設定を含む）
      },
    });

    if (!plan) {
      return new Response(
        JSON.stringify({ message: '指定されたプランが見つかりません' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (participants > plan.maxPeople) {
      return new Response(
        JSON.stringify({ message: `定員は${plan.maxPeople}名までです` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 合計金額を計算
    const totalPrice = plan.price * participants;

    // 船の設定を確認
    const allowMultiple = plan.boat.allowMultipleBookings;

    // 同じプラン・同じ日の既存予約を確認
    const existingBookings = await prisma.booking.findMany({
      where: {
        planId: String(planId),
        status: {
          in: ['PENDING', 'CONFIRMED'], // キャンセル・完了は除外
        },
      },
    });

    // 複数予約を許可しない場合は、既に予約があればエラー
    if (!allowMultiple && existingBookings.length > 0) {
      return new Response(
        JSON.stringify({ 
          message: 'この船は貸切専用です。既に別の予約が入っているため、この日程は予約できません。',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 既に予約がある場合は承認待ち(PENDING)、初めての予約は自動承認(CONFIRMED)
    // ただし、複数予約を許可しない設定の場合は、ここには到達しない
    const initialStatus = (allowMultiple && existingBookings.length > 0) ? 'PENDING' : 'CONFIRMED';

    // 既存予約の合計人数をチェック（定員オーバーを防ぐ）- 複数予約許可時のみ
    if (allowMultiple) {
      const totalBookedPeople = existingBookings.reduce(
        (sum, booking) => sum + booking.numberOfPeople, 
        0
      );

      if (totalBookedPeople + participants > plan.maxPeople) {
        return new Response(
          JSON.stringify({ 
            message: `定員オーバーです。現在${totalBookedPeople}名の予約があり、残り${plan.maxPeople - totalBookedPeople}名まで予約可能です。`,
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // ゲストユーザーとして予約を作成
    // TODO: ログインユーザーの場合はuserIdを使用
    // 現在はダミーのゲストユーザーIDを使用
    let guestUserId = 'guest_user';
    
    // ゲストユーザーが存在しない場合は作成
    const guestUser = await prisma.user.findUnique({
      where: { email: 'guest@temporary.com' },
    });

    if (!guestUser) {
      // ゲストユーザーを作成
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('guest', 10);
      // phoneNumberを一意にする（日時＋ランダム値）
      const uniquePhone = `guest-${Date.now()}-${Math.floor(Math.random()*10000)}`;
      const newGuestUser = await prisma.user.create({
        data: {
          email: 'guest@temporary.com',
          phoneNumber: uniquePhone,
          password: hashedPassword,
          name: name,
          role: 'CUSTOMER',
        },
      });
      guestUserId = newGuestUser.id;
    } else {
      guestUserId = guestUser.id;
    }

    // 予約をDBに保存
    const booking = await prisma.booking.create({
      data: {
        userId: guestUserId,
        planId: String(planId),
        numberOfPeople: participants,
        customerName: name,
        customerPhone: phone,
        totalPrice: totalPrice,
        status: initialStatus,
      },
      include: {
        plan: {
          include: {
            boat: true,
          },
        },
      },
    });

    console.log('予約作成成功:', booking);

    // メッセージを状態に応じて変更
    const responseMessage = initialStatus === 'CONFIRMED' 
      ? '予約が完了しました！' 
      : '予約を受け付けました。他の予約があるため、オーナーの承認をお待ちください。';

    return new Response(
      JSON.stringify({
        message: responseMessage,
        booking: {
          id: booking.id,
          planId: booking.planId,
          name: booking.customerName,
          phone: booking.customerPhone,
          participants: booking.numberOfPeople,
          totalPrice: booking.totalPrice,
          status: booking.status,
          createdAt: booking.createdAt,
        },
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('予約APIエラー:', error);
    return new Response(
      JSON.stringify({
        message: 'サーバーエラーが発生しました',
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// 予約一覧取得
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    const bookings = await prisma.booking.findMany({
      where: userId ? { userId } : {},
      include: {
        plan: {
          include: {
            boat: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return new Response(
      JSON.stringify(bookings),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('予約一覧取得エラー:', error);
    return new Response(
      JSON.stringify({
        message: 'サーバーエラーが発生しました',
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
