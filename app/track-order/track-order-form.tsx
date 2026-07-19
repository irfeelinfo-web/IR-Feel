"use client"

import { useState } from "react"
import { Search, Loader2, Package, MapPin } from "lucide-react"
import { trackOrderAction } from "./actions"
import type { OrderRow } from "@/lib/order-types"

export function TrackOrderForm() {
  const [orderId, setOrderId] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<OrderRow | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setOrder(null)
    setLoading(true)

    try {
      const result = await trackOrderAction(orderId, phone)
      if (result.error) {
        setError(result.error)
      } else if (result.success && result.order) {
        setOrder(result.order)
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 relative z-10 group/form">
      {/* Animated glow behind the form */}
      <div className="absolute inset-0 sm:-inset-1 rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-xl transition-opacity duration-500 group-hover/form:opacity-40" />
      
      <form onSubmit={handleSubmit} className="relative flex flex-col gap-4 sm:gap-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-card/40 backdrop-blur-3xl p-5 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(255,255,255,0.05)] ring-1 ring-white/20 sm:flex-row sm:items-end">
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        
        <div className="relative flex-1 space-y-1.5 sm:space-y-2">
          <label htmlFor="orderId" className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1 sm:ml-2">
            Order ID
          </label>
          <input
            id="orderId"
            type="text"
            placeholder="e.g. IRF-A7X3K9B2"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
            className="h-12 sm:h-14 w-full rounded-xl border border-border/40 bg-background/40 px-4 sm:px-5 text-sm font-bold text-foreground outline-none backdrop-blur-md transition-all focus:border-indigo-500/50 focus:bg-background/80 focus:ring-4 focus:ring-indigo-500/20 placeholder:text-muted-foreground/50 shadow-inner"
          />
        </div>
        <div className="relative flex-1 space-y-1.5 sm:space-y-2">
          <label htmlFor="phone" className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1 sm:ml-2">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="e.g. 01700000000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="h-12 sm:h-14 w-full rounded-xl border border-border/40 bg-background/40 px-4 sm:px-5 text-sm font-bold text-foreground outline-none backdrop-blur-md transition-all focus:border-indigo-500/50 focus:bg-background/80 focus:ring-4 focus:ring-indigo-500/20 placeholder:text-muted-foreground/50 shadow-inner"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !orderId || !phone}
          className="group relative flex h-12 sm:h-14 w-full sm:w-auto sm:min-w-[130px] mt-2 sm:mt-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 sm:px-8 text-sm font-bold uppercase tracking-widest text-white transition-all hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(168,85,247,0.4)] active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
            <div className="relative h-full w-10 bg-white/30" />
          </div>
          {loading ? <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin relative z-10" /> : <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5 relative z-10 text-white" />}
          <span className="relative z-10 text-white">Track</span>
        </button>
      </form>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {order && (
        <div className="overflow-hidden rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          <div className="relative border-b border-border/50 bg-muted/20 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">অর্ডার <span className="text-foreground/70">#{order.order_uid}</span></h3>
                <p className="mt-1 text-sm text-muted-foreground font-medium">
                  Placed on {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-border/50 bg-background/80 px-4 py-1.5 text-sm font-bold uppercase tracking-widest shadow-sm backdrop-blur-md">
                <div className={
                  order.status === "delivered" ? "h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgb(34,197,94,0.6)]" :
                  order.status === "confirmed" ? "h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgb(59,130,246,0.6)] animate-pulse" :
                  order.status === "shipped" ? "h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgb(99,102,241,0.6)] animate-pulse" :
                  order.status === "cancelled" ? "h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgb(239,68,68,0.6)]" :
                  "h-2.5 w-2.5 rounded-full bg-yellow-500 shadow-[0_0_10px_rgb(234,179,8,0.6)] animate-pulse"
                } />
                {order.status}
              </div>
            </div>
          </div>

          <div className="relative p-6 sm:p-8">
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-4 text-sm">
                <h4 className="font-bold text-foreground flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Delivery Details
                </h4>
                <div className="rounded-2xl border border-border/40 bg-muted/10 p-5 shadow-inner">
                  <p className="font-bold text-base text-foreground mb-1">{order.customer_name}</p>
                  <p className="text-muted-foreground font-medium mb-3">{order.phone}</p>
                  <p className="text-muted-foreground leading-relaxed">{order.address}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <h4 className="font-bold text-foreground flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <Package className="h-4 w-4" />
                  Order Summary
                </h4>
                <div className="rounded-2xl border border-border/40 bg-muted/10 p-5 shadow-inner space-y-3 font-medium">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>৳ {order.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Fee</span>
                    <span>৳ {order.delivery_charge}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-foreground pt-3 border-t border-border/50">
                    <span>Total</span>
                    <span>৳ {order.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
