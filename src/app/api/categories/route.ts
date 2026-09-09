import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const sessionCookie = req.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];

    if (!sessionCookie) {
      return NextResponse.json({ error: "Tidak ada sesi" }, { status: 401 });
    }

    const userId = sessionCookie;

    const userCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId));

    return NextResponse.json({ categories: userCategories });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const sessionCookie = req.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];

    if (!sessionCookie) {
      return NextResponse.json({ error: "Tidak ada sesi" }, { status: 401 });
    }

    const userId = sessionCookie;
    const { name, type, icon, color } = await req.json();

    if (!name || !type) {
      return NextResponse.json(
        { error: "Nama dan jenis harus diisi" },
        { status: 400 }
      );
    }

    const categoryId = generateId();
    await db.insert(categories).values({
      id: categoryId,
      userId,
      name,
      type,
      icon,
      color,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, categoryId });
  } catch (error) {
    console.error("Categories POST error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
