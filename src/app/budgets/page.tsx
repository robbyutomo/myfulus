"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatIDR } from "@/lib/utils";
import { ArrowLeft, Plus, Edit2, Trash2 } from "lucide-react";

interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  spent: number;
  month: number;
  year: number;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}

export default function BudgetsPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
  });

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
      await fetchBudgets();
      await fetchCategories();
    } catch (error) {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgets = async () => {
    try {
      const res = await fetch(
        `/api/budgets?month=${currentMonth}&year=${currentYear}`
      );
      if (res.ok) {
        const data = await res.json();
        setBudgets(data.budgets);
      }
    } catch (error) {
      console.error("Failed to fetch budgets:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories.filter((c: Category) => c.type === "expense"));
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBudget
        ? `/api/budgets?id=${editingBudget.id}`
        : "/api/budgets";
      const method = editingBudget ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: formData.categoryId,
          amount: parseFloat(formData.amount),
          month: currentMonth,
          year: currentYear,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingBudget(null);
        setFormData({ categoryId: "", amount: "" });
        await fetchBudgets();
      }
    } catch (error) {
      console.error("Failed to save budget:", error);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      categoryId: budget.categoryId,
      amount: budget.amount.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/budgets?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchBudgets();
      }
    } catch (error) {
      console.error("Failed to delete budget:", error);
    }
  };

  const getProgressStatus = (spent: number, amount: number) => {
    const percentage = (spent / amount) * 100;
    if (percentage >= 100) return "negative";
    if (percentage >= 80) return "warning";
    return "positive";
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
              Budget Bulanan
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
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Tambah Budget
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingBudget ? "Edit Budget" : "Tambah Budget Baru"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                      <option value="">Pilih kategori</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">
                      Anggaran
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
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">Simpan</Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowForm(false);
                      setEditingBudget(null);
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Budget Cards */}
        {budgets.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-gray-500">
              Belum ada budget untuk bulan ini
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((budget) => {
              const percentage = Math.round(
                (budget.spent / budget.amount) * 100
              );
              const status = getProgressStatus(budget.spent, budget.amount);
              const remaining = Math.max(budget.amount - budget.spent, 0);

              return (
                <Card key={budget.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm font-medium text-gray-900">
                        {budget.categoryName}
                      </CardTitle>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(budget)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(budget.id)}
                        >
                          <Trash2 className="w-3 h-3 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {/* Progress */}
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">
                          {formatIDR(budget.spent)} / {formatIDR(budget.amount)}
                        </span>
                        <span className={`font-medium text-${status}`}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${status}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>

                      {/* Remaining */}
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-gray-400">Sisa</span>
                        <span className="font-medium tabular-nums text-gray-600">
                          {formatIDR(remaining)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {budgets.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Total Budget</div>
                  <div className="text-sm font-semibold tabular-nums text-gray-900">
                    {formatIDR(
                      budgets.reduce((sum, b) => sum + b.amount, 0)
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Terpakai</div>
                  <div className="text-sm font-semibold tabular-nums text-red-600">
                    {formatIDR(
                      budgets.reduce((sum, b) => sum + b.spent, 0)
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Sisa</div>
                  <div className="text-sm font-semibold tabular-nums text-emerald-600">
                    {formatIDR(
                      budgets.reduce(
                        (sum, b) => sum + Math.max(b.amount - b.spent, 0),
                        0
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
