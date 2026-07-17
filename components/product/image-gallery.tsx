"use client"

import Image from "next/image"
import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function ImageGallery({
  images,
  discount,
  isNew,
}: {
  images: string[]
  discount?: number
  isNew?: boolean
}) {
  const [active, setActive] = useState(0)
  const touchRef = useRef<{ x: number; y: number } | null>(null)

  const prev = () => setActive((a) => (a - 1 + images.length) % images.length)
  const next = () => setActive((a) => (a + 1) % images.length)

  function onTouchStart(e: React.TouchEvent) {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!touchRef.current) return
    const dx = e.changedTouches[0].clientX - touchRef.current.x
    const dy = e.changedTouches[0].clientY - touchRef.current.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) prev()
      else next()
    }
    touchRef.current = null
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {/* Thumbnails */}
      <div className="order-2 flex gap-3 sm:order-1 sm:flex-col">
        {images.map((img, i) => (
          <button
            key={img}
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
            className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg bg-muted sm:w-[86px] transition-all duration-300 ease-out active:scale-95 ${
              active === i ? "ring-2 ring-primary ring-offset-1" : "opacity-80 hover:opacity-100"
            }`}
          >
            <Image
              src={img || "/placeholder.svg"}
              alt={`Thumbnail ${i + 1}`}
              fill
              sizes="86px"
              className="object-cover object-top"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div
        className="group relative order-1 aspect-[3/4] flex-1 overflow-hidden rounded-xl bg-muted sm:order-2"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {discount !== undefined && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
            -{discount}%
          </span>
        )}
        {isNew && (
          <span className="absolute left-4 top-12 z-10 rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
            NEW
          </span>
        )}
        <Image
          src={images[active] || "/placeholder.svg"}
          alt="Product image"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110"
        />

        {/* Arrows */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          <button
            onClick={prev}
            aria-label="Previous image"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all duration-300 ease-out hover:bg-primary hover:text-primary-foreground active:scale-90"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            aria-label="Next image"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all duration-300 ease-out hover:bg-primary hover:text-primary-foreground active:scale-90"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
