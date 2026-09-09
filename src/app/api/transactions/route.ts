import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { transactions, categories } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const sessionCookie = req.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];

    if (!sessionCookie) {
      return NextResponse.json({ error: "Tidak ada sesi" }, { status: 401 });
    }

    const userId = sessionCookie;

    const userTransactions = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        type: transactions.type,
        description: transactions.description,
        date: transactions.date,
        category: categories.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));

    return NextResponse.json({
      transactions: userTransactions.map((t) => ({
        ...t,
        date: t.date.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Transactions GET error:", error);
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
    const { amount, type, description, categoryId, date } = await req.json();

    // Validasi input
    if (!amount || !type || !categoryId || !date) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0 || !isFinite(amount)) {
      return NextResponse.json(
        { error: "Jumlah harus angka positif" },
        { status: 400 }
      );
    }

    if (type !== "income" && type !== "expense") {
      return NextResponse.json(
        { error: "Jenis harus income atau expense" },
        { status: 400 }
      );
    }

    // Validasi categoryId milik user
    const category = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .limit(1);

    if (category.length === 0) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 400 }
      );
    }

    // Validasi tanggal valid
    const transactionDate = new Date(date);
    if (isNaN(transactionDate.getTime())) {
      return NextResponse.json(
        { error: "Tanggal tidak valid" },
        { status: 400 }
      );
    }

    const transactionId = generateId();
    await db.insert(transactions).values({
      id: transactionId,
      userId,
      categoryId,
      amount,
      description: description || "",
      type,
      date: transactionDate,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, transactionId });
  } catch (error) {
    console.error("Transactions POST error:", error);
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
    const transactionId = searchParams.get("id");

    if (!transactionId) {
      return NextResponse.json(
        { error: "ID transaksi tidak valid" },
        { status: 400 }
      );
    }

    await db
      .delete(transactions)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userId)
        )
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Transactions DELETE error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
