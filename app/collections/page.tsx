import Link from "next/link"
import Image from "next/image"
import { ChevronRight, ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBanner } from "@/components/page-banner"
import { collections } from "@/lib/products"
import { getCollectionProducts } from "@/lib/products-db"
import { buildMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"


export async function generateMetadata() {
  return await buildMetadata({
    title: "Collections — Curated Fashion Edits",
    description:
      "Explore IR Feel curated collections — new arrivals, sale picks, featured essentials and outerwear. Discover premium fashion grouped so you find your style faster.",
    path: "/collections",
  })
}

export default async function CollectionsPage() {
  const counts = await Promise.all(collections.map((c) => getCollectionProducts(c)))
  const countBySlug = new Map(collections.map((c, i) => [c.slug, counts[i].length]))
  return (
    <>
      <SiteHeader active="collection" />
      <main>
        {/* Page banner */}
        <PageBanner
          title="Collections"
          description="Curated edits of our best pieces, grouped so you find your style faster."
          tagline="Explore"
          backgroundImage="/images/banner-bg-shop.png"
        />

        {/* Breadcrumb */}
        <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs">
            <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-foreground">Collections</span>
          </nav>
        </div>

        {/* Collections grid */}
        <section className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {collections.map((collection) => {
              const count = countBySlug.get(collection.slug) ?? 0
              return (
                <Link
                  key={collection.slug}
                  href={`/collections/${collection.slug}`}
                  className="group relative flex aspect-[4/5] sm:aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl sm:rounded-3xl bg-muted"
                >
                  <Image
                    src={collection.image || "/placeholder.svg"}
                    alt={collection.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-4 sm:left-4 sm:right-4 z-10 rounded-lg sm:rounded-2xl border border-white/40 bg-white/30 p-2.5 sm:p-5 shadow-xl backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-black/30">
                    <p className="text-[7px] sm:text-[8px] font-semibold uppercase tracking-[0.25em] text-foreground/90">
                      {collection.tagline}
                    </p>
                    <h2 className="mt-0.5 sm:mt-1 font-display text-sm sm:text-base font-bold tracking-wide text-foreground">
                      {collection.title}
                    </h2>
                    <p className="hidden sm:block mt-1 max-w-sm text-[10px] leading-relaxed text-muted-foreground line-clamp-2">
                      {collection.description}
                    </p>
                    <span className="mt-2 sm:mt-3 inline-flex items-center gap-1.5 text-[7px] sm:text-[8px] font-semibold tracking-widest text-foreground">
                      SHOP {count} {count === 1 ? "ITEM" : "ITEMS"}
                      <ArrowRight className="h-2 sm:h-2.5 w-2 sm:w-2.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
