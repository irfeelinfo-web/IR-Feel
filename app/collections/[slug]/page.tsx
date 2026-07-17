import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductCard } from "@/components/product-card"
import { PageBanner } from "@/components/page-banner"
import { collections, getCollectionBySlug } from "@/lib/products"
import { getCollectionProducts } from "@/lib/products-db"
import { buildMetadata } from "@/lib/seo"


export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const collection = getCollectionBySlug(slug)
  if (!collection) return buildMetadata({ title: "Collection Not Found", noIndex: true })
  return buildMetadata({
    title: `${collection.title} — ${collection.tagline}`,
    description: collection.description,
    path: `/collections/${slug}`,
    images: [collection.image],
  })
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const collection = getCollectionBySlug(slug)

  if (!collection) notFound()

  const products = await getCollectionProducts(collection)

  return (
    <>
      <SiteHeader active="collection" />
      <main>
        {/* Collection banner */}
        <PageBanner
          title={collection.title}
          description={collection.description}
          tagline={collection.tagline}
          backgroundImage={collection.image}
        >
          <div className="relative h-28 w-28 sm:h-36 sm:w-36">
            <Image
              src={collection.image || "/placeholder.svg"}
              alt={`${collection.title} collection`}
              fill
              className="object-cover object-top"
              sizes="(max-width: 640px) 112px, 144px"
            />
          </div>
        </PageBanner>

        {/* Breadcrumb */}
        <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs">
            <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <Link
              href="/collections"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Collections
            </Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-foreground">{collection.title}</span>
          </nav>
        </div>

        {/* Products grid */}
        <section className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6">
          <p className="mb-6 text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} variant="featured" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-muted-foreground">No products in this collection yet.</p>
              <Link
                href="/shop"
                className="mt-4 inline-flex items-center bg-primary px-6 py-2.5 text-[11px] font-semibold tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
              >
                BROWSE ALL PRODUCTS
              </Link>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
