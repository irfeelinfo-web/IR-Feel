"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Phone,
  Mail,
  Check,
  X,
  Clock,
  AlertCircle,
  Loader2,
  ArrowRight,
  Filter,
  RefreshCw,
} from "lucide-react"
import {
  approveChangeRequestAction,
  rejectChangeRequestAction,
} from "@/app/admin/actions"
import type { ChangeRequestWithCustomer } from "@/lib/change-requests"

export function ChangeRequestsList({
  requests,
}: {
  requests: ChangeRequestWithCustomer[]
}) {
  const router = useRouter()
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")
  const [busyId, setBusyId] = useState<number | null>(null)
  const [rejectNoteId, setRejectNoteId] = useState<number | null>(null)
  const [rejectNote, setRejectNote] = useState("")

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter)

  async function handleApprove(id: number) {
    if (!confirm("এই রিকোয়েস্ট অনুমোদন করতে চান?")) return
    setBusyId(id)
    try {
      const res = await approveChangeRequestAction(id)
      if (!res.ok) alert(res.error)
      router.refresh()
    } catch {
      alert("সার্ভারে সমস্যা হয়েছে।")
    } finally {
      setBusyId(null)
    }
  }

  async function handleReject(id: number) {
    setBusyId(id)
    try {
      const res = await rejectChangeRequestAction(id, rejectNote)
      if (!res.ok) alert(res.error)
      setRejectNoteId(null)
      setRejectNote("")
      router.refresh()
    } catch {
      alert("সার্ভারে সমস্যা হয়েছে।")
    } finally {
      setBusyId(null)
    }
  }

  const statusConfig = {
    pending: { label: "অপেক্ষমাণ", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
    approved: { label: "অনুমোদিত", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", icon: Check },
    rejected: { label: "প্রত্যাখ্যাত", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: X },
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">পরিবর্তন রিকোয়েস্ট</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            কাস্টমারদের মোবাইল/ইমেইল পরিবর্তনের অনুরোধ
          </p>
        </div>
        <button
          onClick={() => router.refresh()}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" />
          রিফ্রেশ
        </button>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {(["pending", "all", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold tracking-wide transition-all ${
              filter === f
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "সব" : f === "pending" ? "অপেক্ষমাণ" : f === "approved" ? "অনুমোদিত" : "প্রত্যাখ্যাত"}
            <span className="ml-1.5 text-[10px] opacity-60">
              ({f === "all" ? requests.length : requests.filter((r) => r.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
          <Filter className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">কোনো রিকোয়েস্ট নেই</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const st = statusConfig[req.status]
            const StIcon = st.icon
            const isBusy = busyId === req.id
            const isRejectMode = rejectNoteId === req.id

            return (
              <div
                key={req.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
                  {/* Icon */}
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    req.field_type === "phone"
                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                      : "bg-purple-100 dark:bg-purple-900/30"
                  }`}>
                    {req.field_type === "phone" ? (
                      <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-foreground">{req.customer_name}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${st.color}`}>
                        <StIcon className="h-3 w-3" />
                        {st.label}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                      {req.field_type === "phone" ? "মোবাইল পরিবর্তন" : "ইমেইল পরিবর্তন"}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="rounded-lg bg-red-50 px-2.5 py-1 font-mono text-xs font-medium text-red-700 line-through dark:bg-red-950/30 dark:text-red-400">
                        {req.current_value}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="rounded-lg bg-emerald-50 px-2.5 py-1 font-mono text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                        {req.new_value}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {new Date(req.created_at).toLocaleDateString("bn-BD", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {req.admin_note && (
                      <p className="mt-1.5 text-xs text-muted-foreground italic border-l-2 border-red-300 pl-2">
                        নোট: {req.admin_note}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {req.status === "pending" && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={isBusy}
                        className="flex h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
                      >
                        {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        অনুমোদন
                      </button>
                      <button
                        onClick={() => {
                          if (isRejectMode) {
                            setRejectNoteId(null)
                            setRejectNote("")
                          } else {
                            setRejectNoteId(req.id)
                          }
                        }}
                        disabled={isBusy}
                        className="flex h-10 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-bold text-red-600 shadow-sm transition-all hover:bg-red-100 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
                      >
                        <X className="h-3.5 w-3.5" />
                        প্রত্যাখ্যান
                      </button>
                    </div>
                  )}
                </div>

                {/* Reject note form */}
                {isRejectMode && (
                  <div className="border-t border-border bg-red-50/30 p-4 dark:bg-red-950/10">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        placeholder="প্রত্যাখ্যানের কারণ (ঐচ্ছিক)"
                        className="h-10 flex-1 rounded-xl border border-border bg-background px-4 text-sm font-medium outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      />
                      <button
                        onClick={() => handleReject(req.id)}
                        disabled={isBusy}
                        className="flex h-10 items-center gap-1.5 rounded-xl bg-red-600 px-5 text-xs font-bold text-white shadow-sm transition-all hover:bg-red-700 disabled:opacity-60"
                      >
                        {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "নিশ্চিত করুন"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
