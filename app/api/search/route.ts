import { NextResponse } from "next/server"
import { getAllProducts } from "@/lib/products-db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get("q") ?? "").trim().toLowerCase()

  if (q.length < 2) {
    return NextResponse.json({ results: [], query: q })
  }

  const all = await getAllProducts()
  const terms = q.split(/\s+/).filter(Boolean)

  const scored = all
    .map((p) => {
      const name = p.name.toLowerCase()
      const category = (p.category ?? "").toLowerCase()
      const description = (p.description ?? "").toLowerCase()
      const haystack = `${name} ${category} ${description}`

      // Every term must appear somewhere for the product to match.
      const matchesAll = terms.every((t) => haystack.includes(t))
      if (!matchesAll) return null

      let score = 0
      if (name.startsWith(q)) score += 100
      if (name.includes(q)) score += 50
      if (category.includes(q)) score += 20
      for (const t of terms) {
        if (name.includes(t)) score += 10
        if (category.includes(t)) score += 5
        if (description.includes(t)) score += 2
      }
      return { product: p, score }
    })
    .filter((x): x is { product: (typeof all)[number]; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ product }) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice ?? null,
      image: product.image,
      category: product.category ?? null,
      badge: product.badge ?? null,
    }))

  return NextResponse.json({ results: scored, query: q })
}
