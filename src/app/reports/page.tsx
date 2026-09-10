"use client";

import { useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIDR, formatIDRSingkat } from "@/lib/utils";
import useSWR from "swr";
import { Download } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ReportData {
  monthlyIncome: number;
  monthlyExpense: number;
  incomeByCategory: Array<{ name: string; value: number; color: string }>;
  expenseByCategory: Array<{ name: string; value: number; color: string }>;
  dailyTransactions: Array<{
    date: string;
    income: number;
    expense: number;
  }>;
}

export default function ReportsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const { data: reportData } = useSWR<ReportData>(
    `/api/reports?month=${currentMonth}&year=${currentYear}`,
    (url) => fetch(url).then(r => r.json()),
    { revalidateOnFocus: false }
  );

  const exportCSV = () => {
    if (!reportData) return;
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

  const data = reportData || {
    monthlyIncome: 0,
    monthlyExpense: 0,
    incomeByCategory: [],
    expenseByCategory: [],
    dailyTransactions: [],
  };

  return (
    <MobileLayout title="Laporan">
      {/* Filters & Actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <select
            className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs"
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
            className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs"
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
        <Button variant="secondary" size="sm" onClick={exportCSV}>
          <Download className="w-3.5 h-3.5" />
          CSV
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="kpi-card overflow-hidden">
          <div className="kpi-label">masuk</div>
          <div className="kpi-value text-emerald-600 truncate">
            {formatIDRSingkat(data.monthlyIncome)}
          </div>
        </div>
        <div className="kpi-card overflow-hidden">
          <div className="kpi-label">keluar</div>
          <div className="kpi-value text-red-600 truncate">
            {formatIDRSingkat(data.monthlyExpense)}
          </div>
        </div>
        <div className="kpi-card overflow-hidden">
          <div className="kpi-label">Selisih</div>
          <div
            className={`kpi-value truncate ${
              data.monthlyIncome - data.monthlyExpense >= 0
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {formatIDRSingkat(data.monthlyIncome - data.monthlyExpense)}
          </div>
        </div>
      </div>

      {/* Income by Category */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Pemasukan per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          {data.incomeByCategory.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">
              Tidak ada data
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={data.incomeByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.incomeByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || "#059669"}
                      />
                    ))}
                  </Pie>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip formatter={(value: any) => formatIDR(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.incomeByCategory.map((item, i) => (
                  <div key={i} className="flex items-center text-xs">
                    <div
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: item.color || "#059669" }}
                    />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Expense by Category */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Pengeluaran per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          {data.expenseByCategory.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">
              Tidak ada data
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={data.expenseByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.expenseByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || "#dc2626"}
                      />
                    ))}
                  </Pie>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip formatter={(value: any) => formatIDR(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.expenseByCategory.map((item, i) => (
                  <div key={i} className="flex items-center text-xs">
                    <div
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: item.color || "#dc2626" }}
                    />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Daily Transactions Chart */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Transaksi Harian</CardTitle>
        </CardHeader>
        <CardContent>
          {data.dailyTransactions.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">
              Tidak ada data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.dailyTransactions}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })
                  }
                />
                <YAxis tick={{ fontSize: 10 }} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Tooltip
                  formatter={(value: any) => formatIDR(Number(value))}
                  labelFormatter={(label: any) =>
                    new Date(String(label)).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                    })
                  }
                />
                <Bar dataKey="income" name="Masuk" fill="#059669" radius={[2, 2, 0, 0]} />
                <Bar dataKey="expense" name="Keluar" fill="#dc2626" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Daily Transactions Table */}
      {data.dailyTransactions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Detail Harian</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {data.dailyTransactions.map((t) => (
                <div key={t.date} className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs text-gray-600">
                    {new Date(t.date).toLocaleDateString("id-ID", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <div className="flex space-x-3">
                    <span className="text-xs font-medium tabular-nums text-emerald-600">
                      {t.income > 0 ? `+${formatIDR(t.income)}` : "-"}
                    </span>
                    <span className="text-xs font-medium tabular-nums text-red-600">
                      {t.expense > 0 ? `-${formatIDR(t.expense)}` : "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </MobileLayout>
  );
}
