import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// 予約詳細を取得
export async function GET(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const bookingId = params.bookingId;

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
      return new Response(
        JSON.stringify({ message: '予約が見つかりません' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(booking),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('予約詳細取得エラー:', error);
    return new Response(
      JSON.stringify({
        message: 'サーバーエラーが発生しました',
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// 予約ステータスを更新（キャンセルなど）
export async function PATCH(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const bookingId = params.bookingId;
    const body = await req.json();
    const { status } = body;

    // バリデーション
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!status || !validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ message: '無効なステータスです' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 予約の存在確認
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return new Response(
        JSON.stringify({ message: '予約が見つかりません' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // キャンセル済みの予約は変更不可
    if (booking.status === 'CANCELLED' && status !== 'CANCELLED') {
      return new Response(
        JSON.stringify({ message: 'キャンセル済みの予約は変更できません' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
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

    return new Response(
      JSON.stringify({
        message: 'ステータスを更新しました',
        booking: updatedBooking,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('予約更新エラー:', error);
    return new Response(
      JSON.stringify({
        message: 'サーバーエラーが発生しました',
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// 予約を削除
export async function DELETE(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const bookingId = params.bookingId;

    // 予約の存在確認
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return new Response(
        JSON.stringify({ message: '予約が見つかりません' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 削除
    await prisma.booking.delete({
      where: { id: bookingId },
    });

    return new Response(
      JSON.stringify({ message: '予約を削除しました' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('予約削除エラー:', error);
    return new Response(
      JSON.stringify({
        message: 'サーバーエラーが発生しました',
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
