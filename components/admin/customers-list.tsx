"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Search,
  X,
  Trash2,
  Loader2,
  Download,
  Building2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
} from "lucide-react"
import { deleteCustomerAction } from "@/app/admin/actions"
import type { CustomerRow } from "@/lib/customers"
import { PageTitle } from "@/components/admin/ui"
import { useToast } from "@/components/admin/toast-context"
import { updateCustomerRewardsAction } from "@/app/admin/actions"

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

/** Generate a CSV string from customer data */
function generateCSV(customers: CustomerRow[]): string {
  // UTF-8 BOM for Excel compatibility with Bangla text
  const BOM = "\uFEFF"
  const headers = ["Name", "Phone", "Email", "Registration Date"]

  const escapeCSV = (val: string) => {
    if (!val) return ""
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`
    }
    return val
  }

  const rows = customers.map((c) => {
    const realPhone = c.phone.startsWith("google_") ? "" : c.phone
    return [c.name, realPhone, c.email, formatDate(c.created_at)]
      .map(escapeCSV)
      .join(",")
  })

  return BOM + [headers.join(","), ...rows].join("\n")
}

function downloadCSV(customers: CustomerRow[]) {
  const csv = generateCSV(customers)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `customers_${date}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function CustomersList({ customers: initialCustomers }: { customers: CustomerRow[] }) {
  const router = useRouter()
  const toast = useToast()
  const [customers, setCustomers] = useState(initialCustomers)

  useEffect(() => {
    setCustomers(initialCustomers)
  }, [initialCustomers])

  const [openId, setOpenId] = useState<number | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  
  // Reward Points state
  const [editingPointsId, setEditingPointsId] = useState<number | null>(null)
  const [pointsValue, setPointsValue] = useState("")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return customers.filter((c) => {
      if (q) {
        const haystack = `${c.name} ${c.phone} ${c.email}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [customers, search])

  const hasFilters = search.trim() !== ""

  async function remove(id: number) {
    setBusyId(id)
    const prev = customers
    setCustomers((arr) => arr.filter((c) => c.id !== id))

    try {
      const res = await deleteCustomerAction(id)
      if (res.ok) {
        toast.success("কাস্টমার সফলভাবে মুছে ফেলা হয়েছে!")
        router.refresh()
      } else {
        setCustomers(prev)
        toast.error(res.error || "কাস্টমার ডিলিট করা সম্ভব হয়নি।")
      }
    } catch (e) {
      console.error("[customers-list] delete failed:", (e as Error).message)
      setCustomers(prev)
      toast.error("কাস্টমার মুছতে ব্যর্থ হয়েছে।")
    } finally {
      setBusyId(null)
      setConfirmId(null)
    }
  }

  async function updatePoints(id: number) {
    if (!pointsValue || isNaN(Number(pointsValue))) return
    
    setBusyId(id)
    try {
      const res = await updateCustomerRewardsAction(id, Number(pointsValue))
      if (res.ok) {
        toast.success("পয়েন্ট আপডেট করা হয়েছে!")
        setCustomers((arr) => arr.map(c => c.id === id ? { ...c, reward_points: Number(pointsValue) } : c))
        setEditingPointsId(null)
      } else {
        toast.error(res.error || "পয়েন্ট আপডেট ব্যর্থ হয়েছে।")
      }
    } catch (e) {
      console.error("[customers-list] update points failed:", (e as Error).message)
      toast.error("পয়েন্ট আপডেট ব্যর্থ হয়েছে।")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle title="কাস্টমার" description="সাইটে রেজিস্টার করা সকল কাস্টমারের তালিকা।" />

        {/* Download button */}
        {customers.length > 0 && (
          <button
            type="button"
            onClick={() => downloadCSV(filtered)}
            className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-bold text-foreground transition-all hover:border-foreground hover:bg-muted sm:h-11 sm:px-5 sm:text-sm"
          >
            <Download className="h-4 w-4" />
            এক্সেল ডাউনলোড ({filtered.length})
          </button>
        )}
      </div>

      {/* Stats bar */}
      {customers.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">মোট কাস্টমার</p>
            <p className="mt-1 font-display text-xl font-bold text-foreground">{customers.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">ইমেইল আছে</p>
            <p className="mt-1 font-display text-xl font-bold text-foreground">
              {customers.filter((c) => c.email).length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">নতুন</p>
            <p className="mt-1 font-display text-xl font-bold text-foreground">
              {customers.filter((c) => {
                const d = new Date(c.created_at)
                const today = new Date()
                return d.toDateString() === today.toDateString()
              }).length}
            </p>
          </div>
        </div>
      )}

      {customers.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..."
              className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none focus:border-foreground"
            />
          </div>

          {/* Filter status */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              {filtered.length} / {customers.length} জন কাস্টমার পাওয়া গেছে
            </span>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                }}
                className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 font-semibold text-foreground hover:bg-muted"
              >
                <X className="h-3 w-3" /> ফিল্টার মুছুন
              </button>
            )}
          </div>
        </div>
      )}

      {/* List */}
      {customers.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground" strokeWidth={1.4} />
          <p className="text-sm text-muted-foreground">এখনো কোনো কাস্টমার রেজিস্টার করেনি।</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Search className="h-10 w-10 text-muted-foreground" strokeWidth={1.4} />
          <p className="text-sm text-muted-foreground">সার্চ ফিল্টারে কোনো কাস্টমার মিলছে না।</p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {filtered.map((c) => {
            const open = openId === c.id
            const cleanPhone = (c.phone || "").replace(/[^0-9]/g, "")
            return (
              <div
                key={c.id}
                className="overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-sm"
              >
                {/* Header toggle */}
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : c.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left focus:outline-none"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {open ? (
                      <ChevronUp className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
                    )}
                    {/* Avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-foreground/10 to-foreground/5 text-xs font-bold uppercase text-foreground">
                      {c.name
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground">{c.name}</span>
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" /> {c.phone.startsWith("google_") ? "যুক্ত করা হয়নি" : c.phone}
                        {c.email && (
                          <>
                            <span className="mx-1">·</span>
                            <Mail className="h-3 w-3" /> {c.email}
                          </>
                        )}
                        <span className="mx-1">·</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-500">{c.reward_points} Points</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {formatDate(c.created_at)}
                  </p>
                </button>

                {/* Detail view */}
                {open && (
                  <div className="border-t border-border bg-muted/20 p-5">
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
                      {/* Customer info */}
                      <div className="flex flex-col gap-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          কাস্টমার ডিটেইলস
                        </span>
                        <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-background p-4 text-sm">
                          <p className="flex items-center gap-2 font-medium text-foreground">
                            <span className="font-bold text-muted-foreground">নাম:</span> {c.name}
                          </p>
                          <p className="flex items-center gap-2 font-medium text-foreground">
                            <span className="font-bold text-muted-foreground">মোবাইল:</span> {c.phone.startsWith("google_") ? <span className="text-muted-foreground/50 italic">যুক্ত করা হয়নি</span> : c.phone}
                          </p>
                          {c.email && (
                            <p className="flex items-center gap-2 font-medium text-foreground">
                              <span className="font-bold text-muted-foreground">ইমেইল:</span> {c.email}
                            </p>
                          )}
                          <p className="flex items-center gap-2 font-medium text-foreground">
                            <span className="font-bold text-muted-foreground">রেজিস্ট্রেশন:</span>{" "}
                            {formatDate(c.created_at)}
                          </p>
                          <div className="flex items-center justify-between border-t border-border/50 pt-2.5 mt-1">
                            <p className="flex items-center gap-2 font-medium text-foreground">
                              <span className="font-bold text-muted-foreground">রিওয়ার্ড পয়েন্ট:</span> 
                              <span className="rounded-md bg-amber-100 px-2 py-0.5 font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{c.reward_points}</span>
                            </p>
                            {editingPointsId === c.id ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number"
                                  value={pointsValue}
                                  onChange={(e) => setPointsValue(e.target.value)}
                                  className="h-8 w-20 rounded-md border border-border bg-background px-2 text-sm outline-none"
                                />
                                <button
                                  type="button"
                                  disabled={busyId === c.id}
                                  onClick={() => updatePoints(c.id)}
                                  className="rounded-md bg-foreground px-3 py-1 text-xs font-bold text-background hover:bg-foreground/90 disabled:opacity-50"
                                >
                                  সেভ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPointsId(null)}
                                  className="rounded-md border border-border bg-muted px-3 py-1 text-xs font-bold hover:bg-border disabled:opacity-50"
                                >
                                  বাতিল
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPointsId(c.id)
                                  setPointsValue(c.reward_points.toString())
                                }}
                                className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                              >
                                এডিট পয়েন্ট
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick actions */}
                      <div className="flex flex-col gap-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          দ্রুত অ্যাকশন
                        </span>
                        <div className="flex flex-col gap-2">
                          <a
                            href={`tel:${c.phone}`}
                            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background text-xs font-bold text-foreground transition-all hover:bg-muted"
                          >
                            <Phone className="h-3.5 w-3.5" /> কল করুন
                          </a>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-xs font-bold text-white transition-all hover:bg-[#20ba5a]"
                            >
                              <MessageSquare className="h-3.5 w-3.5" /> হোয়াটসঅ্যাপ চ্যাট
                            </a>
                          )}
                          {c.email && (
                            <a
                              href={`mailto:${c.email}`}
                              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background text-xs font-bold text-foreground transition-all hover:bg-muted"
                            >
                              <Send className="h-3.5 w-3.5" /> ইমেইল পাঠান
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom toolbar */}
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                      <div className="text-xs text-muted-foreground">কাস্টমার আইডি: #{c.id}</div>

                      <div>
                        {confirmId === c.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => remove(c.id)}
                              disabled={busyId === c.id}
                              className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                              {busyId === c.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                "হ্যাঁ, মুছুন"
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmId(null)}
                              className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                            >
                              বাতিল
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmId(c.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> কাস্টমার মুছুন
                          </button>
                        )}
                      </div>
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
