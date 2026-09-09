"use client";

import { useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatIDR } from "@/lib/utils";
import { useCachedFetch } from "@/hooks/useCachedFetch";
import { Plus, Edit2, Trash2, X } from "lucide-react";

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

interface BudgetsData {
  budgets: Budget[];
}

interface CategoriesData {
  categories: Category[];
}

export default function BudgetsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const { data: budgetData, loading: budgetLoading, refresh: refreshBudgets } = useCachedFetch<BudgetsData>(
    `/api/budgets?month=${currentMonth}&year=${currentYear}`
  );
  const { data: catData, loading: catLoading } = useCachedFetch<CategoriesData>("/api/categories");
  
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
  });

  const loading = budgetLoading || catLoading;
  const budgets = budgetData?.budgets || [];
  const categories = (catData?.categories || []).filter((c: Category) => c.type === "expense");

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
        refreshBudgets();
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
        refreshBudgets();
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
      <MobileLayout title="Budget">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-md border border-gray-200 p-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="h-2 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Budget">
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
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="w-4 h-4" />
          Tambah
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="mb-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">
              {editingBudget ? "Edit Budget" : "Budget Baru"}
            </CardTitle>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingBudget(null);
              }}
              className="text-gray-400 hover:text-gray-600 bg-transparent border-none p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
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
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  Simpan
                </Button>
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
        <div className="space-y-3">
          {budgets.map((budget) => {
            const percentage = Math.round(
              (budget.spent / budget.amount) * 100
            );
            const status = getProgressStatus(budget.spent, budget.amount);
            const remaining = Math.max(budget.amount - budget.spent, 0);

            return (
              <Card key={budget.id}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-gray-900">
                      {budget.categoryName}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="text-gray-400 hover:text-emerald-600 bg-transparent border-none p-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="text-gray-400 hover:text-red-500 bg-transparent border-none p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 tabular-nums">
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
                    <div className="flex justify-between text-xs">
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
        <Card className="mt-4">
          <CardContent className="p-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">Budget</div>
                <div className="text-xs font-semibold tabular-nums text-gray-900">
                  {formatIDR(budgets.reduce((sum, b) => sum + b.amount, 0))}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">Terpakai</div>
                <div className="text-xs font-semibold tabular-nums text-red-600">
                  {formatIDR(budgets.reduce((sum, b) => sum + b.spent, 0))}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">Sisa</div>
                <div className="text-xs font-semibold tabular-nums text-emerald-600">
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
    </MobileLayout>
  );
}
