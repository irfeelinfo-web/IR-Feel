"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { bdt } from "@/lib/products"
import { useCart } from "@/lib/cart-context"

export function CartDrawer() {
  const { items, subtotal, count, isOpen, closeCart, updateQty, removeItem } = useCart()
  const touchRef = useRef<{ x: number; y: number } | null>(null)

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart()
    }
    if (isOpen) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, closeCart])

  function onTouchStart(e: React.TouchEvent) {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!touchRef.current) return
    const dx = e.changedTouches[0].clientX - touchRef.current.x
    const dy = e.changedTouches[0].clientY - touchRef.current.y
    // Close if swiped right and horizontal swipe is dominant
    if (dx > 50 && Math.abs(dx) > Math.abs(dy)) {
      closeCart()
    }
    touchRef.current = null
  }

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden={!isOpen}
        onClick={closeCart}
        className={`fixed inset-0 z-[60] bg-foreground/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-[400px] flex-col bg-background/80 border-l border-border/40 backdrop-blur-2xl shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold tracking-widest text-foreground">
              আপনার কার্ট ({count})
            </h2>
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="text-foreground transition-opacity hover:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" strokeWidth={1} />
            <p className="text-sm text-muted-foreground">আপনার কার্ট খালি।</p>
            <button
              onClick={closeCart}
              className="mt-2 bg-primary px-6 py-3 text-[11px] font-semibold tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
            >
              শপিং চালিয়ে যান
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="flex flex-col gap-5">
                {items.map((item) => (
                  <li
                    key={`${item.id}__${item.size}__${item.color}`}
                    className="flex gap-4"
                  >
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-muted">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <button
                          onClick={() => removeItem(item.id, item.size, item.color)}
                          aria-label={`Remove ${item.name}`}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.color} / {item.size}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center border border-border">
                          <button
                            onClick={() =>
                              updateQty(item.id, item.size, item.color, item.qty - 1)
                            }
                            aria-label="Decrease quantity"
                            className="flex h-8 w-8 items-center justify-center text-foreground transition-colors hover:bg-muted"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="flex h-8 w-8 items-center justify-center text-xs font-medium">
                            {item.qty}
                          </span>
                          <button
                            onClick={() =>
                              updateQty(item.id, item.size, item.color, item.qty + 1)
                            }
                            aria-label="Increase quantity"
                            className="flex h-8 w-8 items-center justify-center text-foreground transition-colors hover:bg-muted"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {bdt(item.price * item.qty)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t border-border/40 px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">সাবটোটাল</span>
                <span className="text-lg font-bold text-foreground">{bdt(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                শিপিং ও ট্যাক্স চেকআউটে ক্যালকুলেট হবে।
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex h-12 items-center justify-center bg-primary text-[11px] font-semibold tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
                >
                  অর্ডার করুন
                </Link>
                <button
                  onClick={closeCart}
                  className="flex h-12 items-center justify-center border border-border text-[11px] font-semibold tracking-widest text-foreground transition-colors hover:bg-muted"
                >
                  শপিং চালিয়ে যান
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
