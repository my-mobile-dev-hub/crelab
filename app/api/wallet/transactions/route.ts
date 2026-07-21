import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { wallets, walletTransactions } from "@/drizzle/schema";
import { eq, desc, and, lt } from "drizzle-orm";
import type { IWalletTransaction, WalletTransactionType } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type");
    const direction = searchParams.get("direction");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);

    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, session.user.id));

    if (!wallet) {
      return NextResponse.json({ success: true, data: [], cursor: null, hasMore: false });
    }

    const conditions = [eq(walletTransactions.walletId, wallet.id)];

    if (type) {
      conditions.push(eq(walletTransactions.type, type as WalletTransactionType));
    }
    if (direction) {
      conditions.push(eq(walletTransactions.direction, direction as "CREDIT" | "DEBIT"));
    }
    if (cursor) {
      conditions.push(lt(walletTransactions.createdAt, new Date(cursor)));
    }

    const rows = await db
      .select()
      .from(walletTransactions)
      .where(and(...conditions))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = rows.slice(0, limit).map((row): IWalletTransaction => ({
      id: row.id,
      walletId: row.walletId,
      type: row.type as IWalletTransaction["type"],
      amountKobo: row.amountKobo,
      direction: row.direction as "CREDIT" | "DEBIT",
      balanceAfterKobo: row.balanceAfterKobo,
      reference: row.reference,
      relatedBookingId: row.relatedBookingId ?? undefined,
      relatedMilestoneId: row.relatedMilestoneId ?? undefined,
      paystackRef: row.paystackRef ?? undefined,
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.createdAt.toISOString(),
    }));

    const nextCursor = hasMore ? data[data.length - 1]?.createdAt : null;

    return NextResponse.json({
      success: true,
      data,
      cursor: nextCursor,
      hasMore,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
