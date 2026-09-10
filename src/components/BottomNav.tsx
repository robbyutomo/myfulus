"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, ArrowLeftRight, PiggyBank, Target, BarChart3, Tag } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Beranda", icon: Home },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/budgets", label: "Budget", icon: PiggyBank },
  { href: "/savings", label: "Tabungan", icon: Target },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
  { href: "/categories", label: "Kategori", icon: Tag },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center justify-center flex-1 min-w-[60px] h-full gap-0.5 no-underline transition-colors duration-200 ${
                isActive ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              <div className={`transition-transform duration-300 ${isActive ? "scale-110 animate-bounce" : ""}`}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] leading-tight ${isActive ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
