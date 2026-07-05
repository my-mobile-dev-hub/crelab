import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { providers, portfolioItems } from "@/drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET() {
  try {
    await requireRole("ADMIN");

    const pendingProviders = await db
      .select({
        id: providers.id,
        displayName: providers.displayName,
        categorySlug: providers.categorySlug,
        createdAt: providers.createdAt,
        portfolioCount: sql<number>`(SELECT COUNT(*) FROM ${portfolioItems} WHERE ${portfolioItems.providerId} = ${providers.id})`,
      })
      .from(providers)
      .where(
        and(
          eq(providers.active, true),
          eq(providers.verified, false),
        ),
      )
      .orderBy(providers.createdAt);

    return NextResponse.json({
      success: true,
      data: pendingProviders.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    if (err instanceof Error && (err.message === "Forbidden" || err.message === "Unauthorized")) {
      const status = err.message === "Forbidden" ? 403 : 401;
      return NextResponse.json({ success: false, error: err.message }, { status });
    }
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
