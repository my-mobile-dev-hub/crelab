"use client";

import { useState } from "react";
import { ClButton } from "@/components/ui";
import type { IServicePackage } from "@/types";

interface BookingSidebarProps {
  packages: IServicePackage[];
  providerName: string;
}

const tierLabels: Record<string, string> = {
  BASIC: "Basic",
  STANDARD: "Standard",
  PREMIUM: "Premium",
};

export function BookingSidebar({ packages, providerName }: BookingSidebarProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    packages.find((p) => p.tier === "STANDARD")?.id ?? packages[0]?.id ?? null,
  );

  const selected = packages.find((p) => p.id === selectedId);

  if (packages.length === 0) return null;

  return (
    <div className="sticky top-6 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h3 className="font-[family-name:var(--font-display)] font-bold text-[16px] text-[var(--color-text-primary)]">
        Book {providerName}
      </h3>

      <p className="text-[12px] text-[var(--color-text-secondary)] mt-1">
        Select a package to get started
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {packages.map((pkg) => (
          <label
            key={pkg.id}
            className={`flex items-center gap-3 p-3 rounded-[10px] border cursor-pointer transition-colors ${
              selectedId === pkg.id
                ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                : "border-[var(--color-border)] bg-[var(--color-surface-raised)] hover:border-[var(--color-border-mid)]"
            }`}
          >
            <input
              type="radio"
              name="package"
              checked={selectedId === pkg.id}
              onChange={() => setSelectedId(pkg.id)}
              className="hidden"
            />
            <span
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                selectedId === pkg.id
                  ? "border-[var(--color-accent)]"
                  : "border-[var(--color-border-mid)]"
              }`}
            >
              {selectedId === pkg.id && (
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
              )}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
                {tierLabels[pkg.tier] ?? pkg.tier}
              </span>
              <span className="text-[12px] text-[var(--color-text-secondary)] ml-2">
                {pkg.label}
              </span>
            </div>
            <span className="font-semibold text-[14px] text-[var(--color-text-primary)]">
              ₦{(pkg.price / 100).toLocaleString()}
            </span>
          </label>
        ))}
      </div>

      {selected && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-[var(--color-text-secondary)]">
              {selected.label}
            </span>
            <span className="font-semibold text-[14px] text-[var(--color-text-primary)]">
              ₦{(selected.price / 100).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] text-[var(--color-text-secondary)]">
              Delivery
            </span>
            <span className="text-[13px] text-[var(--color-text-primary)]">
              {selected.turnaroundDays} days
            </span>
          </div>

          <ClButton variant="primary" fullWidth>
            Continue to Booking
          </ClButton>
        </div>
      )}
    </div>
  );
}
