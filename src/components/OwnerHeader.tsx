"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OwnerHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("");

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
    { href: "/owner/dashboard", label: "ホーム", icon: "fa-home" },
    { href: "/owner/bookings", label: "予約確認", icon: "fa-list-check" },
    { href: "/owner/plan-editor", label: "予約編集", icon: "fa-calendar-edit" },
  ];

  return (
    <header className="customer-header w-full bg-[#1D3557] shadow-lg mb-8 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 py-3 px-4 sm:py-4 sm:px-6">
        <div className="flex items-center gap-2 header-logo flex-shrink-0">
          <i className="fas fa-fish text-xl sm:text-2xl text-[#A8DADC]"></i>
          <span className="font-bold text-xl sm:text-2xl tracking-wide text-white">釣り船予約</span>
        </div>
        
        {/* ナビゲーションメニュー */}
        <nav 
          className="flex items-center gap-2 sm:gap-3 md:gap-4 overflow-x-auto min-w-0 flex-1"
          style={{ 
            display: 'flex',
            flexWrap: 'nowrap',
            whiteSpace: 'nowrap',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: '-ms-autohiding-scrollbar'
          } as React.CSSProperties}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`${isActive ? 'text-[#FFD166]' : 'text-white'} hover:text-[#A8DADC] font-semibold inline-flex items-center gap-1 flex-shrink-0`}
                style={{ whiteSpace: 'nowrap', color: isActive ? '#FFD166' : '#FFFFFF' }}
              >
                <i className={`fas ${item.icon}`} style={{ color: isActive ? '#FFD166' : '#FFFFFF' }}></i>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ユーザー情報・ログアウト（右端固定） */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <span className="text-white font-semibold hidden md:inline" style={{ whiteSpace: 'nowrap', color: '#FFFFFF' }}>{userName} 様</span>
          {/* モバイルはアイコンのみ */}
          <button
            onClick={handleLogout}
            className="text-gray-800 hover:text-[#FFB3B3] font-semibold bg-white/90 px-3 py-1 rounded"
            style={{ whiteSpace: 'nowrap' }}
            aria-label="ログアウト"
            title="ログアウト"
          >
            <span className="hidden sm:inline">ログアウト</span>
            <i className="fas fa-right-from-bracket sm:hidden"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
