import { ProductCard } from "@/components/product-card"
import { SectionHeading } from "@/components/section-heading"
import { getNewArrivals } from "@/lib/products-db"

export async function NewArrivals({ heading, subheading }: { heading?: string; subheading?: string }) {
  const newArrivals = await getNewArrivals()
  if (newArrivals.length === 0) return null
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
      <SectionHeading>{heading || "NEW ARRIVALS"}</SectionHeading>
      {subheading && <p className="mt-2 text-center text-sm text-muted-foreground">{subheading}</p>}
      <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {newArrivals.slice(0, 5).map((product, i) => (
          <ProductCard key={product.id} product={product} variant="simple" priority={i < 5} />
        ))}
      </div>
    </section>
  )
}
