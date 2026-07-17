"use client"
import Link from "next/link"
import {
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  Minus,
  Plus,
  Trash2,
} from "lucide-react"
import { bdt } from "@/lib/products"
import { useCart } from "@/lib/cart-context"
import type { PaymentConfig } from "@/lib/site-config"
import { defaultPayment } from "@/lib/site-config"

function getTrustBadges(supportPhone?: string) {
  return [
    {
      icon: Truck,
      title: "\u09b8\u09be\u09b0\u09be \u09ac\u09be\u0982\u09b2\u09be\u09a6\u09c7\u09b6\u09c7 \u09a1\u09c7\u09b2\u09bf\u09ad\u09be\u09b0\u09bf",
      desc: "\u09a6\u09cd\u09b0\u09c1\u09a4 \u0993 \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u09a1\u09c7\u09b2\u09bf\u09ad\u09be\u09b0\u09bf",
    },
    {
      icon: RotateCcw,
      title: "\u09b8\u09b9\u099c \u09b0\u09bf\u099f\u09be\u09b0\u09cd\u09a8 \u09aa\u09b2\u09bf\u09b8\u09bf",
      desc: "\u09e7 \u09a6\u09bf\u09a8\u09c7\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09b8\u09b9\u099c \u09b0\u09bf\u099f\u09be\u09b0\u09cd\u09a8 \u09b8\u09c1\u09ac\u09bf\u09a7\u09be",
    },
    {
      icon: ShieldCheck,
      title: "\u09e7\u09e6\u09e6% \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u09aa\u09c7\u09ae\u09c7\u09a8\u09cd\u099f",
      desc: "\u0986\u09aa\u09a8\u09be\u09b0 \u09aa\u09c7\u09ae\u09c7\u09a8\u09cd\u099f \u09a8\u09bf\u09b0\u09be\u09aa\u09a6 \u0993 \u0997\u09cb\u09aa\u09a8\u09c0\u09af\u09bc",
    },
    {
      icon: Headphones,
      title: "\u0995\u09be\u09b8\u09cd\u099f\u09ae\u09be\u09b0 \u09b8\u09be\u09aa\u09cb\u09b0\u09cd\u099f",
      desc: "\u0986\u09ae\u09be\u09a6\u09c7\u09b0 \u09b8\u09be\u09a5\u09c7 \u09af\u09cb\u0997\u09be\u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8",
      extra: supportPhone || undefined,
    },
  ]
}

export function OrderSummary({ payment = defaultPayment, freeShippingThreshold = 0 }: { payment?: PaymentConfig; freeShippingThreshold?: number }) {
  const {
    items,
    subtotal,
    updateQty,
    removeItem,
    deliveryLocation,
  } = useCart()

  const insideCharge = payment.insideDhakaCharge ?? 60
  const outsideCharge = payment.outsideDhakaCharge ?? 120
  // Apply free shipping threshold — waive delivery charge when subtotal exceeds threshold
  const isFreeShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold
  const deliveryCharge = items.length > 0 && !isFreeShipping ? (deliveryLocation === "outside" ? outsideCharge : insideCharge) : 0
  const total = subtotal + deliveryCharge

  return (
    <div className="font-bengali flex flex-col gap-6">
      {/* Order card */}
      <section className="glass-order-card rounded-lg border border-border p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-foreground" strokeWidth={1.8} />
          <h2 className="text-base font-semibold text-foreground">{"\u0986\u09aa\u09a8\u09be\u09b0 \u0985\u09b0\u09cd\u09a1\u09be\u09b0"}</h2>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" strokeWidth={1.4} />
            <p className="text-sm text-muted-foreground">{"\u0986\u09aa\u09a8\u09be\u09b0 \u0995\u09be\u09b0\u09cd\u099f \u0996\u09be\u09b2\u09bf \u0986\u099b\u09c7"}</p>
            <Link
              href="/shop"
              className="mt-1 rounded-md bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-all duration-300 ease-out active:scale-95 hover:opacity-90"
            >
              {"\u0995\u09c7\u09a8\u09be\u0995\u09be\u099f\u09be \u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09c1\u09a8"}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex flex-col divide-y divide-border">
              {items.map((item) => (
                <li
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="flex items-start gap-4 py-4 first:pt-0"
                >
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="h-20 w-16 shrink-0 rounded-md bg-secondary object-cover object-top"
                  />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Size: {item.size} &nbsp; Color: {item.color}
                    </p>
                    <div className="mt-1 flex items-center gap-3">
                      <div className="flex items-center rounded-md border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQty(item.id, item.size, item.color, item.qty - 1)}
                          className="flex h-7 w-7 items-center justify-center text-foreground transition-all duration-300 ease-out active:scale-90 hover:bg-muted"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="flex h-7 w-7 items-center justify-center text-xs font-medium">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQty(item.id, item.size, item.color, item.qty + 1)}
                          className="flex h-7 w-7 items-center justify-center text-foreground transition-all duration-300 ease-out active:scale-90 hover:bg-muted"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => removeItem(item.id, item.size, item.color)}
                        className="text-muted-foreground transition-all duration-300 ease-out hover:scale-110 active:scale-90 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{bdt(item.price * item.qty)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
              <Row label={"\u09b8\u09be\u09ac\u099f\u09cb\u099f\u09be\u09b2"} value={bdt(subtotal)} />
              <Row label={"\u09a1\u09c7\u09b2\u09bf\u09ad\u09be\u09b0\u09bf \u099a\u09be\u09b0\u09cd\u099c"} value={bdt(deliveryCharge)} />
              <div className="mt-1 flex items-center justify-between border-t border-border pt-4">
                <span className="text-lg font-bold text-foreground">{"\u09ae\u09cb\u099f"}</span>
                <span className="text-lg font-bold text-foreground">{bdt(total)}</span>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Trust badges */}
      <section className="glass-order-card rounded-lg border border-border p-5 sm:p-6">
        <ul className="flex flex-col divide-y divide-border">
          {getTrustBadges(payment.supportPhone).map((badge) => (
            <li key={badge.title} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                <badge.icon className="h-5 w-5 text-foreground" strokeWidth={1.8} />
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-foreground">{badge.title}</p>
                <p className="text-xs text-muted-foreground">{badge.desc}</p>
                {badge.extra && <p className="text-xs font-medium text-foreground">{badge.extra}</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
