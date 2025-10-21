"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Booking = {
  id: string;
  customerName: string;
  customerPhone: string;
  numberOfPeople: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  plan: {
    title: string;
    date: string;
  };
};

type Boat = {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  imageUrl: string;
  memo?: string | null;
  recentFish?: string | null;
};

export default function OwnerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
    fetchBoats();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/owner/bookings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("予約取得エラー:", error);
    }
  };

  const fetchBoats = async () => {
    try {
      const res = await fetch("/api/owner/boats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setBoats(data);
      }
    } catch (error) {
      console.error("船舶取得エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">ダッシュボード</h1>
        <p className="text-gray-600">オーナー管理画面の概要です</p>
      </div>

      {/* メインコンテンツグリッド */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 最近の予約カード */}
        <section className="dashboard-card-section">
        <div className="info-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">最近の予約</h2>
            <Link href="/owner/bookings" className="boat-link">
              すべて表示
            </Link>
          </div>
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">予約はまだありません</p>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{booking.plan.title}</p>
                      <p className="text-sm text-gray-600">{booking.customerName} ({booking.numberOfPeople}名)</p>
                    </div>
                    <span className={
                      booking.status === "CONFIRMED" 
                        ? "status-confirmed" 
                        : booking.status === "PENDING" 
                        ? "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800" 
                        : "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800"
                    }>
                      {booking.status === "CONFIRMED" && <i className="fas fa-check-circle"></i>}
                      {booking.status === "CONFIRMED" ? "確定" : booking.status === "PENDING" ? "保留中" : booking.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{booking.customerPhone}</span>
                    <span className="font-semibold boat-link">{booking.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </section>

        {/* 登録船舶カード */}
        <section className="dashboard-card-section">
        <div className="info-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">登録船舶</h2>
            <Link href="/owner/boats/new" className="boat-link">
              船を追加
            </Link>
          </div>
          {boats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">船舶が登録されていません</p>
              <Link href="/owner/boats/new" className="inline-block quick-action-button text-sm">
                船舶を登録
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {boats.slice(0, 3).map((boat) => (
                <div key={boat.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start gap-4">
                    <div className="boat-icon">
                      <i className="fas fa-ship"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg mb-1">{boat.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{boat.location} | 定員 {boat.capacity}名</p>
                      <div className="flex gap-3">
                        <Link href={`/owner/boats/${boat.id}/edit`} className="boat-link">
                          編集
                        </Link>
                        <Link href={`/add-plan?boatId=${boat.id}`} className="boat-link">
                          稼働プラン追加
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </section>
      </div>

      {/* クイックアクションカード */}
      <section className="dashboard-card-section">
      <div className="info-card">
        <h2 className="text-2xl font-bold mb-6">クイックアクション</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/add-plan" 
            className="quick-action-button"
          >
            <i className="fas fa-plus-circle"></i>
            <p>プラン追加</p>
          </Link>
          <Link 
            href="/owner/plan-templates" 
            className="quick-action-button"
          >
            <i className="fas fa-clipboard-list"></i>
            <p>テンプレート</p>
          </Link>
          <Link 
            href="/owner/bookings" 
            className="quick-action-button"
          >
            <i className="fas fa-calendar-check"></i>
            <p>予約管理</p>
          </Link>
          <Link 
            href="/owner/boats" 
            className="quick-action-button"
          >
            <i className="fas fa-ship"></i>
            <p>船舶管理</p>
          </Link>
        </div>
      </div>
      </section>
    </div>
  );
}