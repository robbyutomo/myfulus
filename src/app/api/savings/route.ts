import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { savingsGoals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const sessionCookie = req.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];

    if (!sessionCookie) {
      return NextResponse.json({ error: "Tidak ada sesi" }, { status: 401 });
    }

    const userId = sessionCookie;

    const userSavingsGoals = await db
      .select()
      .from(savingsGoals)
      .where(eq(savingsGoals.userId, userId));

    return NextResponse.json({
      savingsGoals: userSavingsGoals.map((goal) => ({
        ...goal,
        deadline: goal.deadline?.toISOString() || null,
        createdAt: goal.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Savings GET error:", error);
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
    const { name, targetAmount, deadline } = await req.json();

    if (!name || !targetAmount) {
      return NextResponse.json(
        { error: "Nama dan jumlah target harus diisi" },
        { status: 400 }
      );
    }

    const goalId = generateId();
    await db.insert(savingsGoals).values({
      id: goalId,
      userId,
      name,
      targetAmount,
      currentAmount: 0,
      deadline: deadline ? new Date(deadline) : null,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, goalId });
  } catch (error) {
    console.error("Savings POST error:", error);
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
    const goalId = searchParams.get("id");

    if (!goalId) {
      return NextResponse.json(
        { error: "ID target tidak valid" },
        { status: 400 }
      );
    }

    const { name, targetAmount, deadline } = await req.json();

    await db
      .update(savingsGoals)
      .set({
        name,
        targetAmount,
        deadline: deadline ? new Date(deadline) : null,
      })
      .where(
        and(
          eq(savingsGoals.id, goalId),
          eq(savingsGoals.userId, userId)
        )
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Savings PUT error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const sessionCookie = req.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];

    if (!sessionCookie) {
      return NextResponse.json({ error: "Tidak ada sesi" }, { status: 401 });
    }

    const userId = sessionCookie;
    const { searchParams } = new URL(req.url);
    const goalId = searchParams.get("id");

    if (!goalId) {
      return NextResponse.json(
        { error: "ID target tidak valid" },
        { status: 400 }
      );
    }

    const { amount } = await req.json();

    // Get current amount
    const currentGoal = await db
      .select()
      .from(savingsGoals)
      .where(
        and(
          eq(savingsGoals.id, goalId),
          eq(savingsGoals.userId, userId)
        )
      )
      .limit(1);

    if (currentGoal.length === 0) {
      return NextResponse.json(
        { error: "Target tidak ditemukan" },
        { status: 404 }
      );
    }

    const newAmount = currentGoal[0].currentAmount + amount;

    await db
      .update(savingsGoals)
      .set({ currentAmount: newAmount })
      .where(
        and(
          eq(savingsGoals.id, goalId),
          eq(savingsGoals.userId, userId)
        )
      );

    return NextResponse.json({ ok: true, newAmount });
  } catch (error) {
    console.error("Savings PATCH error:", error);
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
    const goalId = searchParams.get("id");

    if (!goalId) {
      return NextResponse.json(
        { error: "ID target tidak valid" },
        { status: 400 }
      );
    }

    await db
      .delete(savingsGoals)
      .where(
        and(
          eq(savingsGoals.id, goalId),
          eq(savingsGoals.userId, userId)
        )
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Savings DELETE error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
