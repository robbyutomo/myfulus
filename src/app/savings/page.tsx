"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatIDR } from "@/lib/utils";
import { ArrowLeft, Plus, Edit2, Trash2, Target } from "lucide-react";

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  createdAt: string;
}

export default function SavingsPage() {
  const router = useRouter();
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
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
      await fetchSavingsGoals();
    } catch (error) {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavingsGoals = async () => {
    try {
      const res = await fetch("/api/savings");
      if (res.ok) {
        const data = await res.json();
        setSavingsGoals(data.savingsGoals);
      }
    } catch (error) {
      console.error("Failed to fetch savings goals:", error);
    }
  };

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
        await fetchSavingsGoals();
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
        await fetchSavingsGoals();
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
        await fetchSavingsGoals();
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
              Target Tabungan
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-500">
            {savingsGoals.length} target aktif
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Tambah Target
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingGoal ? "Edit Target Tabungan" : "Tambah Target Baru"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                      Deadline (Opsional)
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
                  <Button type="submit">Simpan</Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-emerald-600" />
                        <CardTitle className="text-sm font-medium text-gray-900">
                          {goal.name}
                        </CardTitle>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(goal)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(goal.id)}
                        >
                          <Trash2 className="w-3 h-3 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">
                            {formatIDR(goal.currentAmount)} /{" "}
                            {formatIDR(goal.targetAmount)}
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
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-gray-400">Sisa</div>
                          <div className="font-medium tabular-nums text-gray-700">
                            {formatIDR(remaining)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">Deadline</div>
                          <div className="font-medium text-gray-700">
                            {goal.deadline ? (
                              <>
                                {new Date(goal.deadline).toLocaleDateString(
                                  "id-ID",
                                  { day: "numeric", month: "short" }
                                )}
                                {daysRemaining !== null && (
                                  <span
                                    className={`ml-1 ${
                                      daysRemaining < 0
                                        ? "text-red-500"
                                        : daysRemaining < 30
                                        ? "text-amber-500"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    ({daysRemaining < 0
                                      ? `${Math.abs(daysRemaining)}h lalu`
                                      : `${daysRemaining}hari lagi`}
                                    )
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
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
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Total Target</div>
                  <div className="text-sm font-semibold tabular-nums text-gray-900">
                    {formatIDR(
                      savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0)
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Terkumpul</div>
                  <div className="text-sm font-semibold tabular-nums text-emerald-600">
                    {formatIDR(
                      savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0)
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Sisa</div>
                  <div className="text-sm font-semibold tabular-nums text-gray-600">
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
      </main>
    </div>
  );
}
