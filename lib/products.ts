// Types + pure helpers + collection metadata.
// All product DATA now lives in the database and is read via lib/products-db.ts.

export type Product = {
  id: string
  name: string
  price: number
  oldPrice?: number
  image: string
  badge?: "NEW" | "SALE"
  category?: ShopCategory
  colors?: string[]
  sizes?: string[]
  description?: string
  images?: string[]
  rating?: number
  reviews?: number
}

export type ShopCategory = "Men" | "Women" | "Kids" | "Accessories"

export const shopCategories: ShopCategory[] = ["Men", "Women", "Kids", "Accessories"]

export const shopColors = [
  { name: "Black", value: "#111111" },
  { name: "Gray", value: "#b9b9b9" },
  { name: "Beige", value: "#d8cbb4" },
  { name: "Olive", value: "#5a5f37" },
  { name: "White", value: "#f5f5f5" },
  { name: "Blue", value: "#4a5b78" },
]

export const shopSizes = ["S", "M", "L", "XL", "XXL"]

/** Format a number as Bangladeshi Taka. */
export function bdt(n: number) {
  return "৳ " + n.toLocaleString("en-IN")
}

export const defaultDescription =
  "Crafted from premium, high-quality materials for lasting comfort and everyday style. A versatile essential designed to fit effortlessly into your wardrobe."

export type DetailedProduct = Product & {
  description: string
  images: string[]
  rating: number
  reviews: number
  colors: string[]
  sizes: string[]
  inStock?: boolean
}

/** Fill in sensible defaults for the product detail page. */
export function withDetailDefaults(product: Product): DetailedProduct {
  const validImages = product.images?.filter(Boolean) || []
  return {
    ...product,
    description: product.description ?? defaultDescription,
    images: validImages.length > 0 ? validImages : (product.image ? [product.image] : []),
    rating: product.rating ?? 5,
    reviews: product.reviews ?? 0,
    colors: product.colors && product.colors.length > 0 ? product.colors : ["Black"],
    sizes: product.sizes && product.sizes.length > 0 ? product.sizes : ["S", "M", "L", "XL"],
  }
}

export type CollectionKind = "new" | "sale" | "featured" | "outerwear"

export type Collection = {
  slug: string
  kind: CollectionKind
  title: string
  tagline: string
  description: string
  image: string
}

export const collections: Collection[] = [
  {
    slug: "new-arrivals",
    kind: "new",
    title: "New Arrivals",
    tagline: "Fresh Drops",
    description: "The latest additions to our lineup — be the first to wear what's next.",
    image: "/images/product-bomber-jacket.png",
  },
  {
    slug: "sale",
    kind: "sale",
    title: "On Sale",
    tagline: "Limited Time",
    description: "Premium pieces at reduced prices. Grab your favorites before they're gone.",
    image: "/images/product-cargo-joggers.png",
  },
  {
    slug: "featured",
    kind: "featured",
    title: "Featured",
    tagline: "Curated Picks",
    description: "Our handpicked selection of standout essentials for the season.",
    image: "/images/product-hoodie-black.png",
  },
  {
    slug: "outerwear",
    kind: "outerwear",
    title: "Outerwear",
    tagline: "Layer Up",
    description: "Jackets and heavyweight layers built to keep you sharp and warm.",
    image: "/images/product-denim-jacket.png",
  },
]

export function getCollectionBySlug(slug: string) {
  return collections.find((c) => c.slug === slug) ?? null
}
