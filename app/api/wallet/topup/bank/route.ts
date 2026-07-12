import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createDedicatedVirtualAccount } from "@/lib/paystack";
import { WalletService } from "@/services/WalletService";
import { db } from "@/lib/db";
import { wallets } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(_req: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const email = session.user.email;
    const name = session.user.name;

    const walletService = new WalletService();
    const wallet = await walletService.getOrCreate(userId);

    if (wallet.dvaAccountNumber && wallet.dvaBankName) {
      return NextResponse.json({
        success: true,
        data: {
          accountNumber: wallet.dvaAccountNumber,
          bankName: wallet.dvaBankName,
        },
      });
    }

    const dva = await createDedicatedVirtualAccount(email, name);

    await db
      .update(wallets)
      .set({
        dvaAccountNumber: dva.accountNumber,
        dvaBankName: dva.bankName,
        updatedAt: new Date(),
      })
      .where(eq(wallets.userId, userId));

    return NextResponse.json({
      success: true,
      data: {
        accountNumber: dva.accountNumber,
        bankName: dva.bankName,
      },
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
