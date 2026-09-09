"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

interface User {
  id: string;
  email: string;
  name: string;
}

interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
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
  const [user, setUser] = useState<User | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    recentTransactions: [],
  });
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
      const data = await res.json();
      setUser(data.user);
      await fetchDashboardData();
    } catch (error) {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <span className="text-base font-semibold text-gray-900">
                MyFulus
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{user?.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-3 gap-4 mb-6">
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

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions - 2 columns */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Transaksi Terbaru</CardTitle>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push("/transactions")}
                >
                  Lihat Semua
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {dashboardData.recentTransactions.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">
                    Belum ada transaksi
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left">Deskripsi</th>
                        <th className="text-right">Tanggal</th>
                        <th className="text-right">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  transaction.type === "income"
                                    ? "bg-emerald-500"
                                    : "bg-red-500"
                                }`}
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {transaction.description || "Tanpa deskripsi"}
                              </span>
                            </div>
                          </td>
                          <td className="text-right text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString(
                              "id-ID",
                              { day: "numeric", month: "short" }
                            )}
                          </td>
                          <td className="text-right">
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions - 1 column */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="primary"
                  className="w-full justify-start"
                  onClick={() => router.push("/transactions")}
                >
                  <Plus className="w-4 h-4" />
                  Tambah Transaksi
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => router.push("/budgets")}
                >
                  Atur Budget
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => router.push("/savings")}
                >
                  Target Tabungan
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => router.push("/reports")}
                >
                  Lihat Laporan
                </Button>
              </CardContent>
            </Card>

            {/* Budget Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Makanan</span>
                      <span className="font-medium tabular-nums">
                        {formatIDR(450000)} / {formatIDR(800000)}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill warning"
                        style={{ width: "56%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Transport</span>
                      <span className="font-medium tabular-nums">
                        {formatIDR(200000)} / {formatIDR(300000)}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill negative"
                        style={{ width: "67%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Hiburan</span>
                      <span className="font-medium tabular-nums">
                        {formatIDR(100000)} / {formatIDR(500000)}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill positive"
                        style={{ width: "20%" }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
