import { Package } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { TrackOrderForm } from "./track-order-form"
import { buildMetadata } from "@/lib/seo"
import { getPages } from "@/lib/content"

export const dynamic = "force-dynamic"


export async function generateMetadata() {
  return await buildMetadata({
    title: "Track Order",
    description: "Track your IR Feel order status.",
    path: "/track-order",
  })
}

export default async function TrackOrderPage() {
  const pages = await getPages()

  return (
    <>
      <SiteHeader />
      <main className="bg-background min-h-[60vh]">
        <section className="relative border-b border-border/40 bg-card/30 backdrop-blur-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] to-transparent pointer-events-none" />
          <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/10 blur-[60px]" />
          <div className="absolute -right-20 top-0 h-48 w-48 rounded-full bg-pink-500/10 blur-[60px]" />
          
          <div className="relative z-10 mx-auto max-w-[1280px] px-4 py-6 text-center sm:px-6 sm:py-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gold shadow-[0_0_15px_rgba(212,175,55,0.15)]">
              <Package className="h-3 w-3" />
              Track Your Package
            </span>
            <h1 className="mx-auto mt-3 max-w-2xl text-balance text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl lg:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
              {pages.trackOrderTitle || "Track Order"}
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-pretty text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {pages.trackOrderIntro || "Enter your Order ID and Phone Number to check the current status of your shipment."}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <TrackOrderForm />
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
