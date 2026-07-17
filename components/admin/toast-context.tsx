"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { CheckCircle2, XCircle, Info, X } from "lucide-react"

/* ── Types ── */
type ToastType = "success" | "error" | "info"

type Toast = {
  id: number
  message: string
  type: ToastType
  leaving?: boolean
}

type ToastContextValue = {
  toast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

/* ── Context ── */
const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 0

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be inside <ToastProvider>")
  return ctx
}

/* ── Provider + Renderer ── */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    // start leave animation
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    // remove after animation
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300)
  }, [])

  const push = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = ++nextId
      setToasts((prev) => [...prev, { id, message, type }])
      // auto-dismiss after 4s
      setTimeout(() => dismiss(id), 4000)
    },
    [dismiss],
  )

  const ctx: ToastContextValue = {
    toast: push,
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error"),
    info: (m) => push(m, "info"),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col-reverse gap-2.5 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-300 ${
              t.leaving
                ? "translate-x-[120%] opacity-0"
                : "translate-x-0 opacity-100 animate-[slideInRight_0.3s_ease-out]"
            } ${
              t.type === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-200"
                : t.type === "error"
                  ? "border-red-200 bg-red-50/95 text-red-800 dark:border-red-800 dark:bg-red-950/90 dark:text-red-200"
                  : "border-blue-200 bg-blue-50/95 text-blue-800 dark:border-blue-800 dark:bg-blue-950/90 dark:text-blue-200"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            ) : t.type === "error" ? (
              <XCircle className="h-4.5 w-4.5 shrink-0" />
            ) : (
              <Info className="h-4.5 w-4.5 shrink-0" />
            )}
            <span className="text-sm font-medium leading-snug">{t.message}</span>
            <button
              type="button"
              aria-label="বন্ধ করুন"
              onClick={() => dismiss(t.id)}
              className="ml-1 shrink-0 rounded-md p-0.5 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
