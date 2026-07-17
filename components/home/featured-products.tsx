import { ProductCard } from "@/components/product-card"
import { SectionHeading } from "@/components/section-heading"
import { getFeaturedProducts } from "@/lib/products-db"

export async function FeaturedProducts({ heading, subheading }: { heading?: string; subheading?: string }) {
  const featuredProducts = await getFeaturedProducts()
  if (featuredProducts.length === 0) return null
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
      <SectionHeading>{heading || "FEATURED PRODUCTS"}</SectionHeading>
      {subheading && <p className="mt-2 text-center text-sm text-muted-foreground">{subheading}</p>}
      <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
        {featuredProducts.slice(0, 5).map((product, i) => (
          <ProductCard key={product.id} product={product} variant="featured" priority={i < 5} />
        ))}
      </div>
    </section>
  )
}
