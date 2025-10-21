'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Booking {
  id: string;
  numberOfPeople: number;
  status: string;
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  plan: {
    title: string;
    fishType: string;
    date: string;
    boat: {
      name: string;
      location: string;
    };
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPending, setShowPending] = useState(false);
  const [showConfirmed, setShowConfirmed] = useState(true); // デフォルトで確定のみ表示
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) {
        throw new Error('予約情報の取得に失敗しました');
      }
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予約情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
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

      // 予約一覧を再取得
      fetchBookings();
      alert('予約をキャンセルしました');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'キャンセルに失敗しました');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: '承認待ち', color: 'bg-yellow-100 text-yellow-800', icon: 'fa-clock' },
      CONFIRMED: { label: '予約確定', color: 'bg-green-100 text-green-800', icon: 'fa-check-circle' },
      CANCELLED: { label: 'キャンセル済', color: 'bg-red-100 text-red-800', icon: 'fa-times-circle' },
      COMPLETED: { label: '完了', color: 'bg-blue-100 text-blue-800', icon: 'fa-flag-checkered' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800', icon: 'fa-question-circle' };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color} flex items-center gap-1`}>
        <i className={`fas ${config.icon}`}></i>
        {config.label}
      </span>
    );
  };

  const filteredBookings = bookings.filter(booking => {
    if (booking.status === 'PENDING' && showPending) return true;
    if (booking.status === 'CONFIRMED' && showConfirmed) return true;
    if (booking.status === 'COMPLETED' && showCompleted) return true;
    return false;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6F9]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#457B9D] mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#1D3557] mb-6 flex items-center gap-3">
          <i className="fas fa-list-alt text-[#457B9D]"></i>
          予約一覧
        </h1>

        {error && (
          <div className="info-card !bg-red-50 border-l-4 border-red-500 text-red-700 mb-6">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {error}
          </div>
        )}

        {/* チェックボックスフィルター */}
        <div className="info-card mb-6">
          <h2 className="font-bold text-lg text-[#1D3557] mb-3 flex items-center gap-2">
            <i className="fas fa-filter text-[#457B9D]"></i>
            表示フィルター
          </h2>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPending}
                onChange={(e) => setShowPending(e.target.checked)}
                className="w-4 h-4 text-[#457B9D] rounded focus:ring-[#457B9D]"
              />
              <span className="text-gray-700">承認待ち</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showConfirmed}
                onChange={(e) => setShowConfirmed(e.target.checked)}
                className="w-4 h-4 text-[#457B9D] rounded focus:ring-[#457B9D]"
              />
              <span className="text-gray-700">予約確定</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="w-4 h-4 text-[#457B9D] rounded focus:ring-[#457B9D]"
              />
              <span className="text-gray-700">完了</span>
            </label>
          </div>
        </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 info-card">
          <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-600 mb-4 text-lg">該当する予約がありません</p>
          <Link
            href="/boats"
            className="quick-action-button inline-block"
          >
            <i className="fas fa-search mr-2"></i>
            プランを探す
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const isExpanded = expandedId === booking.id;
            return (
              <div key={booking.id} className="info-card !p-0 overflow-hidden hover:shadow-xl transition-all">
                {/* クリック可能な概要部分 */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* 日付を大きく表示 */}
                      <div className="text-3xl font-bold text-[#1D3557] mb-2 flex items-center gap-3">
                        <i className="fas fa-calendar-day text-[#457B9D]"></i>
                        {new Date(booking.plan.date).toLocaleDateString('ja-JP', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          weekday: 'short'
                        })}
                      </div>
                      
                      {/* 船名とプラン名 */}
                      <div className="space-y-1 mb-3">
                        <div className="text-xl font-bold text-[#1D3557] flex items-center gap-2">
                          <i className="fas fa-ship text-[#457B9D]"></i>
                          {booking.plan.boat.name}
                        </div>
                        <div className="text-lg text-gray-700 ml-7">
                          {booking.plan.title}
                        </div>
                      </div>
                      
                      {/* ステータスバッジ */}
                      <div className="flex items-center gap-2 ml-7">
                        {getStatusBadge(booking.status)}
                        <span className="text-sm text-gray-500">
                          {booking.numberOfPeople}名
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#457B9D]">
                        ¥{booking.totalPrice.toLocaleString()}
                      </div>
                      <button className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                        {isExpanded ? (
                          <>
                            <i className="fas fa-chevron-up"></i>
                            閉じる
                          </>
                        ) : (
                          <>
                            <i className="fas fa-chevron-down"></i>
                            詳細を見る
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 展開時の詳細情報 */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-[#1D3557] mb-2 flex items-center gap-2">
                          <i className="fas fa-info-circle text-[#457B9D]"></i>
                          プラン詳細
                        </h3>
                        <div className="space-y-1 text-gray-700">
                          <p className="flex items-center gap-2">
                            <i className="fas fa-fish w-5 text-[#457B9D]"></i>
                            魚種: {booking.plan.fishType}
                          </p>
                          <p className="flex items-center gap-2">
                            <i className="fas fa-map-marker-alt w-5 text-[#457B9D]"></i>
                            場所: {booking.plan.boat.location}
                          </p>
                          <p className="flex items-center gap-2">
                            <i className="fas fa-users w-5 text-[#457B9D]"></i>
                            参加人数: {booking.numberOfPeople} 名
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-[#1D3557] mb-2 flex items-center gap-2">
                          <i className="fas fa-receipt text-[#457B9D]"></i>
                          予約情報
                        </h3>
                        <div className="space-y-1 text-gray-700">
                          <p className="flex items-center gap-2">
                            <i className="fas fa-user w-5 text-[#457B9D]"></i>
                            {booking.customerName}
                          </p>
                          <p className="flex items-center gap-2">
                            <i className="fas fa-phone w-5 text-[#457B9D]"></i>
                            {booking.customerPhone}
                          </p>
                          <p className="text-sm text-gray-500">
                            予約日時: {new Date(booking.createdAt).toLocaleString('ja-JP')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {booking.status === 'PENDING' && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded mb-4">
                        <p className="text-sm text-yellow-700 flex items-center gap-2">
                          <i className="fas fa-clock"></i>
                          他の予約があるため、オーナーの承認待ちです
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="quick-action-button !bg-[#457B9D]"
                      >
                        <i className="fas fa-eye mr-2"></i>
                        詳細ページ
                      </Link>
                      
                      {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelBooking(booking.id);
                          }}
                          className="quick-action-button !bg-red-600 hover:!bg-red-700"
                        >
                          <i className="fas fa-times mr-2"></i>
                          キャンセル
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
