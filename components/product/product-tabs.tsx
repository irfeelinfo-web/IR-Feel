"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Check, Star } from "lucide-react"

const tabs = ["DESCRIPTION", "ADDITIONAL INFORMATION", "REVIEWS (128)"]

const features = [
  "80% Cotton, 20% Polyester",
  "Soft fleece fabric",
  "Adjustable drawstring hood",
  "Kangaroo pocket",
  "Ribbed cuffs and hem",
]

const specs = [
  ["Material", "80% Cotton, 20% Polyester"],
  ["Fit", "Relaxed"],
  ["Care", "Machine wash cold"],
  ["Origin", "Ethically made"],
]

const reviews = [
  { name: "James W.", rating: 5, text: "Incredible quality and the fit is perfect. My new favorite hoodie." },
  { name: "Sophia L.", rating: 5, text: "Super soft and cozy. Looks even better in person." },
  { name: "Michael R.", rating: 4, text: "Great everyday piece, true to size and very comfortable." },
]

export function ProductTabs({ description }: { description?: string }) {
  const [active, setActive] = useState(0)

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
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                {description || "Our Essentials Hoodie is designed for comfort and style. Made with a soft cotton-blend fleece, featuring a minimal design and a relaxed fit."}
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

          {active === 2 && (
            <div className="max-w-md space-y-6">
              {reviews.map((r) => (
                <div key={r.name} className="border-b border-border pb-6 last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{r.name}</p>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < r.rating ? "fill-gold text-gold" : "text-border"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Promo banner */}
        <div className="relative flex min-h-[240px] items-center overflow-hidden rounded-2xl bg-primary p-10 text-primary-foreground">
          <Image
            src="/images/hoodie-side.png"
            alt="Upgrade your style"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover object-right opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />
          <div className="relative z-10">
            <p className="text-xs font-medium tracking-widest text-primary-foreground/70">
              New Collection
            </p>
            <h3 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight">
              UPGRADE
              <br />
              YOUR STYLE
            </h3>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center rounded-full border border-white/40 px-7 py-2.5 text-[11px] font-semibold tracking-widest text-white transition-colors hover:bg-white hover:text-primary"
            >
              SHOP NOW
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
