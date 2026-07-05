import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { providers, auditLog } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;
    const body = await req.json();
    const { verified, active, adminNotes } = body;

    const existing = await db
      .select()
      .from(providers)
      .where(eq(providers.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Provider not found" },
        { status: 404 },
      );
    }

    const updateData: Record<string, unknown> = {};
    if (verified !== undefined) updateData.verified = verified;
    if (active !== undefined) updateData.active = active;
    updateData.updatedAt = new Date();

    await db
      .update(providers)
      .set(updateData)
      .where(eq(providers.id, id));

    await db.insert(auditLog).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      action: "provider.update",
      entity: "providers",
      entityId: id,
      oldValue: {
        verified: existing[0].verified,
        active: existing[0].active,
      },
      newValue: { verified, active, adminNotes },
    });

    return NextResponse.json({ success: true });
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
