import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { disputes, bookings, providers, user } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET() {
  try {
    await requireRole("ADMIN");

    const openDisputes = await db
      .select({
        id: disputes.id,
        bookingId: disputes.bookingId,
        raisedById: disputes.raisedById,
        reason: disputes.reason,
        outcome: disputes.outcome,
        adminNotes: disputes.adminNotes,
        resolvedById: disputes.resolvedById,
        createdAt: disputes.createdAt,
        resolvedAt: disputes.resolvedAt,
      })
      .from(disputes)
      .where(and(isNull(disputes.outcome), isNull(disputes.resolvedAt)))
      .orderBy(disputes.createdAt);

    const enriched = await Promise.all(
      openDisputes.map(async (d) => {
        const bookingRows = await db
          .select({
            id: bookings.id,
            total: bookings.total,
            status: bookings.status,
          })
          .from(bookings)
          .where(eq(bookings.id, d.bookingId))
          .limit(1);

        const booking = bookingRows[0] ?? null;
        let providerData = null;
        let clientData = null;

        if (booking) {
          const bookingFull = await db
            .select({
              providerId: bookings.providerId,
              clientId: bookings.clientId,
            })
            .from(bookings)
            .where(eq(bookings.id, d.bookingId))
            .limit(1);

          if (bookingFull.length > 0) {
            const pRows = await db
              .select({ displayName: providers.displayName })
              .from(providers)
              .where(eq(providers.id, bookingFull[0].providerId))
              .limit(1);
            providerData = pRows[0] ?? null;

            const cRows = await db
              .select({ name: user.name })
              .from(user)
              .where(eq(user.id, bookingFull[0].clientId))
              .limit(1);
            clientData = cRows[0] ?? null;
          }
        }

        return {
          id: d.id,
          bookingId: d.bookingId,
          raisedById: d.raisedById,
          reason: d.reason,
          outcome: d.outcome,
          adminNotes: d.adminNotes,
          resolvedById: d.resolvedById,
          createdAt: d.createdAt.toISOString(),
          resolvedAt: d.resolvedAt?.toISOString() ?? null,
          booking: booking
            ? {
                id: booking.id,
                total: booking.total,
                status: booking.status,
                provider: providerData,
                client: clientData,
              }
            : null,
        };
      }),
    );

    return NextResponse.json({ success: true, data: enriched });
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
