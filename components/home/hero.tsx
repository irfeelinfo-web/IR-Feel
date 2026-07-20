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
        {/* Mobile gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent sm:bg-gradient-to-r sm:from-black/50 sm:via-black/20 sm:to-transparent z-[1]" />
      </div>

      <div className="relative mx-auto flex min-h-[320px] max-w-[1280px] items-end px-3 pb-12 pt-20 sm:min-h-[420px] sm:items-center sm:px-6 sm:py-16 md:min-h-[520px] md:px-8 lg:min-h-[560px] z-20">
        {/* Render text with key based on slide index so standard CSS transition runs on change */}
        <div key={index} className="w-full max-w-[85%] sm:max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          <div className="rounded-xl bg-black/20 p-4 backdrop-blur-md border border-white/10 shadow-2xl sm:p-8 sm:rounded-2xl md:p-10 md:rounded-3xl relative overflow-hidden">
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
            
            <p className="relative text-[9px] font-bold uppercase tracking-[0.3em] text-white/90 sm:text-[10px] md:text-xs">
              {slide.label}
            </p>
            <h1
              style={{ lineHeight: 1.1 }}
              className="relative mt-3 font-display text-[1.65rem] font-light tracking-wide text-white sm:mt-5 sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-md"
            >
              {slide.titleLine1}
              <br />
              <span className="font-semibold">{slide.titleLine2}</span>{" "}
              <span className="text-gold font-bold italic tracking-normal">{slide.accent}</span>
            </h1>
            <p className="relative mt-3 max-w-sm text-xs leading-relaxed text-white/80 sm:mt-6 sm:text-sm md:text-base font-light hidden sm:block">
              {slide.subtitle}
            </p>
            <Link
              href={slide.buttonHref || "/shop"}
              className="group relative mt-5 inline-flex items-center gap-3 rounded-full bg-white pr-1.5 pl-5 py-1.5 text-[10px] font-bold tracking-[0.15em] text-black transition-all hover:bg-black hover:text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] sm:mt-8 sm:gap-4 sm:pr-2 sm:pl-8 sm:py-2 sm:text-xs"
            >
              <span>{slide.buttonText || "SHOP NOW"}</span>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:rotate-45 group-hover:bg-white group-hover:text-black sm:h-10 sm:w-10">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4">
                  <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Arrows — visible on all sizes with touch-friendly targets */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-1 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-primary-foreground/80 backdrop-blur-sm transition-colors hover:bg-black/40 hover:text-primary-foreground sm:left-3 sm:h-auto sm:w-auto sm:bg-transparent sm:backdrop-blur-none"
      >
        <ChevronLeft className="h-5 w-5 sm:h-7 sm:w-7" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-1 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-primary-foreground/80 backdrop-blur-sm transition-colors hover:bg-black/40 hover:text-primary-foreground sm:right-3 sm:h-auto sm:w-auto sm:bg-transparent sm:backdrop-blur-none"
      >
        <ChevronRight className="h-5 w-5 sm:h-7 sm:w-7" />
      </button>

      {/* Dots — bigger touch targets */}
      <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 sm:bottom-6">
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
