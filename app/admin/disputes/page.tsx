"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClButton, ClTextarea } from "@/components/ui";
import { useToast } from "@/lib/toast";

interface DisputeItem {
  id: string;
  bookingId: string;
  raisedById: string;
  reason: string;
  outcome: string | null;
  adminNotes: string | null;
  resolvedById: string | null;
  createdAt: string;
  resolvedAt: string | null;
  booking?: {
    id: string;
    total: number;
    status: string;
    provider?: { displayName: string };
    client?: { name: string };
  };
}

export default function DisputesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [openForms, setOpenForms] = useState<Set<string>>(new Set());
  const [outcomes, setOutcomes] = useState<Record<string, "RELEASED" | "REFUNDED">>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: disputes = [], isLoading } = useQuery<DisputeItem[]>({
    queryKey: ["admin-disputes-open"],
    queryFn: async () => {
      const res = await fetch("/api/admin/disputes");
      const json = await res.json();
      if (json.success) return json.data ?? [];
      throw new Error(json.error ?? "Failed to load disputes");
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({
      disputeId,
      outcome,
      adminNotes,
    }: {
      disputeId: string;
      outcome: "RELEASED" | "REFUNDED";
      adminNotes: string;
    }) => {
      const res = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome, adminNotes }),
      });
      const json = await res.json();
      if (!json.success) {
        if (res.status === 409) throw new Error("Dispute already resolved");
        throw new Error(json.error ?? "Failed to resolve dispute");
      }
      return json;
    },
    onSuccess: () => {
      toast("Dispute resolved successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-disputes-open"] });
    },
    onError: (err: Error) => {
      toast(err.message, "error");
    },
  });

  const toggleForm = (id: string) => {
    setOpenForms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatAmount = (kobo: number) =>
    `₦${(kobo / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  if (isLoading) {
    return (
      <div className="text-[var(--color-text-secondary)] text-[14px]">
        Loading disputes...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-[family-name:var(--font-display)] font-bold text-[22px] tracking-[-0.01em]">
            Open Disputes ({disputes.length})
          </h2>
          <div className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
            Resolve payment disputes between clients and providers. Resolution is final.
          </div>
        </div>
      </div>

      {disputes.length === 0 && (
        <div className="text-[14px] text-[var(--color-text-tertiary)] text-center py-12">
          No open disputes.
        </div>
      )}

      {disputes.map((dispute) => (
        <div
          key={dispute.id}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5 mb-4"
        >
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-[family-name:var(--font-mono)] text-[var(--color-text-tertiary)]">
                {dispute.bookingId}
              </span>
              {dispute.booking?.provider && (
                <span className="text-[13px] text-[var(--color-text-primary)]">
                  <strong>Provider:</strong> {dispute.booking.provider.displayName}
                </span>
              )}
              {dispute.booking?.client && (
                <span className="text-[13px] text-[var(--color-text-primary)]">
                  <strong>Client:</strong> {dispute.booking.client.name}
                </span>
              )}
              <p className="text-[13px] text-[var(--color-text-primary)] leading-normal mt-1">
                {dispute.reason}
              </p>
              <span className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">
                Raised: {new Date(dispute.createdAt).toLocaleDateString("en-CA")}
              </span>
            </div>
            <div className="text-[18px] font-bold font-[family-name:var(--font-mono)] text-[var(--color-accent)]">
              {dispute.booking ? formatAmount(dispute.booking.total) : "—"}
            </div>
          </div>

          <div className="mt-3">
            <ClButton
              variant="primary"
              size="sm"
              onClick={() => toggleForm(dispute.id)}
            >
              Resolve
            </ClButton>
          </div>

          <div
            className={`mt-4 pt-4 border-t border-[var(--color-border)] flex-col gap-4 ${openForms.has(dispute.id) ? "flex" : "hidden"}`}
          >
            <div>
              <div className="text-[13px] font-semibold text-[var(--color-text-secondary)] mb-2">
                Outcome
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name={`outcome-${dispute.id}`}
                    value="RELEASED"
                    checked={(outcomes[dispute.id] ?? "RELEASED") === "RELEASED"}
                    onChange={() =>
                      setOutcomes((prev) => ({ ...prev, [dispute.id]: "RELEASED" }))
                    }
                    className="accent-[var(--color-accent)]"
                  />
                  <span className="text-[13px] text-[var(--color-text-primary)]">
                    Release to Provider
                  </span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name={`outcome-${dispute.id}`}
                    value="REFUNDED"
                    checked={outcomes[dispute.id] === "REFUNDED"}
                    onChange={() =>
                      setOutcomes((prev) => ({ ...prev, [dispute.id]: "REFUNDED" }))
                    }
                    className="accent-[var(--color-accent)]"
                  />
                  <span className="text-[13px] text-[var(--color-text-primary)]">
                    Refund to Client
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
                Admin Notes
              </label>
              <ClTextarea
                placeholder="Document the resolution decision and any notes..."
                value={notes[dispute.id] ?? ""}
                onChange={(e) =>
                  setNotes((prev) => ({ ...prev, [dispute.id]: e.target.value }))
                }
              />
            </div>

            <div>
              <ClButton
                variant="primary"
                size="sm"
                onClick={() =>
                  resolveMutation.mutate({
                    disputeId: dispute.id,
                    outcome: outcomes[dispute.id] ?? "RELEASED",
                    adminNotes: notes[dispute.id] ?? "",
                  })
                }
                loading={resolveMutation.isPending}
              >
                Confirm Resolution
              </ClButton>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
