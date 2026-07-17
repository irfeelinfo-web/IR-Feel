import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"
import { collections } from "@/lib/products"
import { getAllProducts } from "@/lib/products-db"
import { getHome } from "@/lib/content"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  
  let dynamicCategories: string[] = []
  try {
    const home = await getHome()
    dynamicCategories = home.categories.map((c: { title: string }) => c.title.toLowerCase())
  } catch {
    dynamicCategories = ["men", "women", "kids", "accessories"] // fallback
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/collections`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/our-stores`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/shipping-delivery`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/returns-exchanges`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = dynamicCategories.map((slug) => ({
    url: `${SITE_URL}/category/${slug.replace(/\s+/g, '-')}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${SITE_URL}/collections/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const products = await getAllProducts()
    productRoutes = products.map((p) => ({
      url: `${SITE_URL}/product/${p.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }))
  } catch {
    productRoutes = []
  }

  return [...staticRoutes, ...categoryRoutes, ...collectionRoutes, ...productRoutes]
}
