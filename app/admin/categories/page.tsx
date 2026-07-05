"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClButton } from "@/components/ui";
import { CategoryModal } from "@/components/admin/CategoryModal";
import { useToast } from "@/lib/toast";
import type { ICategoryConfig } from "@/types";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategoryConfig | null>(null);

  const { data: categories = [], isLoading } = useQuery<ICategoryConfig[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success) return json.data ?? [];
      throw new Error(json.error ?? "Failed to load categories");
    },
  });

  const disableMutation = useMutation({
    mutationFn: async (slug: string) => {
      const res = await fetch(`/api/admin/categories/${slug}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to disable category");
    },
    onSuccess: () => {
      toast("Category disabled", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (err: Error) => {
      toast(err.message, "error");
    },
  });

  const handleAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (cat: ICategoryConfig) => {
    setEditingCategory(cat);
    setModalOpen(true);
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
  };

  if (isLoading) {
    return (
      <div className="text-[var(--color-text-secondary)] text-[14px]">
        Loading categories...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-[family-name:var(--font-display)] font-bold text-[22px] tracking-[-0.01em]">
            Categories
          </h2>
          <div className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
            Manage service categories. Each category has a slug, label, and custom field schema.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ClButton variant="accent-outlined" size="default" onClick={handleAdd}>
            + Add Category
          </ClButton>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] rounded-[12px] overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--color-surface-raised)]">
              <th className="px-[14px] py-[10px] text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                Slug
              </th>
              <th className="px-[14px] py-[10px] text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                Label
              </th>
              <th className="px-[14px] py-[10px] text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                Field Count
              </th>
              <th className="px-[14px] py-[10px] text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                Active
              </th>
              <th className="px-[14px] py-[10px] text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-[14px] py-[10px] text-[12px] text-[var(--color-text-tertiary)] text-center">
                  No categories found.
                </td>
              </tr>
            )}
            {categories.map((cat) => (
              <tr
                key={cat.slug}
                className="border-b border-[var(--color-border)] last:border-b-0 even:bg-[var(--color-surface-raised)]"
              >
                <td className="px-[14px] py-[10px] text-[12px] font-[family-name:var(--font-mono)]">
                  {cat.slug}
                </td>
                <td className="px-[14px] py-[10px] text-[12px]">{cat.label}</td>
                <td className="px-[14px] py-[10px] text-[12px]">
                  {cat.fieldSchema.length}
                </td>
                <td className="px-[14px] py-[10px]">
                  <span className={`inline-flex items-center w-9 h-5 rounded-[9999px] relative transition-colors ${cat.active ? "bg-[var(--color-accent)]" : "bg-[var(--color-border-mid)]"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${cat.active ? "translate-x-4" : ""}`} />
                  </span>
                </td>
                <td className="px-[14px] py-[10px]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="text-[12px] text-[var(--color-accent)] cursor-pointer bg-transparent border-none p-0"
                    >
                      Edit
                    </button>
                    {cat.active && (
                      <button
                        onClick={() => disableMutation.mutate(cat.slug)}
                        className="text-[12px] text-[var(--color-error)] cursor-pointer bg-transparent border-none p-0"
                      >
                        Disable
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        category={editingCategory}
      />
    </div>
  );
}
