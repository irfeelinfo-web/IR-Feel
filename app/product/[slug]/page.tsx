import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ImageGallery } from "@/components/product/image-gallery"
import { ProductInfo } from "@/components/product/product-info"
import { ProductTabs } from "@/components/product/product-tabs"
import { RelatedProducts } from "@/components/product/related-products"
import { getDetailedProduct, getRelatedProducts, getAllProductIds } from "@/lib/products-db"
import { buildMetadata } from "@/lib/seo"
import { JsonLd } from "@/components/json-ld"
import { getSettings } from "@/lib/content"
import { SITE_URL, absoluteUrl, BRAND_NAME } from "@/lib/seo"

export const dynamic = "force-dynamic"


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getDetailedProduct(slug)
  if (!product) return buildMetadata({ title: "Product Not Found", noIndex: true })
  const desc =
    product.description ||
    `Shop the ${product.name} from ${BRAND_NAME}. Premium quality, designed to elevate your everyday style.`
  return buildMetadata({
    title: product.name,
    description: desc.length > 160 ? `${desc.slice(0, 157)}...` : desc,
    path: `/product/${slug}`,
    images: product.images?.length ? product.images : [product.image],
  })
}

export async function generateStaticParams() {
  const ids = await getAllProductIds()
  return ids.map((slug) => ({ slug }))
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getDetailedProduct(slug)
  if (!product) notFound()

  const settings = await getSettings()

  const related = await getRelatedProducts(product.id, product.category)

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : undefined

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    ...(product.category
      ? [{ label: product.category, href: `/category/${product.category.toLowerCase()}` }]
      : []),
    { label: product.name, href: "" },
  ]

  const productImages = (product.images?.length ? product.images : [product.image]).map((i) =>
    absoluteUrl(i),
  )

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: productImages,
    description: product.description,
    sku: product.id,
    brand: { "@type": "Brand", name: BRAND_NAME },
    ...(product.category ? { category: product.category } : {}),
    ...(product.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviews || 1,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${slug}`),
      priceCurrency: "BDT",
      price: product.price,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: BRAND_NAME },
    },
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Shop", item: absoluteUrl("/shop") },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: product.category,
              item: absoluteUrl(`/category/${product.category.toLowerCase()}`),
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: product.category ? 4 : 3,
        name: product.name,
        item: absoluteUrl(`/product/${slug}`),
      },
    ],
  }

  return (
    <>
      <JsonLd data={[productLd, breadcrumbLd]} />
      <SiteHeader active="shop" />
      <main>
        {/* Breadcrumb */}
        <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                {i < crumbs.length - 1 ? (
                  <Link href={c.href} className="text-muted-foreground transition-colors hover:text-foreground">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Main product */}
        <section className="mx-auto max-w-[1280px] px-4 pb-8 sm:px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
            <ImageGallery
              images={product.images}
              discount={discount}
              isNew={product.badge === "NEW"}
            />
            <ProductInfo product={product} settings={settings} />
          </div>
        </section>

        <ProductTabs description={product.description} />
        <RelatedProducts products={related} currentId={product.id} />
      </main>
      <SiteFooter />
    </>
  )
}
