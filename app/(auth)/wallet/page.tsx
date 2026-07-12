import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { wallets } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { WalletClient } from "./WalletClient";

export const dynamic = "force-dynamic";

async function getWalletData(userId: string) {
  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId));

  return wallet
    ? {
        balanceKobo: wallet.balanceKobo,
        escrowKobo: wallet.escrowKobo,
        totalEarnedKobo: wallet.totalEarnedKobo,
      }
    : {
        balanceKobo: 0,
        escrowKobo: 0,
        totalEarnedKobo: 0,
      };
}

export default async function WalletPage() {
  const session = await requireAuth();
  const userId = session.user.id;
  const userRole = session.user.role as string;

  const isProvider = userRole === "PROVIDER";
  const walletData = await getWalletData(userId);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="font-[family-name:var(--font-display)] font-bold text-[24px] text-[var(--color-text-primary)] mb-6">
        Wallet
      </h1>
      <WalletClient
        {...walletData}
        isProvider={isProvider}
      />
    </div>
  );
}
