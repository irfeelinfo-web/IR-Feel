"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Truck, Search, Heart, ShoppingBag, Menu, X, UserCircle } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { useCustomer } from "@/lib/customer-context"
const SearchOverlay = dynamic(() => import("./search-overlay").then(m => m.SearchOverlay), {
  ssr: false,
  loading: () => null,
})
import type { SiteSettings, AnnouncementConfig, NavItem } from "@/lib/site-config"

export function SiteHeaderClient({
  active = "home",
  settings,
  announcement,
  nav,
}: {
  active?: string
  settings: SiteSettings
  announcement: AnnouncementConfig
  nav: NavItem[]
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [closed, setClosed] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { count, openCart } = useCart()
  const { count: wishlistCount } = useWishlist()
  const { customer } = useCustomer()

  // Persist announcement dismiss in sessionStorage
  useEffect(() => {
    try {
      if (sessionStorage.getItem("announce-closed") === "1") setClosed(true)
    } catch {}
  }, [])

  function dismissAnnouncement() {
    setClosed(true)
    try { sessionStorage.setItem("announce-closed", "1") } catch {}
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const bannerVisible = announcement.enabled && !closed && !scrolled

  return (
    <>
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Announcement bar */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
          bannerVisible ? "max-h-12 opacity-100" : "pointer-events-none max-h-0 opacity-0"
        }`}
        aria-hidden={!bannerVisible}
      >
        <div className="relative overflow-hidden bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100">
          {/* animated gold sheen sweeping across automatically */}
          <div className="pointer-events-none absolute inset-y-0 -inset-x-1/2 bg-gradient-to-r from-transparent via-gold/25 to-transparent announce-sheen" />
          {/* gold hairlines top & bottom */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

          <div className="relative mx-auto flex h-10 max-w-[1280px] items-center px-4 sm:px-6">
            {/* auto-scrolling marquee of messages */}
            <div className="marquee-pause relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              <div className="marquee-track flex w-max items-center whitespace-nowrap">
                {[0, 1].map((dup) => (
                  <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <span key={i} className="flex items-center text-[11px]">
                        <span className="flex items-center gap-2 px-6">
                          <Truck className="h-3.5 w-3.5 text-gold" />
                          <span className="font-medium tracking-wide">
                            {announcement.text}{" "}
                            {announcement.highlight && (
                              <span className="font-semibold text-gold">{announcement.highlight}</span>
                            )}
                          </span>
                          {announcement.code && (
                            <span className="ml-1 inline-flex items-center rounded-full border border-gold/50 bg-gold/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                              Code: {announcement.code}
                            </span>
                          )}
                        </span>
                        <span className="text-gold/70" aria-hidden="true">
                          ✦
                        </span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => dismissAnnouncement()}
              aria-label="Close announcement"
              className="relative z-10 ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-primary-foreground/60 transition-all hover:bg-white/10 hover:text-primary-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div
        className={`border-b transition-all duration-300 ${
          scrolled
            ? "border-border/60 bg-background/85 shadow-[0_6px_28px_-14px_rgba(0,0,0,0.28)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/70"
            : "border-border/40 bg-background/70 shadow-[0_1px_20px_-12px_rgba(0,0,0,0.18)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/55"
        }`}
      >
        <div
          className={`mx-auto flex max-w-[1280px] items-center justify-between px-4 transition-all duration-300 sm:px-6 ${
            scrolled ? "h-[62px]" : "h-[72px]"
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label={settings.brandName}
            className={`group flex items-center font-display text-[20px] sm:text-[22px] font-extrabold leading-none tracking-tight text-foreground transition-all duration-500 hover:scale-105 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 glass-iphone rounded-full hover:shadow-[0_8px_16px_-6px_rgba(255,215,0,0.3)] hover:ring-1 hover:ring-gold/40 ${
              settings.logoImage ? "p-1 sm:p-1.5" : "px-4 py-1.5"
            }`}
          >
            {settings.logoImage ? (
              <div className="relative overflow-hidden rounded-full h-8 w-8 sm:h-9 sm:w-9 shadow-sm ring-1 ring-border/50 transition-colors duration-500 group-hover:ring-gold/50">
                <Image
                  src={settings.logoImage || "/placeholder.svg"}
                  alt={settings.brandName}
                  fill
                  sizes="(max-width: 640px) 32px, 36px"
                  className="rounded-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              </div>
            ) : (
              <span className="relative inline-flex items-baseline">
                <span className="transition-colors duration-300">{settings.brandName}</span>
                <span className="text-gold">{settings.brandAccent}</span>
              </span>
            )}
          </Link>

          {/* Center nav */}
          <nav className="hidden items-center gap-9 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`group relative py-1 text-[13px] font-medium uppercase tracking-[0.14em] transition-colors ${
                  active === item.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-300 ${
                    active === item.key ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/90 transition-all duration-300 hover:bg-foreground/10 hover:text-foreground hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95"
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </button>

            <Link
              href={customer ? "/account" : "/login"}
              aria-label="Account"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#1b3a3a] dark:text-gold/90 transition-all duration-300 hover:bg-[#1b3a3a]/10 hover:text-[#1b3a3a] dark:hover:bg-gold/10 dark:hover:text-gold hover:shadow-[0_0_15px_rgba(27,58,58,0.2)] hover:scale-105 active:scale-95"
            >
              {customer?.avatar ? (
                <span className="relative flex h-7 w-7 overflow-hidden rounded-full ring-2 ring-border">
                  <Image src={customer.avatar} alt={customer.name} fill sizes="28px" className="object-cover" />
                </span>
              ) : customer ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background ring-2 ring-border">
                  {customer.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                </span>
              ) : (
                <UserCircle className="h-[18px] w-[18px]" strokeWidth={1.6} />
              )}
            </Link>

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative hidden h-10 w-10 items-center justify-center rounded-full text-rose-500/90 transition-all duration-300 hover:bg-rose-500/10 hover:text-rose-600 hover:shadow-[0_0_15px_rgba(244,63,94,0.25)] hover:scale-105 active:scale-95 sm:flex"
            >
              <Heart className="h-[18px] w-[18px]" strokeWidth={1.6} />
              {wishlistCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-primary ring-2 ring-background">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              onClick={openCart}
              aria-label="Open cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-emerald-500/90 transition-all duration-300 hover:bg-emerald-500/10 hover:text-emerald-600 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.6} />
              {count > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-background">
                  {count}
                </span>
              )}
            </button>
            <button
              aria-label="Menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/90 transition-all duration-300 hover:bg-foreground/10 hover:text-foreground hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95 lg:hidden"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <>
            {/* Backdrop for mobile menu */}
            <div
              className="fixed inset-0 top-[var(--header-height,60px)] z-[-1] bg-foreground/20 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              onTouchStart={(e) => {
                // Simple swipe up to close
                const touchY = e.touches[0].clientY;
                const handleTouchMove = (moveEvent: TouchEvent) => {
                  if (touchY - moveEvent.touches[0].clientY > 30) {
                    setMobileOpen(false);
                    document.removeEventListener('touchmove', handleTouchMove);
                  }
                };
                document.addEventListener('touchmove', handleTouchMove, { once: true });
              }}
            />
            <nav className="border-t border-border/50 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 lg:hidden">
              <div className="mx-auto flex max-w-[1280px] flex-col px-4 py-2 sm:px-6">
                {nav.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between border-b border-border/40 py-3 text-sm font-medium uppercase tracking-[0.12em] transition-colors last:border-none ${
                      active === item.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                    {active === item.key && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
                  </Link>
                ))}
                {/* Account link for mobile */}
                <Link
                  href={customer ? "/account" : "/login"}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between border-b border-border/40 py-3 text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="flex items-center gap-2">
                    {customer?.avatar ? (
                      <span className="relative flex h-5 w-5 overflow-hidden rounded-full ring-1 ring-border">
                        <Image src={customer.avatar} alt="" fill sizes="20px" className="object-cover" />
                      </span>
                    ) : customer ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[8px] font-bold text-background">
                        {customer.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                      </span>
                    ) : (
                      <UserCircle className="h-4 w-4" />
                    )}
                    {customer ? customer.name.split(" ")[0].toUpperCase() : "ACCOUNT"}
                  </span>
                </Link>
                {/* Wishlist link for mobile */}
                <Link
                  href="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between border-b border-border/40 py-3 text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors last:border-none hover:text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    WISHLIST
                  </span>
                  {wishlistCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-primary">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </div>
            </nav>
          </>
        )}
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
    {/* Spacer to prevent content from jumping when header shrinks on scroll */}
    {/* Un-scrolled header is 72px + 40px (announcement bar) = 112px. Without banner, it's 72px. */}
    <div style={{ height: bannerVisible ? "112px" : "72px", transition: "height 0.3s ease" }} aria-hidden="true" />
    </>
  )
}
