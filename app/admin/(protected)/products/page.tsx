import { getAllProducts } from "@/lib/products-db"
import { ProductsList } from "@/components/admin/products-list"

export const dynamic = "force-dynamic"

export default async function AdminProductsPage() {
  const products = await getAllProducts()
  return <ProductsList products={products} />
}
