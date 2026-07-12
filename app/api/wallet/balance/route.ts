import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { WalletService } from "@/services/WalletService";

export async function GET(_req: NextRequest) {
  try {
    const session = await requireAuth();
    const walletService = new WalletService();
    const balance = await walletService.getBalance(session.user.id);

    return NextResponse.json({ success: true, data: balance });
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
