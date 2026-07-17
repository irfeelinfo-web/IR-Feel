import { ProductEditor } from "@/components/admin/editors/product-editor"
import type { ProductInput } from "@/app/admin/actions"

const emptyProduct: ProductInput = {
  id: "",
  name: "",
  price: 0,
  oldPrice: null,
  image: "",
  badge: null,
  category: null,
  colors: [],
  sizes: ["S", "M", "L", "XL"],
  description: "",
  images: [],
  rating: 5,
  reviews: 0,
  inStock: true,
  featured: false,
  newArrival: false,
  sortOrder: 0,
}

export default function NewProductPage() {
  return <ProductEditor initial={emptyProduct} isNew />
}
