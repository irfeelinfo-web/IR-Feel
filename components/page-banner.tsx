import React from "react"
import Image from "next/image"

export function PageBanner({
  title,
  description,
  tagline,
  backgroundImage,
  plain = false,
  headingLevel = "h1",
  children,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  tagline?: string
  backgroundImage?: string
  plain?: boolean
  headingLevel?: "h1" | "h2" | "h3"
  children?: React.ReactNode
}) {
  const Heading = headingLevel || "h1"
  return (
    <section
      className={`relative overflow-hidden select-none transition-all duration-300 ${
        plain
          ? "bg-transparent border-none py-6 sm:py-8"
          : "border-b border-border/40 bg-secondary/15 py-10 sm:py-14"
      }`}
    >
      {/* Background Effect Image */}
      {!plain && backgroundImage && (
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src={backgroundImage}
            alt=""
            fill
            priority
            className="object-cover opacity-60 dark:opacity-35 transition-opacity duration-300"
          />
          {/* subtle gradient overlays for perfect contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/45 to-background" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-background/30" />
        </div>
      )}

      {!plain && !backgroundImage && (
        <>
          {/* Colorful blurred iOS-style wallpaper blobs behind the glass */}
          <div className="absolute top-1/2 left-[20%] -translate-y-1/2 w-64 h-64 rounded-full bg-gold/15 blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-[15%] -translate-y-1/2 w-80 h-80 rounded-full bg-primary/10 dark:bg-primary/20 blur-3xl pointer-events-none" />
        </>
      )}
      
      <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6">
        {/* The Frosted Glass Banner Card */}
        <div className="mx-auto max-w-4xl rounded-3xl backdrop-blur-xl bg-white/45 dark:bg-black/25 border border-black/5 dark:border-white/10 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.005] hover:border-gold/30">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:text-left">
            <div className="flex-1 text-center md:text-left">
              {tagline && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                  {tagline}
                </p>
              )}
              <Heading className="font-display text-2xl font-extrabold uppercase tracking-wider text-foreground sm:text-3xl md:text-4xl">
                {title}
              </Heading>
              {description && (
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:mx-0">
                  {description}
                </p>
              )}
            </div>
            {children && (
              <div className="relative shrink-0 overflow-hidden rounded-full border-4 border-black/5 dark:border-white/10 shadow-sm bg-muted/30">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
