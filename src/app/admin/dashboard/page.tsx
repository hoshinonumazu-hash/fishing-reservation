"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Booking = {
  id: string;
  status: string;
  peopleCount: number;
  totalPrice: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  plan: {
    id: string;
    title: string;
    date: string | null;
    boat: {
      id: string;
      name: string;
    };
  };
};

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    // 管理者権限チェック
    const role = localStorage.getItem("role");
    
    if (role !== "ADMIN") {
      alert("管理者権限がありません");
      router.push("/");
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(false);

    // 全予約データを取得
    fetchAllBookings();
  }, [router]);

  const fetchAllBookings = async () => {
    setBookingsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      } else {
        console.error("予約データの取得に失敗しました");
      }
    } catch (error) {
      console.error("予約データの取得エラー:", error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: "保留中",
      CONFIRMED: "承認済み",
      CANCELLED: "キャンセル",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "text-yellow-600 bg-yellow-50",
      CONFIRMED: "text-green-600 bg-green-50",
      CANCELLED: "text-red-600 bg-red-50",
    };
    return colors[status] || "text-gray-600 bg-gray-50";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-[#1D3557] mb-4">
          <i className="fas fa-shield-halved mr-3 text-[#FF6B6B]"></i>
          管理者ダッシュボード
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          ここで全予約の確認やアカウント削除を行います
        </p>

        {/* 全予約の確認 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-[#1D3557]">
              <i className="fas fa-list mr-2 text-[#457B9D]"></i>
              全予約の確認
            </h2>
            <p className="text-gray-600 mt-1">
              サイト全体の予約状況（全{bookings.length}件）
            </p>
          </div>

          <div className="p-6">
            {bookingsLoading ? (
              <p className="text-center text-gray-500">読み込み中...</p>
            ) : bookings.length === 0 ? (
              <p className="text-center text-gray-500">予約がありません</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-700">予約日</th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-700">ステータス</th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-700">ユーザー名</th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-700">船名</th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-700">プラン名</th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-700">人数</th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-700">料金</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {booking.plan.date
                            ? new Date(booking.plan.date).toLocaleDateString("ja-JP")
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {getStatusLabel(booking.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {booking.user.name || booking.user.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {booking.plan.boat.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {booking.plan.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {booking.peopleCount}人
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          ¥{booking.totalPrice.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* アカウント管理 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-[#1D3557] mb-4">
            <i className="fas fa-users mr-2 text-[#457B9D]"></i>
            アカウント管理
          </h2>
          <p className="text-gray-600">
            ユーザーアカウントの削除などを行えます（準備中）
          </p>
        </div>
      </div>
    </div>
  );
}
