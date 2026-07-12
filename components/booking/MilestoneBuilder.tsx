"use client";

import { useState, useCallback } from "react";
import { ClButton } from "@/components/ui";
import { Plus, Trash2 } from "lucide-react";

interface MilestoneInput {
  title: string;
  description: string;
  amountKobo: number;
}

interface MilestoneBuilderProps {
  totalPriceKobo: number;
  onSubmit: (milestones: Array<{ title: string; description?: string; amountKobo: number }>) => Promise<void>;
  isSubmitting?: boolean;
}

export function MilestoneBuilder({ totalPriceKobo, onSubmit, isSubmitting = false }: MilestoneBuilderProps) {
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { title: "", description: "", amountKobo: 0 },
    { title: "", description: "", amountKobo: 0 },
  ]);

  const totalAllocated = milestones.reduce((sum, m) => sum + m.amountKobo, 0);

  const addMilestone = useCallback(() => {
    if (milestones.length >= 5) return;
    setMilestones([...milestones, { title: "", description: "", amountKobo: 0 }]);
  }, [milestones]);

  const removeMilestone = useCallback((index: number) => {
    if (milestones.length <= 2) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  }, [milestones]);

  const updateMilestone = useCallback(
    (index: number, field: keyof MilestoneInput, value: string | number) => {
      setMilestones((prev) => {
        const updated = [...prev];
        if (field === "amountKobo") {
          (updated[index] as MilestoneInput).amountKobo = value as number;
        } else {
          (updated[index] as MilestoneInput)[field] = value as string;
        }
        return updated;
      });
    },
    [],
  );

  const isComplete = milestones.every((m) => m.title && m.amountKobo > 0);
  const isMatchingTotal = totalAllocated === totalPriceKobo;
  const remainingKobo = totalPriceKobo - totalAllocated;

  const handleSubmit = useCallback(async () => {
    if (!isComplete || !isMatchingTotal) return;
    await onSubmit(
      milestones.map((m) => ({
        title: m.title,
        description: m.description || undefined,
        amountKobo: m.amountKobo,
      })),
    );
  }, [milestones, isComplete, isMatchingTotal, onSubmit]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-[family-name:var(--font-display)] font-bold text-[16px] text-[var(--color-text-primary)]">
          Define Milestones
        </h3>
        <span className="text-[12px] text-[var(--color-text-secondary)]">
          {milestones.length}/5 milestones
        </span>
      </div>

      <div className="flex flex-col gap-4 mb-4">
        {milestones.map((milestone, index) => (
          <div
            key={index}
            className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
                Milestone {index + 1}
              </span>
              {milestones.length > 2 && (
                <button
                  onClick={() => removeMilestone(index)}
                  className="text-[var(--color-text-tertiary)] hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              )}
            </div>

            <input
              type="text"
              value={milestone.title}
              onChange={(e) => updateMilestone(index, "title", e.target.value)}
              placeholder="Milestone title"
              className="w-full rounded-[8px] bg-[var(--color-surface)] p-2.5 border border-[var(--color-border)] text-[14px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] mb-2"
            />

            <input
              type="text"
              value={milestone.description}
              onChange={(e) => updateMilestone(index, "description", e.target.value)}
              placeholder="Description (optional)"
              className="w-full rounded-[8px] bg-[var(--color-surface)] p-2.5 border border-[var(--color-border)] text-[14px] text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)] mb-2"
            />

            <input
              type="number"
              min="0"
              step="100"
              value={milestone.amountKobo / 100 || ""}
              onChange={(e) => updateMilestone(index, "amountKobo", parseInt(e.target.value, 10) * 100 || 0)}
              placeholder="Amount (₦)"
              className="w-full rounded-[8px] bg-[var(--color-surface)] p-2.5 border border-[var(--color-border)] text-[14px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>
        ))}
      </div>

      {milestones.length < 5 && (
        <ClButton variant="ghost" fullWidth onClick={addMilestone} className="mb-4">
          <Plus size={14} strokeWidth={2} />
          Add Milestone
        </ClButton>
      )}

      <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] text-[var(--color-text-secondary)]">
            Allocated
          </span>
          <span
            className="text-[13px] text-[var(--color-text-primary)]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            ₦{(totalAllocated / 100).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[var(--color-text-secondary)]">
            Booking Total
          </span>
          <span
            className="text-[13px] font-semibold text-[var(--color-text-primary)]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            ₦{(totalPriceKobo / 100).toLocaleString()}
          </span>
        </div>
        {!isMatchingTotal && (
          <p className="text-[12px] text-red-500 mt-2">
            {remainingKobo > 0
              ? `₦${(remainingKobo / 100).toLocaleString()} remaining to allocate`
              : `₦${(Math.abs(remainingKobo) / 100).toLocaleString()} over the booking total`}
          </p>
        )}
      </div>

      <ClButton
        variant="primary"
        fullWidth
        disabled={!isComplete || !isMatchingTotal}
        loading={isSubmitting}
        onClick={handleSubmit}
      >
        Confirm & Fund Milestone 1
      </ClButton>
    </div>
  );
}
