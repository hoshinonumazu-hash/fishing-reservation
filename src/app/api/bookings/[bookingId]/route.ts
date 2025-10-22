import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 予約詳細を取得
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  const params = await context.params;
  const bookingId = params.bookingId;

  try {

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        plan: {
          include: {
            boat: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { message: '予約が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('予約詳細取得エラー:', error);
    return NextResponse.json(
      {
        message: 'サーバーエラーが発生しました',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// 予約ステータスを更新(キャンセルなど)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  const params = await context.params;
  const bookingId = params.bookingId;

  try {
    const body = await request.json();
    const { status } = body;

    // バリデーション
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { message: '無効なステータスです' },
        { status: 400 }
      );
    }

    // 予約の存在確認
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { message: '予約が見つかりません' },
        { status: 404 }
      );
    }

    // キャンセル済みの予約は変更不可
    if (booking.status === 'CANCELLED' && status !== 'CANCELLED') {
      return NextResponse.json(
        { message: 'キャンセル済みの予約は変更できません' },
        { status: 400 }
      );
    }

    // ステータス更新
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        plan: {
          include: {
            boat: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'ステータスを更新しました',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('予約更新エラー:', error);
    return NextResponse.json(
      {
        message: 'サーバーエラーが発生しました',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// 予約を削除
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  const params = await context.params;
  const bookingId = params.bookingId;

  try {

    // 予約の存在確認
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { message: '予約が見つかりません' },
        { status: 404 }
      );
    }

    // 削除
    await prisma.booking.delete({
      where: { id: bookingId },
    });

    return NextResponse.json({ message: '予約を削除しました' });
  } catch (error) {
    console.error('予約削除エラー:', error);
    return NextResponse.json(
      {
        message: 'サーバーエラーが発生しました',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
