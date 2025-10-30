"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
  }, [router]);

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 機能カード：全予約確認 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-[#1D3557] mb-4">
              <i className="fas fa-list mr-2 text-[#457B9D]"></i>
              全予約の確認
            </h2>
            <p className="text-gray-600">
              サイト全体の予約状況を確認できます（準備中）
            </p>
          </div>

          {/* 機能カード：アカウント管理 */}
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
    </div>
  );
}
