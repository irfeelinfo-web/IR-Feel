import { notFound } from "next/navigation"
import { getProductBySlug } from "@/lib/products-db"
import { ProductEditor } from "@/components/admin/editors/product-editor"
import type { ProductInput } from "@/app/admin/actions"

export const dynamic = "force-dynamic"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProductBySlug(id)
  if (!product) notFound()

  const initial: ProductInput = {
    id: product.id,
    name: product.name,
    price: product.price,
    oldPrice: product.oldPrice ?? null,
    image: product.image,
    badge: product.badge ?? null,
    category: product.category ?? null,
    colors: product.colors ?? [],
    sizes: product.sizes ?? [],
    description: product.description ?? "",
    images: product.images ?? [],
    rating: product.rating ?? 5,
    reviews: product.reviews ?? 0,
    inStock: product.inStock,
    featured: product.featured,
    newArrival: product.newArrival,
    sortOrder: product.sortOrder,
  }

  return <ProductEditor initial={initial} isNew={false} />
}
