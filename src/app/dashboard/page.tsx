"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  ArrowRight,
} from "lucide-react";

interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  budgets: Array<{
    id: string;
    amount: number;
    spent: number;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: "income" | "expense";
    description: string;
    date: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    budgets: [],
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MobileLayout title="Beranda">
        <div className="text-center text-sm text-gray-500 py-8">Memuat...</div>
      </MobileLayout>
    );
  }

  const totalBudget = dashboardData.budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = dashboardData.budgets.reduce((sum, b) => sum + b.spent, 0);

  return (
    <MobileLayout title="Beranda">
      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="kpi-card">
          <div className="kpi-label flex items-center space-x-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>Pemasukan</span>
          </div>
          <div className="kpi-value text-emerald-600">
            {formatIDR(dashboardData.totalIncome)}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label flex items-center space-x-1">
            <TrendingDown className="w-3 h-3 text-red-600" />
            <span>Pengeluaran</span>
          </div>
          <div className="kpi-value text-red-600">
            {formatIDR(dashboardData.totalExpense)}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label flex items-center space-x-1">
            <Wallet className="w-3 h-3 text-gray-600" />
            <span>Saldo</span>
          </div>
          <div className={`kpi-value ${dashboardData.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatIDR(dashboardData.balance)}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Button
          variant="primary"
          className="h-12"
          onClick={() => router.push("/transactions")}
        >
          <Plus className="w-4 h-4" />
          Transaksi
        </Button>
        <Button
          variant="secondary"
          className="h-12"
          onClick={() => router.push("/reports")}
        >
          Laporan
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Budget Summary */}
      {dashboardData.budgets.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ringkasan Budget</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-2">
              {dashboardData.budgets.slice(0, 3).map((budget) => {
                const percent = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
                return (
                  <div key={budget.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">
                        {formatIDR(budget.spent)}
                      </span>
                      <span className="font-medium tabular-nums text-gray-700">
                        {formatIDR(budget.amount)}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${percent >= 90 ? "negative" : percent >= 70 ? "warning" : "positive"}`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => router.push("/budgets")}
              className="w-full text-center text-xs text-emerald-600 mt-3 font-medium bg-transparent border-none p-0"
            >
              Lihat Semua Budget
            </button>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Transaksi Terbaru</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/transactions")}
          >
            Lihat Semua
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {dashboardData.recentTransactions.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Belum ada transaksi
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {dashboardData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        transaction.type === "income"
                          ? "bg-emerald-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm text-gray-900">
                      {transaction.description || "Tanpa deskripsi"}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      transaction.type === "income"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatIDR(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </MobileLayout>
  );
}
