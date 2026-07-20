import { Suspense } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { PageBanner } from "@/components/page-banner"
import { SiteFooter } from "@/components/site-footer"
import { ShopContent } from "@/components/shop/shop-content"
import { getAllProducts } from "@/lib/products-db"
import { buildMetadata } from "@/lib/seo"

export const revalidate = 60


export async function generateMetadata() {
  return await buildMetadata({
    title: "Shop All — Premium Clothing & Accessories",
    description:
      "Browse the full IR Feel collection of premium hoodies, jackets, denim and accessories for men, women and kids. Free shipping on orders over ৳ 999 across Bangladesh.",
    path: "/shop",
  })
}

const crumbs = ["Home", "Shop"]

export default async function ShopPage() {
  const products = await getAllProducts()
  return (
    <>
      <SiteHeader active="shop" />
      <main>
        <PageBanner
          title="Shop"
          description="Discover premium quality fashion designed for your lifestyle."
          plain={true}
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

        {/* Shop grid + filters */}
        <section className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6">
          <Suspense fallback={<div className="py-20 text-center font-semibold">Loading...</div>}>
            <ShopContent products={products} />
          </Suspense>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
