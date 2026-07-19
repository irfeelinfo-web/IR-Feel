"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Check, Star } from "lucide-react"
import type { DetailedProduct } from "@/lib/products"

export function ProductTabs({ product }: { product: DetailedProduct }) {
  const [active, setActive] = useState(0)

  // Fix #36: Make tabs and content dynamic based on the actual product
  const tabs = ["DESCRIPTION", "ADDITIONAL INFORMATION"]
  if (product.reviews > 0) {
    tabs.push(`REVIEWS (${product.reviews})`)
  }

  // Generate dynamic specs
  const specs = [
    ["Category", product.category || "General"],
    ["Available Sizes", product.sizes.join(", ") || "N/A"],
    ["Available Colors", product.colors.join(", ") || "N/A"],
  ]
  if (product.id.includes("hoodie")) {
    specs.unshift(["Material", "80% Cotton, 20% Polyester fleece"])
  } else if (product.id.includes("tshirt") || product.id.includes("polo") || product.id.includes("shirt")) {
    specs.unshift(["Material", "100% Premium Cotton"])
  } else if (product.id.includes("denim")) {
    specs.unshift(["Material", "Premium Denim Cotton"])
  } else if (product.id.includes("joggers")) {
    specs.unshift(["Material", "Stretch Cotton Twill"])
  }

  // Generate dynamic features
  const features = [
    "Premium quality materials",
    "Designed for lasting comfort",
    "Ethically manufactured",
    "Easy care and maintenance"
  ]
  if (product.id.includes("hoodie")) features.push("Adjustable drawstring hood", "Kangaroo pocket")
  if (product.id.includes("jacket")) features.push("Wind-resistant outer layer", "Durable zippers")

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
      {/* Tab headers */}
      <div className="flex gap-6 overflow-x-auto border-b border-border sm:gap-8" style={{ scrollbarWidth: 'none' }}>
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActive(i)}
            className={`relative -mb-px shrink-0 whitespace-nowrap pb-3 text-sm font-semibold tracking-wide transition-colors ${
              active === i
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Tab content */}
        <div>
          {active === 0 && (
            <div>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </p>
              <ul className="mt-6 space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="h-4 w-4 text-gold" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {active === 1 && (
            <div className="max-w-md divide-y divide-border">
              {specs.map(([label, value]) => (
                <div key={label} className="flex justify-between py-3 text-sm">
                  <span className="font-medium text-foreground">{label}</span>
                  <span className="text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          )}

          {active === 2 && product.reviews > 0 && (
            <div className="max-w-md space-y-6">
              <div className="border-b border-border pb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex text-gold">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < product.rating ? "fill-gold text-gold" : "text-border"}`} />
                    ))}
                  </div>
                  <span className="font-bold text-lg">{product.rating.toFixed(1)} / 5</span>
                </div>
                <p className="text-sm text-muted-foreground">Based on {product.reviews} reviews from verified buyers.</p>
              </div>
            </div>
          )}
        </div>

        {/* Promo banner */}
        <div className="relative flex min-h-[240px] items-center overflow-hidden rounded-2xl bg-primary p-10 text-primary-foreground">
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover object-right opacity-40 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />
          <div className="relative z-10">
            <p className="text-xs font-medium tracking-widest text-primary-foreground/70 uppercase">
              {product.category || "Premium Collection"}
            </p>
            <h3 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight max-w-[200px]">
              {product.name.toUpperCase()}
            </h3>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center rounded-full border border-white/40 px-7 py-2.5 text-[11px] font-semibold tracking-widest text-white transition-colors hover:bg-white hover:text-primary"
            >
              SHOP MORE
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
