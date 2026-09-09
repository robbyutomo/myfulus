"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { Wallet, LogOut } from "lucide-react";

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function MobileLayout({ children, title }: MobileLayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/");
        return;
      }
    } catch (error) {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-500">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex justify-between items-center h-12 px-4">
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-gray-900">
              {title || "MyFulus"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-xs text-gray-500 hover:text-gray-700 bg-transparent border-none p-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
