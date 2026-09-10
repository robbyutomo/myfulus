"use client";

import { useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/hooks/useData";
import { useAppStore } from "@/store/useAppStore";
import { Plus, Trash2, X, Tag } from "lucide-react";

interface CategoryWithColor {
  id: string;
  name: string;
  type: "income" | "expense";
  color?: string;
}

const COLORS = [
  "#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
  "#ec4899", "#f43f5e", "#6b7280", "#78716c", "#57534e",
];

const ICONS = [
  "tag", "utensils", "car", "shopping-bag", "receipt",
  "gamepad-2", "heart", "book-open", "briefcase", "laptop",
  "trending-up", "gift", "home", "wifi", "smartphone",
];

export default function CategoriesPage() {
  const categories = useCategories();
  const { setCategories } = useAppStore();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    color: "#6b7280",
    icon: "tag",
  });

  const expenseCategories = (categories?.filter(c => c.type === "expense") || []) as CategoryWithColor[];
  const incomeCategories = (categories?.filter(c => c.type === "income") || []) as CategoryWithColor[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({ name: "", type: "expense", color: "#6b7280", icon: "tag" });
        const data = await fetch("/api/categories").then(r => r.json());
        setCategories(data.categories || []);
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menambah kategori");
      }
    } catch (error) {
      console.error("Failed to add category:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kategori ini?")) return;
    
    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await fetch("/api/categories").then(r => r.json());
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  return (
    <MobileLayout title="Kategori">
      {/* Actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          {categories?.length || 0} kategori
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="w-4 h-4" />
          Tambah
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card className="mb-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Kategori Baru</CardTitle>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 bg-transparent border-none p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  Nama Kategori
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Oleh-oleh"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
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
                    setFormData({ ...formData, type: e.target.value as "income" | "expense" })
                  }
                >
                  <option value="expense">Pengeluaran</option>
                  <option value="income">Pemasukan</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  Warna
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        formData.color === color
                          ? "border-gray-900 scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
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

      {/* Expense Categories */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Pengeluaran ({expenseCategories.length})
        </h3>
        {expenseCategories.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-xs text-gray-500">
              Belum ada kategori pengeluaran
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {expenseCategories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: category.color || "#6b7280" }}
                    >
                      <Tag className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-gray-300 hover:text-red-500 bg-transparent border-none p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Income Categories */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Pemasukan ({incomeCategories.length})
        </h3>
        {incomeCategories.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-xs text-gray-500">
              Belum ada kategori pemasukan
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {incomeCategories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: category.color || "#059669" }}
                    >
                      <Tag className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-gray-300 hover:text-red-500 bg-transparent border-none p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
