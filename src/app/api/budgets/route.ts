import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { budgets, transactions, categories } from "@/lib/db/schema";
import { eq, and, sum } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const sessionCookie = req.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];

    if (!sessionCookie) {
      return NextResponse.json({ error: "Tidak ada sesi" }, { status: 401 });
    }

    const userId = sessionCookie;
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString());
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    const userBudgets = await db
      .select({
        id: budgets.id,
        categoryId: budgets.categoryId,
        categoryName: categories.name,
        amount: budgets.amount,
        month: budgets.month,
        year: budgets.year,
      })
      .from(budgets)
      .leftJoin(categories, eq(budgets.categoryId, categories.id))
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.month, month),
          eq(budgets.year, year)
        )
      );

    // Calculate spent amount for each budget
    const budgetsWithSpent = await Promise.all(
      userBudgets.map(async (budget) => {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0);

        const spentResult = await db
          .select({ total: sum(transactions.amount) })
          .from(transactions)
          .where(
            and(
              eq(transactions.userId, userId),
              eq(transactions.categoryId, budget.categoryId),
              eq(transactions.type, "expense"),
              eq(transactions.date, startOfMonth)
            )
          );

        return {
          ...budget,
          spent: spentResult[0]?.total || 0,
        };
      })
    );

    return NextResponse.json({ budgets: budgetsWithSpent });
  } catch (error) {
    console.error("Budgets GET error:", error);
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
    const { categoryId, amount, month, year } = await req.json();

    if (!categoryId || !amount || !month || !year) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Check if budget already exists for this category and month
    const existingBudget = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.categoryId, categoryId),
          eq(budgets.month, month),
          eq(budgets.year, year)
        )
      )
      .limit(1);

    if (existingBudget.length > 0) {
      return NextResponse.json(
        { error: "Budget untuk kategori ini sudah ada" },
        { status: 400 }
      );
    }

    const budgetId = generateId();
    await db.insert(budgets).values({
      id: budgetId,
      userId,
      categoryId,
      amount,
      month,
      year,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, budgetId });
  } catch (error) {
    console.error("Budgets POST error:", error);
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
    const { searchParams } = new URL(req.url);
    const budgetId = searchParams.get("id");

    if (!budgetId) {
      return NextResponse.json(
        { error: "ID budget tidak valid" },
        { status: 400 }
      );
    }

    const { amount } = await req.json();

    await db
      .update(budgets)
      .set({ amount })
      .where(
        and(
          eq(budgets.id, budgetId),
          eq(budgets.userId, userId)
        )
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Budgets PUT error:", error);
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
    const budgetId = searchParams.get("id");

    if (!budgetId) {
      return NextResponse.json(
        { error: "ID budget tidak valid" },
        { status: 400 }
      );
    }

    await db
      .delete(budgets)
      .where(
        and(
          eq(budgets.id, budgetId),
          eq(budgets.userId, userId)
        )
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Budgets DELETE error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
