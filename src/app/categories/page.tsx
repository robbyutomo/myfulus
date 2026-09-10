"use client";

import { useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/hooks/useData";
import { useAppStore } from "@/store/useAppStore";
import {
  Plus, Trash2, X, Tag,
  Utensils, Coffee, Pizza, Cake, Apple, Beef, Wine, Beer, IceCream, Sandwich,
  Car, Bus, Train, Plane, Bike, Ship, Truck, Fuel, MapPin, Navigation,
  ShoppingBag, ShoppingCart, Store, Package, Gift, CreditCard, Wallet, Coins, Banknote, Receipt,
  Home, Sofa, Lamp, Tv, Monitor, Smartphone, Laptop, Wifi, Phone, Camera,
  Briefcase, Building, Factory, Warehouse, DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart,
  Heart, Activity, Pill, Stethoscope, Thermometer, Syringe, Eye, Ear, Smile, Frown,
  BookOpen, Book, GraduationCap, PenTool, Pencil, Calculator, FileText, Newspaper, Library, Award,
  Dumbbell, Trophy, Medal, Target, Zap, Timer, Clock, Calendar, Flame, Sun,
  TreePine, Flower2, Leaf, Cloud, Moon, Star, Droplets, Fish, Bird, Bug,
  Gamepad2, Music, Headphones, Mic, Film, Image, Palette, Scissors, Ruler, Compass,
  Users, User, MessageCircle, Mail, Bell, Lock, Key, Shield,
  ThumbsUp, ThumbsDown, AlertCircle, CheckCircle, XCircle, HelpCircle, Info, Settings, Wrench,
} from "lucide-react";

interface CategoryWithColor {
  id: string;
  name: string;
  type: "income" | "expense";
  color?: string;
  icon?: string;
}

const ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  Utensils, Coffee, Pizza, Cake, Apple, Beef, Wine, Beer, IceCream, Sandwich,
  Car, Bus, Train, Plane, Bike, Ship, Truck, Fuel, MapPin, Navigation,
  ShoppingBag, ShoppingCart, Store, Package, Gift, CreditCard, Wallet, Coins, Banknote, Receipt,
  Home, Sofa, Lamp, Tv, Monitor, Smartphone, Laptop, Wifi, Phone, Camera,
  Briefcase, Building, Factory, Warehouse, DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart,
  Heart, Activity, Pill, Stethoscope, Thermometer, Syringe, Eye, Ear, Smile, Frown,
  BookOpen, Book, GraduationCap, PenTool, Pencil, Calculator, FileText, Newspaper, Library, Award,
  Dumbbell, Trophy, Medal, Target, Zap, Timer, Clock, Calendar, Flame, Sun,
  TreePine, Flower2, Leaf, Cloud, Moon, Star, Droplets, Fish, Bird, Bug,
  Gamepad2, Music, Headphones, Mic, Film, Image, Palette, Scissors, Ruler, Compass,
  Users, User, MessageCircle, Mail, Bell, Lock, Key, Shield,
  ThumbsUp, ThumbsDown, AlertCircle, CheckCircle, XCircle, HelpCircle, Info, Settings, Wrench,
};

const COLORS = [
  "#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
  "#ec4899", "#f43f5e", "#6b7280", "#78716c", "#57534e",
];

const ICON_CATEGORIES = [
  { name: "Makanan", icons: ["Utensils", "Coffee", "Pizza", "Cake", "Apple", "Beef", "Wine", "Beer", "IceCream", "Sandwich"] },
  { name: "Transport", icons: ["Car", "Bus", "Train", "Plane", "Bike", "Ship", "Truck", "Fuel", "MapPin", "Navigation"] },
  { name: "Belanja", icons: ["ShoppingBag", "ShoppingCart", "Store", "Package", "Gift", "CreditCard", "Wallet", "Coins", "Banknote", "Receipt"] },
  { name: "Rumah", icons: ["Home", "Sofa", "Lamp", "Tv", "Monitor", "Smartphone", "Laptop", "Wifi", "Phone", "Camera"] },
  { name: "Kerja", icons: ["Briefcase", "Building", "Factory", "Warehouse", "DollarSign", "TrendingUp", "TrendingDown", "BarChart3", "PieChart"] },
  { name: "Kesehatan", icons: ["Heart", "Activity", "Pill", "Stethoscope", "Thermometer", "Syringe", "Eye", "Ear", "Smile", "Frown"] },
  { name: "Pendidikan", icons: ["BookOpen", "Book", "GraduationCap", "PenTool", "Pencil", "Calculator", "FileText", "Newspaper", "Library", "Award"] },
  { name: "Olahraga", icons: ["Dumbbell", "Trophy", "Medal", "Target", "Zap", "Timer", "Clock", "Calendar", "Flame", "Sun"] },
  { name: "Alam", icons: ["TreePine", "Flower2", "Leaf", "Cloud", "Moon", "Star", "Droplets", "Fish", "Bird", "Bug"] },
  { name: "Hiburan", icons: ["Gamepad2", "Music", "Headphones", "Mic", "Film", "Image", "Palette", "Scissors", "Ruler", "Compass"] },
  { name: "Sosial", icons: ["Users", "User", "MessageCircle", "Mail", "Bell", "Lock", "Key", "Shield"] },
  { name: "Simbol", icons: ["ThumbsUp", "ThumbsDown", "AlertCircle", "CheckCircle", "XCircle", "HelpCircle", "Info", "Settings", "Wrench"] },
];

export default function CategoriesPage() {
  const categories = useCategories();
  const { setCategories } = useAppStore();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedIconCategory, setSelectedIconCategory] = useState("Makanan");
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    color: "#6b7280",
    icon: "Tag",
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
        setFormData({ name: "", type: "expense", color: "#6b7280", icon: "Tag" });
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

  const SelectedIcon = ICON_COMPONENTS[formData.icon] || Tag;

  return (
    <MobileLayout title="Kategori">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          {categories?.length || 0} kategori
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="w-4 h-4" />
          Tambah
        </Button>
      </div>

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
          <CardContent className="space-y-3">
            <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: formData.color }}
              >
                <SelectedIcon className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Nama</label>
              <Input
                type="text"
                placeholder="Contoh: Makan Siang"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Jenis</label>
              <select
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as "income" | "expense" })}
              >
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Icon</label>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {ICON_CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setSelectedIconCategory(cat.name)}
                    className={`px-2 py-1 text-xs rounded-full whitespace-nowrap border transition-colors ${
                      selectedIconCategory === cat.name
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1 max-h-32 overflow-y-auto">
              {ICON_CATEGORIES.find(c => c.name === selectedIconCategory)?.icons.map((iconName) => {
                const IconComp = ICON_COMPONENTS[iconName];
                if (!IconComp) return null;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: iconName })}
                    className={`p-2 rounded-lg border transition-all ${
                      formData.icon === iconName
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <IconComp className="w-5 h-5 mx-auto text-gray-700" />
                  </button>
                );
              })}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Warna</label>
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
              <Button type="button" onClick={handleSubmit} className="flex-1">
                Simpan
              </Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Pengeluaran ({expenseCategories.length})
        </h3>
        {expenseCategories.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-xs text-gray-500">
              Belum ada kategori
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {expenseCategories.map((category) => {
              const IconComp = ICON_COMPONENTS[category.icon || "Tag"] || Tag;
              return (
                <Card key={category.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: category.color || "#6b7280" }}
                      >
                        <IconComp className="w-4 h-4 text-white" />
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
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Pemasukan ({incomeCategories.length})
        </h3>
        {incomeCategories.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-xs text-gray-500">
              Belum ada kategori
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {incomeCategories.map((category) => {
              const IconComp = ICON_COMPONENTS[category.icon || "Tag"] || Tag;
              return (
                <Card key={category.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: category.color || "#059669" }}
                      >
                        <IconComp className="w-4 h-4 text-white" />
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
              );
            })}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
