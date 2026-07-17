import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBanner } from "@/components/page-banner"
import { WishlistContent } from "@/components/wishlist/wishlist-content"
import { buildMetadata } from "@/lib/seo"

export async function generateMetadata() {
  return await buildMetadata({
    title: "My Wishlist",
    description: "View and manage the products you've saved to your IR Feel wishlist.",
    path: "/wishlist",
  })
}

const crumbs = ["Home", "Wishlist"]

export default function WishlistPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Page banner */}
        <PageBanner
          title="Wishlist"
          description="Your hand-picked favourites, all in one place."
          backgroundImage="/images/banner-bg-wishlist.png"
        />

        {/* Breadcrumb */}
        <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs">
            {crumbs.map((c, i) => (
              <span key={c} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                {i < crumbs.length - 1 ? (
                  <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
                    {c}
                  </Link>
                ) : (
                  <span className="text-foreground">{c}</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Wishlist grid */}
        <section className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6">
          <WishlistContent />
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
