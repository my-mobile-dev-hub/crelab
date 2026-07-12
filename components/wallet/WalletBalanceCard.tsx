"use client";

import { ClButton } from "@/components/ui";

interface WalletBalanceCardProps {
  balanceKobo: number;
  escrowKobo: number;
  totalEarnedKobo?: number;
  isProvider?: boolean;
  onTopUp: () => void;
  onWithdraw?: () => void;
}

export function WalletBalanceCard({
  balanceKobo,
  escrowKobo,
  totalEarnedKobo,
  isProvider = false,
  onTopUp,
  onWithdraw,
}: WalletBalanceCardProps) {
  return (
    <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6">
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-1">
        Available Balance
      </p>
      <p
        className="font-[family-name:var(--font-display)] font-extrabold text-[32px] leading-tight text-[var(--color-accent)]"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        ₦{(balanceKobo / 100).toLocaleString()}
      </p>

      <div className="flex gap-4 mt-4">
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          In escrow:{" "}
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            ₦{(escrowKobo / 100).toLocaleString()}
          </span>
        </p>
        {isProvider && totalEarnedKobo !== undefined && (
          <p className="text-[12px] text-[var(--color-text-secondary)]">
            Total earned:{" "}
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              ₦{(totalEarnedKobo / 100).toLocaleString()}
            </span>
          </p>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <ClButton variant="primary" onClick={onTopUp}>
          Top Up
        </ClButton>
        {isProvider && onWithdraw && (
          <ClButton variant="outlined" onClick={onWithdraw}>
            Withdraw
          </ClButton>
        )}
      </div>
    </div>
  );
}
