"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, Phone, MapPin, ChevronDown, ChevronUp, Trash2, Loader2, Search, X } from "lucide-react"
import { updateOrderStatusAction, deleteOrderAction } from "@/app/admin/actions"
import { bdt } from "@/lib/products"
import {
  type OrderRow,
  type OrderStatus,
  orderStatuses,
  statusLabels,
  paymentLabels,
} from "@/lib/order-types"
import { PageTitle } from "@/components/admin/ui"
import { useToast } from "@/components/admin/toast-context"

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-700",
}

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

type StatusFilter = OrderStatus | "all"

export function OrdersList({ orders: initialOrders }: { orders: OrderRow[] }) {
  const router = useRouter()
  const toast = useToast()
  const [orders, setOrders] = useState(initialOrders)

  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])
  const [openId, setOpenId] = useState<number | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length }
    for (const s of orderStatuses) counts[s] = 0
    for (const o of orders) counts[o.status] = (counts[o.status] ?? 0) + 1
    return counts
  }, [orders])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false
      if (q) {
        const haystack = `${o.order_uid} ${o.id} ${o.customer_name} ${o.phone}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [orders, search, statusFilter])

  const hasFilters = search.trim() !== "" || statusFilter !== "all"

  async function changeStatus(id: number, status: string) {
    setBusyId(id)
    // Optimistic: update local state immediately
    const previousOrders = orders
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: status as OrderStatus } : o))
    )

    try {
      await updateOrderStatusAction(id, status)
      const uid = orders.find((o) => o.id === id)?.order_uid ?? `#${id}`
      toast.success(`অর্ডার ${uid} স্ট্যাটাস "${statusLabels[status as OrderStatus] || status}" তে আপডেট হয়েছে`)
      router.refresh()
    } catch (e) {
      console.error("[orders-list] update status error:", (e as Error).message)
      setOrders(previousOrders)
      toast.error("স্ট্যাটাস আপডেট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।")
    } finally {
      setBusyId(null)
    }
  }

  async function remove(id: number) {
    setBusyId(id)
    // Optimistic: remove from local list immediately
    const previousOrders = orders
    setOrders((prev) => prev.filter((o) => o.id !== id))

    try {
      await deleteOrderAction(id)
      const uid = previousOrders.find((o) => o.id === id)?.order_uid ?? `#${id}`
      toast.success(`অর্ডার ${uid} সফলভাবে মুছে ফেলা হয়েছে!`)
      router.refresh()
    } catch (e) {
      console.error("[orders-list] delete order error:", (e as Error).message)
      setOrders(previousOrders)
      toast.error("অর্ডার মুছতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।")
    } finally {
      setBusyId(null)
      setConfirmId(null)
    }
  }

  return (
    <div>
      <PageTitle title="অর্ডার" description="কাস্টমারদের অর্ডার দেখুন ও স্ট্যাটাস আপডেট করুন।" />

      {orders.length > 0 && (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="অর্ডার আইডি, নাম বা ফোন দিয়ে সার্চ করুন..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none focus:border-foreground"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {(["all", ...orderStatuses] as StatusFilter[]).map((s) => {
              const active = statusFilter === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {s === "all" ? "সব" : statusLabels[s]}
                  <span className={`rounded-full px-1.5 ${active ? "bg-background/20" : "bg-muted"}`}>
                    {statusCounts[s] ?? 0}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              {filtered.length} / {orders.length} অর্ডার
            </span>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setStatusFilter("all")
                }}
                className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 font-medium text-foreground hover:bg-muted"
              >
                <X className="h-3 w-3" /> ফিল্টার মুছুন
              </button>
            )}
          </div>
        </>
      )}

      {orders.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" strokeWidth={1.4} />
          <p className="text-sm text-muted-foreground">এখনো কোনো অর্ডার আসেনি।</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Search className="h-10 w-10 text-muted-foreground" strokeWidth={1.4} />
          <p className="text-sm text-muted-foreground">এই ফিল্টারে কোনো অর্ডার পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {filtered.map((o) => {
            const open = openId === o.id
            return (
              <div key={o.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : o.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    {open ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        <span className="font-mono text-xs text-muted-foreground">{o.order_uid}</span> — {o.customer_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
                    </div>
                  </button>

                  <span className="font-semibold text-foreground">{bdt(o.total)}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[o.status] ?? statusStyles.pending}`}
                  >
                    {statusLabels[o.status] ?? o.status}
                  </span>
                </div>

                {open && (
                  <div className="border-t border-border bg-background/40 p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-2 text-sm">
                        <p className="flex items-center gap-2 text-foreground">
                          <Phone className="h-4 w-4 text-muted-foreground" /> {o.phone}
                        </p>
                        <p className="flex items-start gap-2 text-foreground">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /> {o.address}
                        </p>
                        <p className="text-muted-foreground">
                          লোকেশন: {o.location === "inside" ? "ঢাকার ভিতরে" : "ঢাকার বাইরে"}
                        </p>
                        <p className="text-muted-foreground">
                          পেমেন্ট: {paymentLabels[o.payment_method] ?? o.payment_method}
                          {o.transaction_id ? ` — TxID: ${o.transaction_id}` : ""}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-muted-foreground">অর্ডার আইটেম</span>
                        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                          {o.items.map((it, idx) => (
                            <li key={idx} className="flex items-center gap-3 p-2.5 text-sm">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={it.image || "/placeholder.svg"}
                                alt={it.name}
                                className="h-10 w-9 shrink-0 rounded object-cover object-top"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-foreground">{it.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {it.size} · {it.color} · x{it.qty}
                                </p>
                              </div>
                              <span className="font-medium text-foreground">{bdt(it.price * it.qty)}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-col gap-1 text-sm">
                          <Row label="সাবটোটাল" value={bdt(o.subtotal)} />
                          <Row label="ডেলিভারি" value={bdt(o.delivery_charge)} />
                          <div className="flex items-center justify-between border-t border-border pt-1 font-semibold text-foreground">
                            <span>মোট</span>
                            <span>{bdt(o.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                      <label className="flex items-center gap-2 text-sm text-foreground">
                        স্ট্যাটাস:
                        <select
                          value={o.status}
                          disabled={busyId === o.id}
                          onChange={(e) => changeStatus(o.id, e.target.value)}
                          className="h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground outline-none focus:border-foreground disabled:opacity-60"
                        >
                          {orderStatuses.map((s) => (
                            <option key={s} value={s}>
                              {statusLabels[s]}
                            </option>
                          ))}
                        </select>
                      </label>
                      {busyId === o.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}

                      <div className="ml-auto">
                        {confirmId === o.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => remove(o.id)}
                              disabled={busyId === o.id}
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                              হ্যাঁ, মুছুন
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmId(null)}
                              className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                            >
                              বাতিল
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmId(o.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> অর্ডার মুছুন
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
