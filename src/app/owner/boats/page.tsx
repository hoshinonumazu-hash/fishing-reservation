"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function OwnerBoatsPage() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBoats();
  }, []);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">船舶管理</h1>
            <p className="text-gray-600">登録されている船舶の一覧と管理</p>
          </div>
          <Link
            href="/owner/boats/new"
            className="quick-action-button !px-6 !py-3 !rounded-lg"
          >
            <i className="fas fa-plus-circle !text-2xl !mb-0 mr-2"></i>
            <span>新規船舶登録</span>
          </Link>
        </div>
      </div>

      {/* 船舶一覧 */}
      {boats.length === 0 ? (
        <div className="info-card text-center py-16">
          <div className="boat-icon mb-6">
            <i className="fas fa-ship"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            船舶が登録されていません
          </h3>
          <p className="text-gray-500 mb-6">
            まずは船舶を登録して、予約受付を開始しましょう
          </p>
          <Link
            href="/owner/boats/new"
            className="quick-action-button inline-flex !px-8 !py-4"
          >
            <i className="fas fa-plus-circle !text-3xl !mb-0 mr-3"></i>
            <span className="text-lg">最初の船舶を登録</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boats.map((boat) => (
            <div key={boat.id} className="info-card">
              {/* 船舶画像 */}
              <div className="mb-4">
                {boat.imageUrl ? (
                  <img
                    src={boat.imageUrl}
                    alt={boat.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <i className="fas fa-ship boat-icon"></i>
                  </div>
                )}
              </div>

              {/* 船舶情報 */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {boat.name}
              </h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-map-marker-alt w-5 text-center mr-2"></i>
                  <span className="text-sm">{boat.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-users w-5 text-center mr-2"></i>
                  <span className="text-sm">定員 {boat.capacity}名</span>
                </div>
                {boat.recentFish && (
                  <div className="flex items-center text-gray-600">
                    <i className="fas fa-fish w-5 text-center mr-2"></i>
                    <span className="text-sm">{boat.recentFish}</span>
                  </div>
                )}
              </div>

              {boat.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {boat.description}
                </p>
              )}

              {boat.memo && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 rounded">
                  <p className="text-sm text-gray-700">
                    <i className="fas fa-sticky-note mr-2 text-yellow-600"></i>
                    {boat.memo}
                  </p>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Link
                  href={`/owner/boats/${boat.id}`}
                  className="flex-1 text-center boat-link py-2 px-4 rounded-lg border-2 border-current hover:bg-blue-50 transition"
                >
                  <i className="fas fa-eye mr-2"></i>
                  詳細
                </Link>
                <Link
                  href={`/owner/boats/${boat.id}/edit`}
                  className="flex-1 text-center boat-link py-2 px-4 rounded-lg border-2 border-current hover:bg-blue-50 transition"
                  style={{ marginRight: "12px" }}
                >
                  <i className="fas fa-edit mr-2"></i>
                  編集
                </Link>
                <Link
                  href={`/add-plan?boatId=${boat.id}`}
                  className="flex-1 text-center boat-link py-2 px-4 rounded-lg border-2 border-current hover:bg-blue-50 transition"
                  style={{ marginLeft: "12px" }}
                >
                  <i className="fas fa-calendar-plus mr-2"></i>
                  プラン
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 統計情報 */}
      {boats.length > 0 && (
        <div className="mt-8 info-card">
          <h3 className="text-lg font-bold mb-4">統計情報</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="boat-icon !text-3xl mb-2">
                <i className="fas fa-ship"></i>
              </div>
              <p className="text-2xl font-bold">{boats.length}</p>
              <p className="text-sm text-gray-600">登録船舶数</p>
            </div>
            <div className="text-center">
              <div className="boat-icon !text-3xl mb-2">
                <i className="fas fa-users"></i>
              </div>
              <p className="text-2xl font-bold">
                {boats.reduce((sum, boat) => sum + boat.capacity, 0)}
              </p>
              <p className="text-sm text-gray-600">総定員数</p>
            </div>
            <div className="text-center">
              <div className="boat-icon !text-3xl mb-2">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <p className="text-2xl font-bold">
                {new Set(boats.map((b) => b.location)).size}
              </p>
              <p className="text-sm text-gray-600">出港地数</p>
            </div>
            <div className="text-center">
              <div className="boat-icon !text-3xl mb-2">
                <i className="fas fa-fish"></i>
              </div>
              <p className="text-2xl font-bold">
                {boats.filter((b) => b.recentFish).length}
              </p>
              <p className="text-sm text-gray-600">釣果情報登録済</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
