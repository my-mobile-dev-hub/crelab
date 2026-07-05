"use client";

interface WorkHistoryItem {
  id: string;
  title: string;
  clientName: string;
  completedAt: string;
  description: string;
}

interface WorkHistoryProps {
  items: WorkHistoryItem[];
}

export function WorkHistory({ items }: WorkHistoryProps) {
  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="font-[family-name:var(--font-display)] font-bold text-[18px] text-[var(--color-text-primary)] mb-4">
        Work History
      </h2>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[14px] text-[var(--color-text-primary)]">
                  {item.title}
                </h3>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
                  {item.clientName}
                </p>
              </div>
              <span className="text-[12px] text-[var(--color-text-tertiary)] shrink-0">
                {new Date(item.completedAt).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "short",
                })}
              </span>
            </div>
            {item.description && (
              <p className="text-[13px] text-[var(--color-text-tertiary)] mt-2">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
