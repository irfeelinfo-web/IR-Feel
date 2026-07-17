"use client"

import { useState, useEffect, useCallback } from "react"
import { Check, Loader2, Save, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/admin/toast-context"

export function SaveBar({
  onSave,
  isDirty = true,
}: {
  onSave: () => Promise<void>
  isDirty?: boolean
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const router = useRouter()
  const toast = useToast()

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!isDirty) return

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // Modern browsers show a generic message
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  const handle = useCallback(async () => {
    setStatus("saving")
    setErrorMsg("")
    try {
      await onSave()
      setStatus("saved")
      router.refresh()
      toast.success("সফলভাবে সংরক্ষিত হয়েছে!")
      setTimeout(() => setStatus("idle"), 2500)
    } catch (e) {
      const msg = (e as Error).message || "সংরক্ষণ ব্যর্থ হয়েছে"
      setErrorMsg(msg)
      setStatus("error")
      toast.error(msg)
      // Auto-reset error so user can retry
      setTimeout(() => setStatus("idle"), 5000)
    }
  }, [onSave, router, toast])

  // Don't show the bar if nothing has changed
  if (!isDirty && status === "idle") return null

  return (
    <div className="sticky bottom-4 z-20 mt-6">
      <div className="flex items-center justify-end gap-3 rounded-2xl border border-border bg-card/95 px-5 py-3 shadow-lg backdrop-blur-sm">
        {status === "saved" && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
            <Check className="h-4 w-4" /> সংরক্ষিত হয়েছে
          </span>
        )}
        {status === "error" && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-red-600">
            <AlertCircle className="h-4 w-4" />
            {errorMsg || "সংরক্ষণ ব্যর্থ হয়েছে"}
          </span>
        )}
        {isDirty && status === "idle" && (
          <span className="text-xs text-amber-600 font-medium">● অসংরক্ষিত পরিবর্তন আছে</span>
        )}
        <button
          type="button"
          onClick={handle}
          disabled={status === "saving"}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "saving" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          পরিবর্তন সংরক্ষণ করুন
        </button>
      </div>
    </div>
  )
}
