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
      <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
        <Link href="/" className="flex items-center gap-2 header-logo">
          <i className="fas fa-fish text-2xl text-[#A8DADC]"></i>
          <span className="font-bold text-2xl tracking-wide text-white">釣り船予約</span>
        </Link>
        <nav className="flex items-center gap-6 header-nav">
          <Link href="/boats" className="header-nav-link text-white hover:text-[#A8DADC] font-semibold flex items-center gap-1">
            <i className="fas fa-ship"></i>船を探す
          </Link>
          <Link href="/reserve" className="header-nav-link text-white hover:text-[#A8DADC] font-semibold flex items-center gap-1">
            <i className="fas fa-calendar-plus"></i>予約
          </Link>
          {loggedIn && (
            <Link href="/bookings" className="header-nav-link text-white hover:text-[#A8DADC] font-semibold flex items-center gap-1">
              <i className="fas fa-list"></i>予約一覧
            </Link>
          )}
          {role === 'BOAT_OWNER' && (
            <Link href="/owner/dashboard" className="header-nav-link text-[#FFD166] font-bold flex items-center gap-1">
              <i className="fas fa-user-cog"></i>オーナーページ
            </Link>
          )}
          {loggedIn ? (
            <>
              <span className="text-[#A8DADC] font-semibold">{userName ? `${userName} さん` : "ログイン中"}</span>
              <button onClick={handleLogout} className="text-red-200 font-semibold hover:text-white ml-2">ログアウト</button>
            </>
          ) : (
            <Link href="/login" className="header-nav-link text-[#A8DADC] font-semibold hover:text-white flex items-center gap-1">
              <i className="fas fa-user"></i>ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
