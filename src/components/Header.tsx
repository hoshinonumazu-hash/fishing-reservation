"use client";
import Link from "next/link";
import { useEffect, useState } from "react";


export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoggedIn(!!localStorage.getItem("token"));
      setUserName(localStorage.getItem("userName"));
      setRole(localStorage.getItem("role"));
    }
    const handler = () => {
      setLoggedIn(!!localStorage.getItem("token"));
      setUserName(localStorage.getItem("userName"));
      setRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("role");
    setLoggedIn(false);
    setUserName(null);
    setRole(null);
    window.location.href = "/";
  };

  return (
    <header className="customer-header w-full bg-[#1D3557] shadow-lg mb-8 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 py-3 px-4 sm:py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 header-logo flex-shrink-0">
          <i className="fas fa-fish text-xl sm:text-2xl text-[#A8DADC]"></i>
          <span className="font-bold text-xl sm:text-2xl tracking-wide text-white">釣り船予約</span>
        </Link>
        
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
          <Link href="/boats" className="text-white hover:text-[#A8DADC] font-semibold inline-flex items-center gap-1 flex-shrink-0" style={{ whiteSpace: 'nowrap', color: '#FFFFFF' }}>
            <i className="fas fa-ship text-white"></i>
            <span>探す</span>
          </Link>
          {/* 予約一覧は常時表示 */}
          <Link href="/bookings" className="text-white hover:text-[#A8DADC] font-semibold inline-flex items-center gap-1 flex-shrink-0" style={{ whiteSpace: 'nowrap', color: '#FFFFFF' }}>
            <i className="fas fa-list text-white"></i>
            <span>予約</span>
          </Link>
          {role === 'BOAT_OWNER' && (
            <Link href="/owner/dashboard" className="text-[#FFD166] hover:text-[#FFE699] font-bold inline-flex items-center gap-1 flex-shrink-0" style={{ whiteSpace: 'nowrap', color: '#FFD166' }}>
              <i className="fas fa-user-cog text-[#FFD166]"></i>
              <span>オーナー</span>
            </Link>
          )}
          {role === 'ADMIN' && (
            <Link href="/admin/dashboard" className="text-[#FF6B6B] hover:text-[#FF8787] font-bold inline-flex items-center gap-1 flex-shrink-0" style={{ whiteSpace: 'nowrap', color: '#FF6B6B' }}>
              <i className="fas fa-shield-halved text-[#FF6B6B]"></i>
              <span>サイト管理者用ページ</span>
            </Link>
          )}
        </nav>

        {/* ユーザー情報・ログアウト（右端固定） */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {loggedIn ? (
            <>
              <span className="text-white font-semibold hidden md:inline" style={{ whiteSpace: 'nowrap', color: '#FFFFFF' }}>{userName ? `${userName} さん` : "ログイン中"}</span>
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
            </>
          ) : (
            <Link href="/login" className="text-white hover:text-[#A8DADC] font-semibold inline-flex items-center gap-1" style={{ whiteSpace: 'nowrap', color: '#FFFFFF' }}>
              <i className="fas fa-user text-white"></i>
              <span>ログイン</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
