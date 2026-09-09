"use client";

import { useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatIDR } from "@/lib/utils";
import { useCachedFetch } from "@/hooks/useCachedFetch";
import { Plus, Edit2, Trash2, Target, X } from "lucide-react";

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  createdAt: string;
}

interface SavingsData {
  savingsGoals: SavingsGoal[];
}

export default function SavingsPage() {
  const { data: savingsData, loading, refresh: refreshSavings } = useCachedFetch<SavingsData>("/api/savings");
  
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
  });

  const savingsGoals = savingsData?.savingsGoals || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingGoal
        ? `/api/savings?id=${editingGoal.id}`
        : "/api/savings";
      const method = editingGoal ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          targetAmount: parseFloat(formData.targetAmount),
          deadline: formData.deadline || null,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingGoal(null);
        setFormData({ name: "", targetAmount: "", deadline: "" });
        refreshSavings();
      }
    } catch (error) {
      console.error("Failed to save savings goal:", error);
    }
  };

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      deadline: goal.deadline ? goal.deadline.split("T")[0] : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/savings?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        refreshSavings();
      }
    } catch (error) {
      console.error("Failed to delete savings goal:", error);
    }
  };

  const handleAddAmount = async (id: string, amount: number) => {
    try {
      const res = await fetch(`/api/savings?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (res.ok) {
        refreshSavings();
      }
    } catch (error) {
      console.error("Failed to add amount:", error);
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline: string | null) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <MobileLayout title="Tabungan">
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-md border border-gray-200 p-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
              <div className="h-2 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Tabungan">
      {/* Actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          {savingsGoals.length} target
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
              {editingGoal ? "Edit Target" : "Target Baru"}
            </CardTitle>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingGoal(null);
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
                  Nama Target
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Liburan ke Bali"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">
                    Jumlah Target
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.targetAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAmount: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">
                    Deadline
                  </label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                  />
                </div>
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
                    setEditingGoal(null);
                  }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Savings Goals */}
      {savingsGoals.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-gray-500">
            Belum ada target tabungan
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {savingsGoals.map((goal) => {
            const percentage = getProgressPercentage(
              goal.currentAmount,
              goal.targetAmount
            );
            const remaining = Math.max(
              goal.targetAmount - goal.currentAmount,
              0
            );
            const daysRemaining = getDaysRemaining(goal.deadline);

            return (
              <Card key={goal.id}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-emerald-600" />
                      <div className="text-sm font-medium text-gray-900">
                        {goal.name}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="text-gray-400 hover:text-emerald-600 bg-transparent border-none p-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="text-gray-400 hover:text-red-500 bg-transparent border-none p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 tabular-nums">
                        {formatIDR(goal.currentAmount)} / {formatIDR(goal.targetAmount)}
                      </span>
                      <span className="font-medium tabular-nums text-gray-700">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill positive"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <div>
                        <span className="text-gray-400">Sisa </span>
                        <span className="font-medium tabular-nums text-gray-600">
                          {formatIDR(remaining)}
                        </span>
                      </div>
                      {goal.deadline && (
                        <div>
                          <span className="text-gray-400">
                            {daysRemaining !== null && (
                              <span
                                className={
                                  daysRemaining < 0
                                    ? "text-red-500"
                                    : daysRemaining < 30
                                    ? "text-amber-500"
                                    : "text-gray-500"
                                }
                              >
                                {daysRemaining < 0
                                  ? `${Math.abs(daysRemaining)}h lalu`
                                  : `${daysRemaining}hari lagi`}
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full mt-1"
                      onClick={() => {
                        const amount = prompt(
                          "Masukkan jumlah yang ingin ditambahkan:"
                        );
                        if (amount && !isNaN(parseFloat(amount))) {
                          handleAddAmount(goal.id, parseFloat(amount));
                        }
                      }}
                    >
                      Tambah Tabungan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {savingsGoals.length > 0 && (
        <Card className="mt-4">
          <CardContent className="p-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">Target</div>
                <div className="text-xs font-semibold tabular-nums text-gray-900">
                  {formatIDR(
                    savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0)
                  )}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">Terkumpul</div>
                <div className="text-xs font-semibold tabular-nums text-emerald-600">
                  {formatIDR(
                    savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0)
                  )}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">Sisa</div>
                <div className="text-xs font-semibold tabular-nums text-gray-600">
                  {formatIDR(
                    savingsGoals.reduce(
                      (sum, g) =>
                        sum + Math.max(g.targetAmount - g.currentAmount, 0),
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
