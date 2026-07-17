import Image from "next/image"
import Link from "next/link"
import { Zap } from "lucide-react"
import type { PromoBanner } from "@/lib/site-config"

function ShopNowButton({ dark = false, text, href }: { dark?: boolean; text: string; href: string }) {
  return (
    <Link
      href={href || "/shop"}
      className={`mt-4 inline-flex w-fit items-center rounded-full px-6 py-2.5 text-[11px] font-semibold tracking-widest transition-colors ${
        dark
          ? "bg-gold text-primary hover:bg-gold/85"
          : "bg-primary text-primary-foreground hover:bg-primary/85"
      }`}
    >
      {text || "SHOP NOW"}
    </Link>
  )
}

export function PromoBanners({ banners }: { banners: PromoBanner[] }) {
  if (banners.length === 0) return null
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {banners.map((banner, i) => {
          if (banner.kind === "solid") {
            return (
              <div
                key={i}
                className="relative flex h-52 flex-col justify-center overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground"
              >
                <Zap className="absolute -right-4 top-1/2 h-44 w-44 -translate-y-1/2 fill-white/5 text-white/5" />
                <div className="relative z-10">
                  <h3 className="font-display text-2xl font-bold tracking-wide">{banner.title}</h3>
                  {banner.highlight ? (
                    <p className="mt-2 font-display text-lg font-bold text-gold">{banner.highlight}</p>
                  ) : null}
                  {banner.note ? (
                    <p className="text-[11px] tracking-widest text-primary-foreground/70">{banner.note}</p>
                  ) : null}
                  <ShopNowButton dark text={banner.buttonText} href={banner.buttonHref} />
                </div>
              </div>
            )
          }
          return (
            <div
              key={i}
              className="relative flex h-52 flex-col justify-center overflow-hidden rounded-2xl p-6 sm:p-8"
            >
              <Image
                src={banner.image || "/placeholder.svg"}
                alt={banner.title}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="relative z-10 max-w-[85%] rounded-xl p-4 sm:p-5 glass-order-card">
                <h3
                  className={`font-display text-xl sm:text-2xl font-bold tracking-wide ${
                    banner.dark ? "text-white" : "text-primary"
                  }`}
                >
                  {banner.title}
                </h3>
                {banner.highlight ? (
                  <p className="mt-1 font-display text-base font-bold text-gold">
                    {banner.highlight}
                  </p>
                ) : null}
                {banner.subtitle ? (
                  <p
                    className={`mt-1 text-xs sm:text-sm font-medium leading-snug ${
                      banner.dark ? "text-white/80" : "text-primary/80"
                    }`}
                  >
                    {banner.subtitle}
                  </p>
                ) : null}
                {banner.note ? (
                  <p
                    className={`mt-1.5 text-[9px] font-semibold tracking-widest ${
                      banner.dark ? "text-white/60" : "text-primary/60"
                    }`}
                  >
                    {banner.note}
                  </p>
                ) : null}
                <ShopNowButton dark={banner.dark} text={banner.buttonText} href={banner.buttonHref} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
