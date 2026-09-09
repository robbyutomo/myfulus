import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { transactions, categories } from "@/lib/db/schema";
import { eq, and, sum, gte, lte, desc } from "drizzle-orm";

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

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    // Get all transactions for the month
    const monthTransactions = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        type: transactions.type,
        description: transactions.description,
        date: transactions.date,
        categoryName: categories.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startOfMonth),
          lte(transactions.date, endOfMonth)
        )
      )
      .orderBy(desc(transactions.date));

    // Calculate totals
    const monthlyIncome = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Group by category for income
    const incomeByCategory = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => {
        const category = t.categoryName || "Lainnya";
        const existing = acc.find((item) => item.name === category);
        if (existing) {
          existing.value += t.amount;
        } else {
          acc.push({ name: category, value: t.amount, color: "" });
        }
        return acc;
      }, [] as Array<{ name: string; value: number; color: string }>);

    // Group by category for expense
    const expenseByCategory = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        const category = t.categoryName || "Lainnya";
        const existing = acc.find((item) => item.name === category);
        if (existing) {
          existing.value += t.amount;
        } else {
          acc.push({ name: category, value: t.amount, color: "" });
        }
        return acc;
      }, [] as Array<{ name: string; value: number; color: string }>);

    // Group by day
    const dailyTransactions = monthTransactions.reduce((acc, t) => {
      const dateStr = t.date.toISOString().split("T")[0];
      const existing = acc.find((item) => item.date === dateStr);
      if (existing) {
        if (t.type === "income") {
          existing.income += t.amount;
        } else {
          existing.expense += t.amount;
        }
      } else {
        acc.push({
          date: dateStr,
          income: t.type === "income" ? t.amount : 0,
          expense: t.type === "expense" ? t.amount : 0,
        });
      }
      return acc;
    }, [] as Array<{ date: string; income: number; expense: number }>);

    // Sort by date
    dailyTransactions.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      monthlyIncome,
      monthlyExpense,
      incomeByCategory,
      expenseByCategory,
      dailyTransactions,
    });
  } catch (error) {
    console.error("Reports GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
