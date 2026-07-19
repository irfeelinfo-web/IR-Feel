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
        <div key={index} className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          <div className="rounded-2xl bg-black/20 p-6 backdrop-blur-md border border-white/10 shadow-2xl sm:p-10 sm:rounded-3xl relative overflow-hidden">
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
            
            <p className="relative text-[10px] font-bold uppercase tracking-[0.3em] text-white/90 sm:text-xs">
              {slide.label}
            </p>
            <h1 className="relative mt-4 font-display text-4xl font-light leading-[1.1] tracking-wide text-white sm:mt-5 sm:text-5xl md:text-6xl drop-shadow-md">
              {slide.titleLine1}
              <br />
              <span className="font-semibold">{slide.titleLine2}</span>{" "}
              <span className="text-gold font-bold italic tracking-normal">{slide.accent}</span>
            </h1>
            <p className="relative mt-5 max-w-sm text-sm leading-relaxed text-white/80 sm:mt-6 sm:text-base font-light">
              {slide.subtitle}
            </p>
            <Link
              href={slide.buttonHref || "/shop"}
              className="group relative mt-8 inline-flex items-center gap-4 rounded-full bg-white pr-2 pl-8 py-2 text-xs font-bold tracking-[0.15em] text-black transition-all hover:bg-black hover:text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
            >
              <span>{slide.buttonText || "SHOP NOW"}</span>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:rotate-45 group-hover:bg-white group-hover:text-black">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </div>
            </Link>
          </div>
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
