"use client";

import { useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatIDR } from "@/lib/utils";
import { useTransactions, useCategories } from "@/hooks/useData";
import { useAppStore } from "@/store/useAppStore";
import { Plus, Trash2, X } from "lucide-react";

export default function TransactionsPage() {
  const transactions = useTransactions();
  const categories = useCategories();
  const { setTransactions } = useAppStore();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    type: "expense" as "income" | "expense",
    description: "",
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({
          amount: "",
          type: "expense",
          description: "",
          categoryId: "",
          date: new Date().toISOString().split("T")[0],
        });
        const data = await fetch("/api/transactions").then(r => r.json());
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Failed to add transaction:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await fetch("/api/transactions").then(r => r.json());
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  return (
    <MobileLayout title="Transaksi">
      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          {transactions.length} transaksi
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Tambah
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card className="mb-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Transaksi Baru</CardTitle>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 bg-transparent border-none p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">
                    Jumlah
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">
                    Jenis
                  </label>
                  <select
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "income" | "expense",
                      })
                    }
                  >
                    <option value="expense">Pengeluaran</option>
                    <option value="income">Pemasukan</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">
                    Kategori
                  </label>
                  <select
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    required
                  >
                    <option value="">Pilih</option>
                    {categories
                      .filter((c) => c.type === formData.type)
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">
                    Tanggal
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  Deskripsi
                </label>
                <Input
                  type="text"
                  placeholder="Catatan"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  Simpan
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <Card>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Belum ada transaksi
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        transaction.type === "income"
                          ? "bg-emerald-500"
                          : "bg-red-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-sm text-gray-900 truncate">
                        {transaction.description || "Tanpa deskripsi"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {transaction.category} &middot;{" "}
                        {new Date(transaction.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
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
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-gray-300 hover:text-red-500 bg-transparent border-none p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </MobileLayout>
  );
}
