import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { generateId } from "@/lib/utils";

const DEFAULT_CATEGORIES = [
  // Expense categories
  { name: "Makanan & Minuman", type: "expense" as const, icon: "utensils", color: "#ef4444" },
  { name: "Transportasi", type: "expense" as const, icon: "car", color: "#f97316" },
  { name: "Belanja", type: "expense" as const, icon: "shopping-bag", color: "#eab308" },
  { name: "Tagihan", type: "expense" as const, icon: "receipt", color: "#84cc16" },
  { name: "Hiburan", type: "expense" as const, icon: "gamepad-2", color: "#22c55e" },
  { name: "Kesehatan", type: "expense" as const, icon: "heart", color: "#14b8a6" },
  { name: "Pendidikan", type: "expense" as const, icon: "book-open", color: "#06b6d4" },
  { name: "Lainnya", type: "expense" as const, icon: "more-horizontal", color: "#8b5cf6" },
  // Income categories
  { name: "Gaji", type: "income" as const, icon: "briefcase", color: "#059669" },
  { name: "Freelance", type: "income" as const, icon: "laptop", color: "#10b981" },
  { name: "Investasi", type: "income" as const, icon: "trending-up", color: "#6366f1" },
  { name: "Hadiah", type: "income" as const, icon: "gift", color: "#8b5cf6" },
  { name: "Lainnya", type: "income" as const, icon: "more-horizontal", color: "#059669" },
];

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, dan nama harus diisi" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Hash password with bcrypt
    const passwordHash = await hash(password, 12);

    // Create user
    const userId = generateId();
    await db.insert(users).values({
      id: userId,
      email,
      name,
      passwordHash,
      createdAt: new Date(),
    });

    // Create default categories
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

    // Set session cookie
    const response = NextResponse.json({ ok: true, userId });
    response.cookies.set("session", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
