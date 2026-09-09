import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { transactions, budgets, categories } from "@/lib/db/schema";
import { eq, desc, sum, and, gte, lte } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const sessionCookie = req.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];

    if (!sessionCookie) {
      return NextResponse.json({ error: "Tidak ada sesi" }, { status: 401 });
    }

    const userId = sessionCookie;

    // Get current month range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get total income for current month
    const incomeResult = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "income"),
          gte(transactions.date, startOfMonth),
          lte(transactions.date, endOfMonth)
        )
      );

    // Get total expense for current month
    const expenseResult = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "expense"),
          gte(transactions.date, startOfMonth),
          lte(transactions.date, endOfMonth)
        )
      );

    // Get recent transactions
    const recentTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date))
      .limit(5);

    const totalIncome = Number(incomeResult[0]?.total || 0);
    const totalExpense = Number(expenseResult[0]?.total || 0);

    // Get current month budgets with spent
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    const userBudgets = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.userId, userId), eq(budgets.month, month), eq(budgets.year, year)));

    const budgetsWithSpent = await Promise.all(
      userBudgets.map(async (budget) => {
        const spentResult = await db
          .select({ total: sum(transactions.amount) })
          .from(transactions)
          .where(
            and(
              eq(transactions.userId, userId),
              eq(transactions.categoryId, budget.categoryId),
              eq(transactions.type, "expense"),
              gte(transactions.date, startOfMonth),
              lte(transactions.date, endOfMonth)
            )
          );

        const spent = spentResult[0]?.total;
        return {
          id: budget.id,
          amount: budget.amount,
          spent: spent !== null && spent !== undefined ? Number(spent) : 0,
        };
      })
    );

    return NextResponse.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      budgets: budgetsWithSpent,
      recentTransactions: recentTransactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        description: t.description,
        date: t.date.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
