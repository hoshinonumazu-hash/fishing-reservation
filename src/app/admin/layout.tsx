import React from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* サイドバー */}
      <aside className="w-64 bg-[#1D3557] text-white flex flex-col py-8 px-4 shadow-lg">
        <h2 className="text-2xl font-bold mb-8 text-center">管理メニュー</h2>
        <nav className="flex flex-col gap-4">
          <Link href="/admin/dashboard" className="py-2 px-4 rounded hover:bg-[#457B9D] transition font-semibold">管理者ホーム</Link>
          <Link href="/admin/accounts" className="py-2 px-4 rounded hover:bg-[#457B9D] transition font-semibold">アカウント管理</Link>
          <Link href="/admin/plans" className="py-2 px-4 rounded hover:bg-[#457B9D] transition font-semibold">予約プラン管理</Link>
        </nav>
      </aside>
      {/* メインコンテンツ */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
