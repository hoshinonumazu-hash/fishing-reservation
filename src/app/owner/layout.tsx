"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import OwnerHeader from "@/components/OwnerHeader";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 認証チェック
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "BOAT_OWNER") {
      router.push("/login");
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">認証確認中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="owner-dashboard-wrapper">
      <OwnerHeader />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
