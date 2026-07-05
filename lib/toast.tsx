"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[2000] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              px-4 py-3 rounded-[8px] text-[13px] font-medium shadow-lg
              animate-[slideUp_0.2s_ease-out]
              ${t.type === "success" ? "bg-[var(--color-success)] text-[var(--color-text-inverse)]" : ""}
              ${t.type === "error" ? "bg-[var(--color-error)] text-white" : ""}
              ${t.type === "info" ? "bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] border border-[var(--color-border)]" : ""}
            `.trim()}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
