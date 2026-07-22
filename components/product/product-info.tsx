"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Star,
  Minus,
  Plus,
  Heart,
  Ruler,
  Truck,
  RotateCcw,
  ShieldCheck,
  MessageCircle,
  Phone,
} from "lucide-react"
import type { SiteSettings } from "@/lib/site-config"
import { bdt, shopColors, type DetailedProduct } from "@/lib/products"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"

export function ProductInfo({ product, settings }: { product: DetailedProduct; settings: SiteSettings }) {
  const { addItem } = useCart()
  const { has: inWishlist, toggle: toggleWishlist } = useWishlist()
  const router = useRouter()
  const [color, setColor] = useState(product.colors[0])
  const [size, setSize] = useState(product.sizes[Math.min(1, product.sizes.length - 1)])
  const [qty, setQty] = useState(1)
  const wishlisted = inWishlist(product.id)
  const isOutOfStock = product.inStock === false

  function colorValue(name: string) {
    return shopColors.find((c) => c.name === name)?.value ?? "#111111"
  }

  function handleOrderNow() {
    if (isOutOfStock) return
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size,
        color,
      },
      qty,
    )
    router.push("/checkout")
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {product.name}
      </h1>

      {/* Rating */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.round(product.rating) ? "fill-gold text-gold" : "text-border"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
      </div>

      {/* Price */}
      <div className="mt-5 flex items-center gap-3">
        <span className="text-2xl font-bold text-foreground">{bdt(product.price)}</span>
        {product.oldPrice && (
          <span className="text-lg text-muted-foreground line-through">
            {bdt(product.oldPrice)}
          </span>
        )}
      </div>



      <div className="my-7 h-px bg-border" />

      {/* Color */}
      <div>
        <p className="text-sm font-medium text-foreground">
          Color: <span className="text-muted-foreground">{color}</span>
        </p>
        <div className="mt-3 flex gap-3">
          {product.colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={c}
              style={{ backgroundColor: colorValue(c) }}
              className={`h-9 w-9 rounded-full border transition-all duration-300 ease-out active:scale-90 ${
                color === c
                  ? "ring-2 ring-primary ring-offset-2"
                  : "border-border hover:scale-110"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            Size: <span className="text-muted-foreground">{size}</span>
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex gap-2.5">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`glass-size-btn flex h-11 w-11 items-center justify-center rounded-lg text-sm font-medium transition-transform duration-300 active:scale-90 ${
                  size === s
                    ? "glass-size-active"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button onClick={() => router.push("/size-guide")} className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline">
            <Ruler className="h-4 w-4" />
            Size Guide
          </button>
        </div>
      </div>

      {/* Quantity + Add to cart */}
      <div className="mt-7 flex flex-wrap items-stretch gap-2 sm:gap-3">
        <div className="glass-qty-wrap flex items-center">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="glass-qty-btn flex h-12 w-10 items-center justify-center text-foreground transition-transform duration-300 active:scale-90 sm:h-14 sm:w-12"
          >
            <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <span className="flex h-12 w-8 items-center justify-center text-sm font-medium sm:h-14 sm:w-10">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
            className="glass-qty-btn flex h-12 w-10 items-center justify-center text-foreground transition-transform duration-300 active:scale-90 sm:h-14 sm:w-12"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>

        <button
          onClick={handleOrderNow}
          disabled={isOutOfStock}
          className={`btn-order-shimmer flex h-12 flex-1 items-center justify-center gap-2 rounded-lg text-[11px] font-semibold tracking-widest text-primary-foreground sm:h-14 sm:text-xs transition-transform duration-300 active:scale-[0.98] ${isOutOfStock ? "opacity-50 cursor-not-allowed !animate-none" : ""}`}
        >
          {isOutOfStock ? "OUT OF STOCK" : "ORDER NOW"}
        </button>

        <button
          onClick={() =>
            toggleWishlist({
              id: product.id,
              name: product.name,
              price: product.price,
              oldPrice: product.oldPrice,
              image: product.image,
            })
          }
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          className="flex h-12 w-11 items-center justify-center rounded-lg border border-border text-foreground transition-all duration-300 ease-out hover:bg-muted active:scale-90 sm:h-14 sm:w-14"
        >
          <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${wishlisted ? "fill-gold text-gold" : ""}`} />
        </button>
      </div>

      {/* Contact Order Buttons */}
      {(() => {
        const whatsappNum = (settings.whatsappNumber || settings.phone || "").replace(/[^0-9]/g, "")
        const callNum = (settings.phone || "").replace(/[^0-9+]/g, "")
        const showWhatsapp = settings.productWhatsappButton && whatsappNum.length > 0
        const showCall = settings.productCallButton && callNum.length > 0
        if (!showWhatsapp && !showCall) return null
        return (
          <div className="mt-2 flex gap-2 sm:gap-3">
            {showWhatsapp && (
              <button
                onClick={() => {
                  const url = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(`Hi, I want to order ${product.name} (Size: ${size}, Color: ${color}).\nProduct Link: ${window.location.href}`)}`;
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
                className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] text-[11px] font-semibold tracking-widest text-white transition-all duration-300 ease-out hover:bg-[#128C7E] active:scale-[0.98] sm:h-14 sm:gap-2 sm:text-xs"
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                Order On WhatsApp
              </button>
            )}
            {showCall && (
              <a
                href={`tel:${callNum}`}
                className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#284a92] text-[11px] font-semibold tracking-widest text-white transition-all duration-300 ease-out hover:bg-[#1a3266] active:scale-[0.98] sm:h-14 sm:gap-2 sm:text-xs"
              >
                <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                Call For Order
              </a>
            )}
          </div>
        )
      })()}

      <div className="my-7 h-px bg-border" />

      {/* Trust badges — Premium */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {[
          { icon: Truck, title: "Free Shipping", desc: "On orders over ৳ 999" },
          { icon: RotateCcw, title: "Easy Returns", desc: "7 days return policy" },
          { icon: ShieldCheck, title: "Secure Payment", desc: "100% secure checkout" },
        ].map((f) => (
          <div key={f.title} className="trust-badge-card flex items-center gap-2">
            <div className="trust-badge-icon">
              <f.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
