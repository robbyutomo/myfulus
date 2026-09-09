"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/utils";
import { ArrowLeft, Download } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ReportData {
  monthlyIncome: number;
  monthlyExpense: number;
  incomeByCategory: Array<{ name: string; value: number }>;
  expenseByCategory: Array<{ name: string; value: number }>;
  dailyTransactions: Array<{
    date: string;
    income: number;
    expense: number;
  }>;
}

const COLORS = [
  "#059669",
  "#0891b2",
  "#6366f1",
  "#d97706",
  "#dc2626",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#64748b",
];

export default function ReportsPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData>({
    monthlyIncome: 0,
    monthlyExpense: 0,
    incomeByCategory: [],
    expenseByCategory: [],
    dailyTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

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
      await fetchReportData();
    } catch (error) {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async () => {
    try {
      const res = await fetch(
        `/api/reports?month=${currentMonth}&year=${currentYear}`
      );
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    }
  };

  const exportCSV = () => {
    const headers = ["Tanggal", "Pemasukan", "Pengeluaran"];
    const rows = reportData.dailyTransactions.map((t) => [
      t.date,
      t.income.toString(),
      t.expense.toString(),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-${currentYear}-${currentMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
          <div className="flex items-center h-14">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-base font-semibold text-gray-900">
              Laporan Keuangan
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters & Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <select
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i).toLocaleDateString("id-ID", {
                    month: "short",
                  })}
                </option>
              ))}
            </select>
            <select
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm"
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i} value={new Date().getFullYear() - 2 + i}>
                  {new Date().getFullYear() - 2 + i}
                </option>
              ))}
            </select>
          </div>
          <Button variant="secondary" onClick={exportCSV}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="kpi-card">
            <div className="kpi-label">Total Pemasukan</div>
            <div className="kpi-value text-emerald-600">
              {formatIDR(reportData.monthlyIncome)}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Total Pengeluaran</div>
            <div className="kpi-value text-red-600">
              {formatIDR(reportData.monthlyExpense)}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Selisih</div>
            <div
              className={`kpi-value ${
                reportData.monthlyIncome - reportData.monthlyExpense >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {formatIDR(reportData.monthlyIncome - reportData.monthlyExpense)}
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Income by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Pemasukan per Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.incomeByCategory.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Tidak ada data pemasukan
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={reportData.incomeByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportData.incomeByCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Tooltip formatter={(value: any) => formatIDR(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Expense by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Pengeluaran per Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.expenseByCategory.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Tidak ada data pengeluaran
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={reportData.expenseByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportData.expenseByCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Tooltip formatter={(value: any) => formatIDR(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Daily Transactions Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Harian</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.dailyTransactions.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Tidak ada data transaksi
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={reportData.dailyTransactions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })
                    }
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip
                    formatter={(value: any) => formatIDR(Number(value))}
                    labelFormatter={(label: any) =>
                      new Date(String(label)).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    }
                  />
                  <Legend />
                  <Bar
                    dataKey="income"
                    name="Pemasukan"
                    fill="#059669"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="expense"
                    name="Pengeluaran"
                    fill="#dc2626"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Daily Transactions Table */}
        {reportData.dailyTransactions.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Detail Transaksi Harian</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Tanggal</th>
                    <th className="text-right">Pemasukan</th>
                    <th className="text-right">Pengeluaran</th>
                    <th className="text-right">Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.dailyTransactions.map((t) => (
                    <tr key={t.date}>
                      <td>
                        <span className="text-sm text-gray-900">
                          {new Date(t.date).toLocaleDateString("id-ID", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="text-sm font-medium tabular-nums text-emerald-600">
                          {t.income > 0 ? `+${formatIDR(t.income)}` : "-"}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="text-sm font-medium tabular-nums text-red-600">
                          {t.expense > 0 ? `-${formatIDR(t.expense)}` : "-"}
                        </span>
                      </td>
                      <td className="text-right">
                        <span
                          className={`text-sm font-semibold tabular-nums ${
                            t.income - t.expense >= 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatIDR(t.income - t.expense)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
