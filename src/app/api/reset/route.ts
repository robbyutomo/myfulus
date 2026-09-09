import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { transactions, budgets, savingsGoals, categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "@/lib/utils";

const DEFAULT_CATEGORIES = [
  { name: "Makanan & Minuman", type: "expense" as const, icon: "utensils", color: "#ef4444" },
  { name: "Transportasi", type: "expense" as const, icon: "car", color: "#f97316" },
  { name: "Belanja", type: "expense" as const, icon: "shopping-bag", color: "#eab308" },
  { name: "Tagihan", type: "expense" as const, icon: "receipt", color: "#84cc16" },
  { name: "Hiburan", type: "expense" as const, icon: "gamepad-2", color: "#22c55e" },
  { name: "Kesehatan", type: "expense" as const, icon: "heart", color: "#14b8a6" },
  { name: "Pendidikan", type: "expense" as const, icon: "book-open", color: "#06b6d4" },
  { name: "Lainnya", type: "expense" as const, icon: "more-horizontal", color: "#8b5cf6" },
  { name: "Gaji", type: "income" as const, icon: "briefcase", color: "#059669" },
  { name: "Freelance", type: "income" as const, icon: "laptop", color: "#10b981" },
  { name: "Investasi", type: "income" as const, icon: "trending-up", color: "#6366f1" },
  { name: "Hadiah", type: "income" as const, icon: "gift", color: "#8b5cf6" },
  { name: "Lainnya", type: "income" as const, icon: "more-horizontal", color: "#059669" },
];

export async function POST(req: Request) {
  try {
    const sessionCookie = req.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];

    if (!sessionCookie) {
      return NextResponse.json({ error: "Tidak ada sesi" }, { status: 401 });
    }

    const userId = sessionCookie;
    const { password } = await req.json();

    // Verifikasi password
    const { compare } = await import("bcryptjs");
    const { users } = await import("@/lib/db/schema");
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    if (!password) {
      return NextResponse.json({ error: "Password harus diisi" }, { status: 400 });
    }

    const isValid = await compare(password, user[0].passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // Hapus semua data user
    await db.delete(transactions).where(eq(transactions.userId, userId));
    await db.delete(budgets).where(eq(budgets.userId, userId));
    await db.delete(savingsGoals).where(eq(savingsGoals.userId, userId));
    await db.delete(categories).where(eq(categories.userId, userId));

    // Buat ulang default categories
    const categoryValues = DEFAULT_CATEGORIES.map((cat) => ({
      id: generateId(),
      userId,
      name: cat.name,
      type: cat.type,
      icon: cat.icon,
      color: cat.color,
      createdAt: new Date(),
    }));

    await db.insert(categories).values(categoryValues);

    return NextResponse.json({ ok: true, message: "Data berhasil direset" });
  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
