'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface BookingDetail {
  id: string;
  numberOfPeople: number;
  status: string;
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  updatedAt: string;
  plan: {
    id: string;
    title: string;
    description: string;
    fishType: string;
    price: number;
    duration: number;
    maxPeople: number;
    date: string;
    boat: {
      id: string;
      name: string;
      description: string;
      location: string;
      capacity: number;
      imageUrl: string | null;
      memo: string | null;
      recentFish: string | null;
    };
  };
}

export default function BookingDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  const isSuccess = searchParams.get('success') === 'true';

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookingDetail();
  }, [bookingId]);

  const fetchBookingDetail = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error('予約情報の取得に失敗しました');
      }
      const data = await response.json();
      setBooking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予約情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm('本当にこの予約をキャンセルしますか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (!response.ok) {
        throw new Error('キャンセルに失敗しました');
      }

      alert('予約をキャンセルしました');
      fetchBookingDetail();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'キャンセルに失敗しました');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: '予約確認中', color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: '予約確定', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'キャンセル済', color: 'bg-red-100 text-red-800' },
      COMPLETED: { label: '完了', color: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-4 py-2 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error || '予約が見つかりません'}
        </div>
        <Link
          href="/bookings"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          予約一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          ✅ 予約が完了しました！詳細は以下をご確認ください。
        </div>
      )}

      {booking.status === 'PENDING' && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
          ⏳ この予約は承認待ちです。同じプランに他の予約があるため、船のオーナーが承認するまでお待ちください。
        </div>
      )}

      <div className="mb-6">
        <Link
          href="/bookings"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← 予約一覧に戻る
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-blue-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">予約詳細</h1>
            {getStatusBadge(booking.status)}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 予約情報 */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">予約情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">予約番号</p>
                <p className="font-mono text-sm">{booking.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">予約日時</p>
                <p>{new Date(booking.createdAt).toLocaleString('ja-JP')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">お名前</p>
                <p className="font-bold">{booking.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">電話番号</p>
                <p>{booking.customerPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">参加人数</p>
                <p className="font-bold">{booking.numberOfPeople} 名</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">合計金額</p>
                <p className="text-2xl font-bold text-blue-600">
                  ¥{booking.totalPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </section>

          {/* プラン情報 */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">プラン情報</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">プラン名</p>
                <p className="text-lg font-bold">{booking.plan.title}</p>
              </div>
              {booking.plan.description && (
                <div>
                  <p className="text-sm text-gray-600">プラン内容</p>
                  <p className="text-gray-700">{booking.plan.description}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">魚種</p>
                  <p>🎣 {booking.plan.fishType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">日付</p>
                  <p>📅 {new Date(booking.plan.date).toLocaleDateString('ja-JP')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">所要時間</p>
                  <p>⏱️ {booking.plan.duration} 分</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">料金（1人あたり）</p>
                <p>¥{booking.plan.price.toLocaleString()}</p>
              </div>
            </div>
          </section>

          {/* 船舶情報 */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">船舶情報</h2>
            <div className="space-y-3">
              {booking.plan.boat.imageUrl && (
                <img
                  src={booking.plan.boat.imageUrl}
                  alt={booking.plan.boat.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <div>
                <p className="text-sm text-gray-600">船名</p>
                <p className="text-lg font-bold">🚢 {booking.plan.boat.name}</p>
              </div>
              {booking.plan.boat.description && (
                <div>
                  <p className="text-sm text-gray-600">船の説明</p>
                  <p className="text-gray-700">{booking.plan.boat.description}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">出港場所</p>
                  <p>📍 {booking.plan.boat.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">定員</p>
                  <p>👥 最大 {booking.plan.boat.capacity} 名</p>
                </div>
              </div>
              {booking.plan.boat.recentFish && (
                <div>
                  <p className="text-sm text-gray-600">最近釣れている魚種</p>
                  <p className="text-green-700">🐟 {booking.plan.boat.recentFish}</p>
                </div>
              )}
              {booking.plan.boat.memo && (
                <div>
                  <p className="text-sm text-gray-600">オーナーからの一言</p>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded">💬 {booking.plan.boat.memo}</p>
                </div>
              )}
            </div>
          </section>

          {/* アクション */}
          <section className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
            <Link
              href={`/boats/${booking.plan.boat.id}`}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 text-center font-bold"
            >
              船の詳細を見る
            </Link>
            
            {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
              <button
                onClick={handleCancelBooking}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 font-bold"
              >
                予約をキャンセル
              </button>
            )}
          </section>

          {booking.status === 'CANCELLED' && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              この予約はキャンセルされました。
            </div>
          )}

          {booking.status === 'COMPLETED' && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              このプランは完了しました。ご利用ありがとうございました！
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
