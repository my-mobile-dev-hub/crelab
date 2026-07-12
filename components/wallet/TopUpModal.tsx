"use client";

import { useState, useCallback } from "react";
import { ClSheet, ClButton, ClTabs, ClTabsList, ClTabsTrigger, ClTabsContent } from "@/components/ui";
import { Copy, Check, ExternalLink } from "lucide-react";

interface TopUpModalProps {
  open: boolean;
  onClose: () => void;
}

export function TopUpModal({ open, onClose }: TopUpModalProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dvaInfo, setDvaInfo] = useState<{ accountNumber: string; bankName: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCardTopUp = useCallback(async () => {
    const amountKobo = parseInt(amount, 10) * 100;
    if (!amountKobo || amountKobo <= 0) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/wallet/topup/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountKobo }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      const { authorizationUrl } = json.data;
      window.location.href = authorizationUrl;
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [amount]);

  const handleGetDVA = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/wallet/topup/bank", {
        method: "POST",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setDvaInfo(json.data);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    if (dvaInfo) {
      await navigator.clipboard.writeText(dvaInfo.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [dvaInfo]);

  return (
    <ClSheet open={open} onClose={onClose} side="right" className="max-w-[480px]">
      <div className="p-6">
        <h2 className="font-[family-name:var(--font-display)] font-bold text-[18px] text-[var(--color-text-primary)] mb-6">
          Top Up Wallet
        </h2>

        <ClTabs defaultValue="card">
          <ClTabsList className="mb-6">
            <ClTabsTrigger value="card">Card</ClTabsTrigger>
            <ClTabsTrigger value="bank">Bank Transfer</ClTabsTrigger>
          </ClTabsList>

          <ClTabsContent value="card">
            <label className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5 block">
              Amount (₦)
            </label>
            <input
              type="number"
              min="10"
              step="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-[8px] bg-[var(--color-surface-raised)] p-3 border border-[var(--color-border)] text-[14px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] mb-4"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            />
            <ClButton
              variant="primary"
              fullWidth
              disabled={!amount || parseInt(amount) <= 0}
              loading={isLoading}
              onClick={handleCardTopUp}
            >
              Proceed to Paystack
            </ClButton>
          </ClTabsContent>

          <ClTabsContent value="bank">
            {!dvaInfo ? (
              <div className="text-center py-6">
                <p className="text-[13px] text-[var(--color-text-secondary)] mb-4">
                  Get your dedicated bank account to transfer funds instantly.
                </p>
                <ClButton
                  variant="primary"
                  fullWidth
                  loading={isLoading}
                  onClick={handleGetDVA}
                >
                  Generate Account Details
                </ClButton>
              </div>
            ) : (
              <div>
                <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 mb-4">
                  <p className="text-[12px] text-[var(--color-text-tertiary)] mb-1">
                    Bank
                  </p>
                  <p className="text-[14px] font-medium text-[var(--color-text-primary)]">
                    {dvaInfo.bankName}
                  </p>
                </div>

                <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 mb-4">
                  <p className="text-[12px] text-[var(--color-text-tertiary)] mb-1">
                    Account Number
                  </p>
                  <div className="flex items-center justify-between">
                    <p
                      className="text-[20px] font-bold text-[var(--color-text-primary)]"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {dvaInfo.accountNumber}
                    </p>
                    <button
                      onClick={handleCopy}
                      className="w-8 h-8 rounded-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] cursor-pointer"
                    >
                      {copied ? (
                        <Check size={14} strokeWidth={2} color="var(--color-success)" />
                      ) : (
                        <Copy size={14} strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-[12px] text-[var(--color-text-tertiary)]">
                  Transfer the desired amount to the account above. Funds will be
                  credited to your wallet automatically once the transfer is confirmed.
                </p>

                <ClButton
                  variant="outlined"
                  fullWidth
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  <ExternalLink size={14} strokeWidth={2} />
                  Refresh Balance
                </ClButton>
              </div>
            )}
          </ClTabsContent>
        </ClTabs>
      </div>
    </ClSheet>
  );
}
