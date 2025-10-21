'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  numberOfPeople: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  plan: {
    id: string;
    title: string;
    fishType: string;
    date: string;
    template?: {
      id: string;
      name: string;
    } | null;
    boat: {
      id: string;
      name: string;
      location: string;
    };
  };
}

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/owner/bookings', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('予約情報の取得に失敗しました');
      }

      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('予約取得エラー:', error);
      alert('予約情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    const confirmMessages = {
      CONFIRMED: 'この予約を承認しますか？',
      CANCELLED: 'この予約をキャンセルしますか？',
      COMPLETED: 'この予約を完了にしますか？',
    };

    const message = confirmMessages[newStatus as keyof typeof confirmMessages] || '状態を変更しますか？';
    
    if (!confirm(message)) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('ステータスの更新に失敗しました');
      }

      alert('ステータスを更新しました');
      fetchBookings(); // 再取得
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: '承認待ち', icon: 'fa-clock', color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: '予約確定', icon: 'fa-check-circle', color: 'status-confirmed' },
      CANCELLED: { label: 'キャンセル済', icon: 'fa-times-circle', color: 'bg-red-100 text-red-800' },
      COMPLETED: { label: '完了', icon: 'fa-flag-checkered', color: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      icon: 'fa-info-circle',
      color: 'bg-gray-100 text-gray-800' 
    };

    return (
      <span className={`${config.color} px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1`}>
        <i className={`fas ${config.icon}`}></i>
        {config.label}
      </span>
    );
  };

  // テンプレートカラーのマッピング（固定パレット）
  const templateColorMap = useMemo(() => {
    const colors = [
      '#e53935', // red
      '#1e88e5', // blue
      '#43a047', // green
      '#8e24aa', // purple
      '#fb8c00', // orange
      '#00acc1', // cyan
      '#6d4c41', // brown
    ];
    const uniqueKeys = new Set<string>();
    for (const b of bookings) {
      uniqueKeys.add(b.plan.template?.id || `plan:${b.plan.id}`);
    }
    const sortedKeys = Array.from(uniqueKeys).sort();
    const map = new Map<string, string>();
    sortedKeys.forEach((k, i) => map.set(k, colors[i % colors.length]));
    return map;
  }, [bookings]);

  // カレンダー生成用ヘルパー
  const monthLabel = useMemo(() => {
    return `${currentMonth.getFullYear()}年 ${currentMonth.getMonth() + 1}月`;
  }, [currentMonth]);

  const startOfMonth = useMemo(() => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), [currentMonth]);
  const endOfMonth = useMemo(() => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0), [currentMonth]);
  const startWeekday = useMemo(() => startOfMonth.getDay(), [startOfMonth]); // 日曜起点
  const daysInMonth = useMemo(() => endOfMonth.getDate(), [endOfMonth]);

  const calendarCells = useMemo(() => {
    const cells: Array<{ date: Date | null }[]> = [];
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
    let cur = 1 - startWeekday;
    for (let i = 0; i < totalCells; i++) {
      const row = Math.floor(i / 7);
      if (!cells[row]) cells[row] = [];
      const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), cur);
      const inMonth = cur >= 1 && cur <= daysInMonth;
      cells[row].push({ date: inMonth ? d : null });
      cur++;
    }
    return cells;
  }, [currentMonth, startWeekday, daysInMonth]);

  // 日毎の予約をグルーピング
  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      const d = new Date(b.plan.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const arr = map.get(key) || [];
      arr.push(b);
      map.set(key, arr);
    }
    return map;
  }, [bookings]);

  const selectedDayBookings = useMemo(() => {
    if (!selectedDate) return [] as Booking[];
    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    return bookingsByDay.get(key) || [];
  }, [selectedDate, bookingsByDay]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">予約管理</h1>
        <p className="text-gray-600">全ての予約を管理できます</p>
      </div>

      {/* カレンダー */}
      <div className="booking-calendar-card">
        {/* カレンダーヘッダー */}
        <div className="calendar-header">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="calendar-nav-button"
            aria-label="前の月"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <h2 className="calendar-title">{monthLabel}</h2>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="calendar-nav-button"
            aria-label="次の月"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="calendar-weekdays">
          {['日','月','火','水','木','金','土'].map((d, idx) => (
            <div 
              key={d} 
              className={`weekday-label ${idx === 0 ? 'sunday' : ''} ${idx === 6 ? 'saturday' : ''}`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="calendar-grid">
          {calendarCells.flat().map((cell, idx) => {
            const d = cell.date;
            const inMonth = !!d;
            const key = d ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` : `empty-${idx}`;
            const dayBookings = d ? bookingsByDay.get(key) || [] : [];
            const isSelected = selectedDate && d && selectedDate.toDateString() === d.toDateString();
            const isSunday = d && d.getDay() === 0;
            const isSaturday = d && d.getDay() === 6;
            const hasBookings = dayBookings.length > 0;
            const isFullyBooked = dayBookings.length >= 3; // 3件以上で満席とする例
            
            return (
              <div
                key={key}
                className={`date-cell ${!inMonth ? 'out-of-month' : ''} ${isSelected ? 'selected' : ''} ${hasBookings ? 'has-bookings' : ''} ${isFullyBooked ? 'fully-booked' : ''}`}
                onClick={() => d && setSelectedDate(d)}
                style={{ cursor: d ? 'pointer' : 'default' }}
              >
                <div className={`date-number ${isSunday ? 'sunday-date' : ''} ${isSaturday ? 'saturday-date' : ''}`}>
                  {d?.getDate() || ''}
                </div>
                
                {/* 予約状況バッジ */}
                {hasBookings && (
                  <div className={`booking-status-badge ${isFullyBooked ? 'fully-booked-badge' : ''}`}>
                    {dayBookings.length}件
                  </div>
                )}
                
                {/* プランドット表示 */}
                <div className="plan-dots">
                  {dayBookings.slice(0, 4).map((b) => {
                    const colorKey = b.plan.template?.id || `plan:${b.plan.id}`;
                    const color = templateColorMap.get(colorKey) || '#1e88e5';
                    return (
                      <span
                        key={b.id}
                        title={`${b.plan.template?.name || b.plan.title}`}
                        className="plan-dot"
                        style={{ backgroundColor: color }}
                      ></span>
                    );
                  })}
                  {dayBookings.length > 4 && (
                    <span className="plan-dot-more">+{dayBookings.length - 4}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 凡例 */}
        <div className="calendar-legend">
          {[...templateColorMap.entries()].slice(0, 8).map(([key, color]) => (
            <div key={key} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: color }}></span>
              <span className="legend-label">
                {bookings.find(b => (b.plan.template?.id || `plan:${b.plan.id}`) === key)?.plan.template?.name
                  || bookings.find(b => `plan:${b.plan.id}` === key)?.plan.title
                  || 'プラン'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 選択日の詳細 */}
      <div className="space-y-4">
        {selectedDate ? (
          selectedDayBookings.length === 0 ? (
            <div className="info-card text-center py-10">
              <div className="boat-icon mb-2"><i className="fas fa-inbox"></i></div>
              <p className="text-gray-600">この日には予約がありません</p>
            </div>
          ) : (
            selectedDayBookings.map((booking) => (
            <div 
              key={booking.id} 
              className="info-card"
            >
              <div>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* 予約情報 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold">{booking.plan.title}</h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <i className="fas fa-ship boat-icon !text-lg mr-2"></i>
                        <span className="font-medium">船名:</span> 
                        <span className="ml-1">{booking.plan.boat.name}</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-calendar-day boat-icon !text-lg mr-2"></i>
                        <span className="font-medium">実施日:</span> 
                        <span className="ml-1">{new Date(booking.plan.date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short'
                        })}</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-user boat-icon !text-lg mr-2"></i>
                        <span className="font-medium">お客様:</span> 
                        <span className="ml-1">{booking.customerName}</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-phone boat-icon !text-lg mr-2"></i>
                        <span className="font-medium">電話:</span> 
                        <span className="ml-1">{booking.customerPhone}</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-users boat-icon !text-lg mr-2"></i>
                        <span className="font-medium">人数:</span> 
                        <span className="ml-1">{booking.numberOfPeople} 名</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-yen-sign boat-icon !text-lg mr-2"></i>
                        <span className="font-medium">金額:</span> 
                        <span className="text-lg font-bold boat-link ml-1">
                          ¥{booking.totalPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <i className="fas fa-clock boat-icon !text-lg mr-2"></i>
                        <span className="font-medium">予約日時:</span> 
                        <span className="ml-1">{new Date(booking.createdAt).toLocaleString('ja-JP')}</span>
                      </div>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="boat-link text-center px-4 py-2 rounded-lg border-2 border-current hover:bg-blue-50 font-medium transition"
                    >
                      <i className="fas fa-eye mr-2"></i>
                      詳細を見る
                    </Link>
                    
                    {booking.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition"
                        >
                          <i className="fas fa-check-circle mr-2"></i>
                          予約を承認
                        </button>
                        <button
                          onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium transition"
                        >
                          <i className="fas fa-times-circle mr-2"></i>
                          予約キャンセル
                        </button>
                      </>
                    )}
                    
                    {booking.status === 'CONFIRMED' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(booking.id, 'COMPLETED')}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium transition"
                        >
                          <i className="fas fa-flag-checkered mr-2"></i>
                          完了にする
                        </button>
                        <button
                          onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium transition"
                        >
                          <i className="fas fa-times-circle mr-2"></i>
                          予約キャンセル
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            ))
          )
        ) : (
          <div className="info-card text-center py-8 text-gray-600">日付をクリックすると、その日の予約が表示されます</div>
        )}
      </div>
    </div>
  );
}
