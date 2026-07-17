"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useCallback, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { HeroSlide } from "@/lib/site-config"

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0)
  const touchRef = useRef<{ x: number; y: number } | null>(null)

  const count = slides.length
  const next = useCallback(() => setIndex((i) => (i + 1) % Math.max(count, 1)), [count])
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + Math.max(count, 1)) % Math.max(count, 1)),
    [count],
  )

  useEffect(() => {
    if (count <= 1) return
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % count)
    }, 6000)
    return () => clearInterval(t)
  }, [count])

  // Touch swipe handlers
  function onTouchStart(e: React.TouchEvent) {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!touchRef.current) return
    const dx = e.changedTouches[0].clientX - touchRef.current.x
    const dy = e.changedTouches[0].clientY - touchRef.current.y
    // Only swipe if horizontal movement > vertical (avoid blocking scroll)
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) prev()
      else next()
    }
    touchRef.current = null
  }

  if (count === 0) return null
  const slide = slides[Math.min(index, count - 1)]

  return (
    <section
      className="relative overflow-hidden bg-primary text-primary-foreground"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background model images */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === index ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
            }`}
          >
            <Image
              src={s.image || "/placeholder.svg"}
              alt={s.alt}
              fill
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              sizes="100vw"
              className="object-cover object-center md:object-right"
            />
          </div>
        ))}
        {/* Removed gradient overlay as per request */}
      </div>

      <div className="relative mx-auto flex min-h-[360px] max-w-[1280px] items-end px-4 pb-14 pt-24 sm:min-h-[420px] sm:items-center sm:px-6 sm:py-16 md:min-h-[520px] lg:min-h-[560px] z-20">
        {/* Render text with key based on slide index so standard CSS transition runs on change */}
        <div key={index} className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-[10px] font-medium tracking-[0.25em] text-primary-foreground/70 sm:text-xs">
            {slide.label}
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-[0.95] tracking-tight sm:mt-4 sm:text-5xl md:text-6xl lg:text-7xl">
            {slide.titleLine1}
            <br />
            {slide.titleLine2}
            <span className="text-gold">{slide.accent}</span>
          </h1>
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-primary-foreground/70 sm:mt-6 sm:text-sm">
            {slide.subtitle}
          </p>
          <Link
            href={slide.buttonHref || "/shop"}
            className="mt-5 inline-flex items-center rounded-full bg-white px-6 py-3 text-[10px] font-semibold tracking-widest text-primary transition-all hover:bg-gold hover:text-white sm:mt-8 sm:px-8 sm:py-3.5 sm:text-xs"
          >
            {slide.buttonText || "SHOP NOW"}
          </Link>
        </div>
      </div>

      {/* Arrows — hidden on mobile to avoid text overlap; visible on sm+ */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-primary-foreground/80 backdrop-blur-sm transition-colors hover:bg-black/40 hover:text-primary-foreground sm:left-3 sm:flex sm:h-auto sm:w-auto sm:bg-transparent sm:backdrop-blur-none"
      >
        <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-primary-foreground/80 backdrop-blur-sm transition-colors hover:bg-black/40 hover:text-primary-foreground sm:right-3 sm:flex sm:h-auto sm:w-auto sm:bg-transparent sm:backdrop-blur-none"
      >
        <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
      </button>

      {/* Dots — bigger touch targets */}
      <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="flex h-8 w-8 items-center justify-center"
          >
            <span
              className={`block h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-gold" : "w-2 bg-white/40"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
