"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OwnerHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    setUserName(storedUserName || "オーナー");
  }, []);

  const handleLogout = () => {
    if (confirm("ログアウトしますか?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      router.push("/login");
    }
  };

  const navItems = [
    { href: "/owner/dashboard", label: "ダッシュボード", icon: "fa-chart-line" },
    { href: "/owner/boats", label: "船舶管理", icon: "fa-ship" },
    { href: "/owner/bookings", label: "予約管理", icon: "fa-calendar-alt" },
    { href: "/owner/plan-templates", label: "プランテンプレート", icon: "fa-clipboard-list" },
  ];

  return (
    <>
      {/* モバイルヘッダー */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-[#1D3557] text-white z-50 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white text-2xl"
            aria-label="メニュー"
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
          <h1 className="text-lg font-bold">釣り船予約システム</h1>
          <div className="w-8"></div> {/* スペーサー */}
        </div>
      </header>

      {/* モバイルメニューのオーバーレイ */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* サイドバー */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* ヘッダー部分 */}
        <div className="sidebar-owner-info">
          <Link href="/owner/dashboard" className="block hover:opacity-80 transition">
            <h1 className="text-xl font-bold mb-1">釣り船予約システム</h1>
            <p className="text-sm text-white/70">オーナー管理画面</p>
          </Link>
        </div>

        {/* ユーザー情報 */}
        <div className="sidebar-owner-info">
          <p className="text-sm text-white/70 mb-1">ようこそ</p>
          <p className="font-semibold mb-2">{userName} 様</p>
          <p className="text-xs text-white/70 mb-4">船舶オーナー</p>
          <div className="space-y-2">
            <Link
              href="/"
              className="block w-full text-center px-3 py-2 quick-action-button !bg-[#A8DADC] !text-[#1D3557] !font-bold !rounded-lg !border-0 !shadow-md hover:!bg-[#457B9D] hover:!text-white transition flex items-center justify-center gap-2"
              style={{ letterSpacing: "0.05em", fontSize: "1.08rem" }}
            >
              <i className="fas fa-arrow-right-to-bracket !text-lg"></i>
              顧客画面へ
            </Link>
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 bg-transparent border border-white hover:bg-white/10 rounded text-sm transition"
            >
              ログアウト
            </button>
          </div>
        </div>

        {/* ナビゲーションメニュー */}
        <nav className="flex-1 py-6">
          <ul className="nav-menu">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href} className="nav-item">
                  <Link
                    href={item.href}
                    className={isActive ? "active" : ""}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className={`fas ${item.icon}`}></i>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
