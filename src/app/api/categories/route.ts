import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
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

    // Check duplicate name for same user and type
    const existing = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.userId, userId),
          eq(categories.name, name),
          eq(categories.type, type)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Kategori dengan nama ini sudah ada" },
        { status: 400 }
      );
    }

    const categoryId = generateId();
    await db.insert(categories).values({
      id: categoryId,
      userId,
      name,
      type,
      icon: icon || "tag",
      color: color || "#6b7280",
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

export async function PUT(req: Request) {
  try {
    const sessionCookie = req.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];

    if (!sessionCookie) {
      return NextResponse.json({ error: "Tidak ada sesi" }, { status: 401 });
    }

    const userId = sessionCookie;
    const { id, name, type, icon, color } = await req.json();

    if (!id || !name || !type) {
      return NextResponse.json(
        { error: "ID, nama, dan jenis harus diisi" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.id, id),
          eq(categories.userId, userId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check duplicate name for same user and type (excluding current)
    const duplicate = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.userId, userId),
          eq(categories.name, name),
          eq(categories.type, type)
        )
      )
      .limit(1);

    if (duplicate.length > 0 && duplicate[0].id !== id) {
      return NextResponse.json(
        { error: "Kategori dengan nama ini sudah ada" },
        { status: 400 }
      );
    }

    await db
      .update(categories)
      .set({ name, type, icon: icon || "tag", color: color || "#6b7280" })
      .where(eq(categories.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Categories PUT error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const sessionCookie = req.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];

    if (!sessionCookie) {
      return NextResponse.json({ error: "Tidak ada sesi" }, { status: 401 });
    }

    const userId = sessionCookie;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID kategori harus diisi" },
        { status: 400 }
      );
    }

    // Verify ownership
    const category = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.id, id),
          eq(categories.userId, userId)
        )
      )
      .limit(1);

    if (category.length === 0) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    await db.delete(categories).where(eq(categories.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Categories DELETE error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
