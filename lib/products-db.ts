import "server-only"
import { cache } from "react"
import { query, getOne, run } from "./db"
import type { Product, Collection, DetailedProduct } from "./products"
import { withDetailDefaults } from "./products"

export type ProductRow = {
  id: string
  name: string
  price: number
  old_price: number | null
  image: string
  badge: string | null
  category: string | null
  colors: string
  sizes: string
  description: string | null
  images: string
  rating: number
  reviews: number
  in_stock: number
  featured: number
  new_arrival: number
  sort_order: number
}

export type AdminProduct = Product & {
  inStock: boolean
  featured: boolean
  newArrival: boolean
  sortOrder: number
}

function rowToProduct(r: ProductRow): AdminProduct {
  return {
    id: r.id,
    name: r.name,
    price: r.price,
    oldPrice: r.old_price ?? undefined,
    image: r.image,
    badge: (r.badge as Product["badge"]) ?? undefined,
    category: (r.category as Product["category"]) ?? undefined,
    colors: JSON.parse(r.colors || "[]"),
    sizes: JSON.parse(r.sizes || "[]"),
    description: r.description ?? undefined,
    images: JSON.parse(r.images || "[]"),
    rating: r.rating,
    reviews: r.reviews,
    inStock: !!r.in_stock,
    featured: !!r.featured,
    newArrival: !!r.new_arrival,
    sortOrder: r.sort_order,
  }
}

/* ── Static fallback products (seeded into DB on first run) ── */
const img = (n: string) => `/images/${n}.png`

const fallbackProducts: AdminProduct[] = [
  {
    id: "premium-black-hoodie", name: "প্রিমিয়াম ব্ল্যাক হুডি", price: 1650, oldPrice: 2200,
    image: img("product-hoodie-black"), badge: "SALE", category: "Men",
    colors: ["Black", "Gray"], sizes: ["S", "M", "L", "XL", "XXL"],
    description: "নরম ফ্লিস কটন দিয়ে তৈরি প্রিমিয়াম হুডি — শীত ও ক্যাজুয়াল দুই সময়ের জন্য পারফেক্ট।",
    images: [img("product-hoodie-black"), img("hoodie-side"), img("hoodie-back"), img("hoodie-detail")],
    rating: 5, reviews: 128, inStock: true, featured: true, newArrival: true, sortOrder: 1,
  },
  {
    id: "olive-fleece-hoodie", name: "অলিভ ফ্লিস হুডি", price: 1750,
    image: img("product-hoodie-olive"), badge: "NEW", category: "Men",
    colors: ["Olive", "Black"], sizes: ["M", "L", "XL", "XXL"],
    description: "হেভিওয়েট ফ্লিস অলিভ হুডি, আরামদায়ক ফিট এবং টেকসই কাপড়।",
    images: [img("product-hoodie-olive")], rating: 5, reviews: 74, inStock: true, featured: true, newArrival: true, sortOrder: 2,
  },
  {
    id: "printed-graphic-hoodie", name: "প্রিন্টেড গ্রাফিক হুডি", price: 1850,
    image: img("product-printed-hoodie"), badge: "NEW", category: "Men",
    colors: ["Black", "Gray"], sizes: ["S", "M", "L", "XL"],
    description: "ট্রেন্ডি গ্রাফিক প্রিন্ট হুডি — স্টাইলিশ স্ট্রিটওয়্যার লুকের জন্য।",
    images: [img("product-printed-hoodie")], rating: 4.8, reviews: 51, inStock: true, featured: false, newArrival: true, sortOrder: 3,
  },
  {
    id: "classic-sweatshirt", name: "ক্লাসিক সোয়েটশার্ট", price: 1350,
    image: img("product-sweatshirt"), category: "Men",
    colors: ["Beige", "Gray"], sizes: ["S", "M", "L", "XL"],
    description: "মিনিমাল ক্লাসিক সোয়েটশার্ট, প্রতিদিনের ব্যবহারের জন্য আদর্শ।",
    images: [img("product-sweatshirt")], rating: 4.7, reviews: 39, inStock: true, featured: true, newArrival: false, sortOrder: 4,
  },
  {
    id: "bomber-jacket", name: "বোম্বার জ্যাকেট", price: 2650, oldPrice: 3200,
    image: img("product-bomber-jacket"), badge: "SALE", category: "Men",
    colors: ["Black", "Olive"], sizes: ["M", "L", "XL", "XXL"],
    description: "স্টাইলিশ বোম্বার জ্যাকেট — উইন্ডপ্রুফ এবং প্রিমিয়াম ফিনিশিং।",
    images: [img("product-bomber-jacket")], rating: 5, reviews: 88, inStock: true, featured: true, newArrival: false, sortOrder: 5,
  },
  {
    id: "denim-jacket", name: "ডেনিম জ্যাকেট", price: 2450,
    image: img("product-denim-jacket"), badge: "NEW", category: "Men",
    colors: ["Blue"], sizes: ["S", "M", "L", "XL"],
    description: "ক্লাসিক ডেনিম জ্যাকেট — সব সিজনে মানানসই টাইমলেস স্টাইল।",
    images: [img("product-denim-jacket")], rating: 4.9, reviews: 62, inStock: true, featured: false, newArrival: true, sortOrder: 6,
  },
  {
    id: "cargo-joggers", name: "কার্গো জগার্স", price: 1450,
    image: img("product-cargo-joggers"), category: "Men",
    colors: ["Black", "Olive", "Beige"], sizes: ["S", "M", "L", "XL", "XXL"],
    description: "আরামদায়ক কার্গো জগার্স — একাধিক পকেট ও স্ট্রেচি ফ্যাব্রিক।",
    images: [img("product-cargo-joggers")], rating: 4.8, reviews: 45, inStock: true, featured: true, newArrival: false, sortOrder: 7,
  },
  {
    id: "slim-fit-jeans", name: "স্লিম ফিট জিন্স", price: 1650,
    image: img("product-jeans"), category: "Men",
    colors: ["Blue", "Black"], sizes: ["S", "M", "L", "XL"],
    description: "প্রিমিয়াম স্লিম ফিট জিন্স — স্ট্রেচেবল ও টেকসই ডেনিম।",
    images: [img("product-jeans")], rating: 4.7, reviews: 71, inStock: true, featured: false, newArrival: false, sortOrder: 8,
  },
  {
    id: "classic-polo", name: "ক্লাসিক পোলো শার্ট", price: 950,
    image: img("product-polo"), category: "Men",
    colors: ["White", "Black", "Blue"], sizes: ["S", "M", "L", "XL", "XXL"],
    description: "প্রিমিয়াম কটন পোলো শার্ট — অফিস ও ক্যাজুয়াল উভয় লুকের জন্য।",
    images: [img("product-polo")], rating: 4.8, reviews: 96, inStock: true, featured: true, newArrival: false, sortOrder: 9,
  },
  {
    id: "striped-shirt", name: "স্ট্রাইপড শার্ট", price: 1150,
    image: img("product-striped-shirt"), badge: "NEW", category: "Men",
    colors: ["White", "Blue"], sizes: ["S", "M", "L", "XL"],
    description: "স্টাইলিশ স্ট্রাইপড শার্ট — হালকা ও শ্বাসপ্রশ্বাসযোগ্য কাপড়।",
    images: [img("product-striped-shirt")], rating: 4.6, reviews: 33, inStock: true, featured: false, newArrival: true, sortOrder: 10,
  },
  {
    id: "essential-tshirt", name: "এসেনশিয়াল টি-শার্ট", price: 650,
    image: img("product-tshirt"), category: "Men",
    colors: ["Black", "White", "Gray", "Olive"], sizes: ["S", "M", "L", "XL", "XXL"],
    description: "১০০% কটন এসেনশিয়াল টি-শার্ট — প্রতিদিনের আরামের জন্য।",
    images: [img("product-tshirt")], rating: 4.9, reviews: 210, inStock: true, featured: true, newArrival: false, sortOrder: 11,
  },
  {
    id: "classic-cap", name: "ক্লাসিক ক্যাপ", price: 450,
    image: img("product-cap"), category: "Accessories",
    colors: ["Black", "Beige"], sizes: [],
    description: "অ্যাডজাস্টেবল ক্লাসিক ক্যাপ — যেকোনো আউটফিটের সাথে মানানসই।",
    images: [img("product-cap")], rating: 4.7, reviews: 58, inStock: true, featured: false, newArrival: true, sortOrder: 12,
  },
]

const globalAny = global as any
if (typeof globalAny.isSeeded === "undefined") {
  globalAny.isSeeded = false
}

/** Seed fallback products into the database if it's empty */
async function ensureSeeded() {
  if (globalAny.isSeeded) return
  const count = await getOne<{ c: number }>("SELECT COUNT(*) as c FROM products")
  if (count && count.c > 0) {
    globalAny.isSeeded = true
    return
  }
  for (const p of fallbackProducts) {
    await run(
      `INSERT OR IGNORE INTO products (id, name, price, old_price, image, badge, category, colors, sizes, description, images, rating, reviews, in_stock, featured, new_arrival, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id, p.name, p.price, p.oldPrice ?? null, p.image, p.badge || null, p.category || null,
        JSON.stringify(p.colors), JSON.stringify(p.sizes), p.description || null, JSON.stringify(p.images),
        p.rating, p.reviews, p.inStock ? 1 : 0, p.featured ? 1 : 0, p.newArrival ? 1 : 0, p.sortOrder,
      ],
    )
  }
  globalAny.isSeeded = true
}

export const getAllProducts = cache(async (): Promise<AdminProduct[]> => {
  try {
    await ensureSeeded()
    const rows = await query<ProductRow>("SELECT * FROM products ORDER BY sort_order ASC, created_at ASC")
    return rows.map(rowToProduct)
  } catch {
    // DB unreachable — return built-in fallback products so the site still renders
    return fallbackProducts
  }
})

export async function getProductBySlug(id: string): Promise<AdminProduct | null> {
  try {
    await ensureSeeded()
    const row = await getOne<ProductRow>("SELECT * FROM products WHERE id = ?", [id])
    return row ? rowToProduct(row) : null
  } catch {
    // DB unreachable — try fallback products
    return fallbackProducts.find((p) => p.id === id) ?? null
  }
}

export async function getFeaturedProducts(): Promise<AdminProduct[]> {
  const all = await getAllProducts()
  const feat = all.filter((p) => p.featured)
  return (feat.length ? feat : all).slice(0, 8)
}

export async function getNewArrivals(): Promise<AdminProduct[]> {
  const all = await getAllProducts()
  const na = all.filter((p) => p.newArrival || p.badge === "NEW")
  return (na.length ? na : all).slice(0, 8)
}

export async function getProductsByCategory(category: string): Promise<AdminProduct[]> {
  const all = await getAllProducts()
  return all.filter((p) => (p.category ?? "").toLowerCase() === category.toLowerCase())
}

export async function getDetailedProduct(id: string): Promise<DetailedProduct | null> {
  const product = await getProductBySlug(id)
  return product ? withDetailDefaults(product) : null
}

/** All product ids — used for generateStaticParams. */
export async function getAllProductIds(): Promise<string[]> {
  const all = await getAllProducts()
  return all.map((p) => p.id)
}

/** Filter products for a collection based on its kind. */
export async function getCollectionProducts(collection: Collection): Promise<AdminProduct[]> {
  const all = await getAllProducts()
  switch (collection.kind) {
    case "new":
      return all.filter((p) => p.newArrival || p.badge === "NEW")
    case "sale":
      return all.filter((p) => p.badge === "SALE" || typeof p.oldPrice === "number")
    case "featured":
      return all.filter((p) => p.featured)
    case "outerwear":
      return all.filter((p) => /jacket|hoodie|sweatshirt|sweater/i.test(p.name))
    default:
      return all
  }
}

/** Related products for a detail page: same category first, then fill from the rest. */
export async function getRelatedProducts(currentId: string, category?: string): Promise<AdminProduct[]> {
  const all = await getAllProducts()
  const others = all.filter((p) => p.id !== currentId)
  const sameCat = category ? others.filter((p) => p.category === category) : []
  const rest = others.filter((p) => !sameCat.includes(p))
  return [...sameCat, ...rest].slice(0, 8)
}
