"use client"

import { useMemo, useState } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import type { Product, ShopCategory } from "@/lib/products"
import { ProductCard } from "@/components/product-card"
import { FilterSidebar, type ShopFilters } from "@/components/shop/filter-sidebar"
import { useSearchParams } from "next/navigation"

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Alphabetical" },
] as const

type SortValue = (typeof sortOptions)[number]["value"]

export function ShopContent({
  products = [],
  lockedCategory,
}: {
  products?: Product[]
  lockedCategory?: ShopCategory
}) {
  const searchParams = useSearchParams()
  const searchQuery = searchParams?.get("q") || ""
  const PRICE_CEILING = useMemo(
    () => Math.max(100, ...products.map((p) => p.price)),
    [products],
  )

  const emptyFilters: ShopFilters = useMemo(
    () => ({ categories: [], colors: [], sizes: [], maxPrice: PRICE_CEILING }),
    [PRICE_CEILING],
  )

  const [filters, setFilters] = useState<ShopFilters>(emptyFilters)
  const [sort, setSort] = useState<SortValue>("featured")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 12

  const base = useMemo(() => {
    let list = lockedCategory ? products.filter((p) => p.category === lockedCategory) : products
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      const terms = q.split(/\s+/).filter(Boolean)
      list = list.filter((p) => {
        const haystack = `${p.name} ${p.category ?? ""} ${p.description ?? ""}`.toLowerCase()
        return terms.every((t) => haystack.includes(t))
      })
    }
    return list
  }, [lockedCategory, products, searchQuery])

  const filtered = useMemo(() => {
    const result = base.filter((p) => {
      if (filters.categories.length && (!p.category || !filters.categories.includes(p.category))) return false
      if (filters.colors.length && !p.colors?.some((c) => filters.colors.includes(c))) return false
      if (filters.sizes.length && !p.sizes?.some((s) => filters.sizes.includes(s))) return false
      if (p.price > filters.maxPrice) return false
      return true
    })

    switch (sort) {
      case "price-asc":
        return [...result].sort((a, b) => a.price - b.price)
      case "price-desc":
        return [...result].sort((a, b) => b.price - a.price)
      case "name":
        return [...result].sort((a, b) => a.name.localeCompare(b.name))
      default:
        return result
    }
  }, [base, filters, sort])

  // Reset page when filters/sort changes
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paginatedProducts = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  // Reset to page 1 when filters change
  const filterKey = JSON.stringify(filters) + sort + searchQuery
  useMemo(() => { setPage(1) }, [filterKey])

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(emptyFilters)}
          priceCeiling={PRICE_CEILING}
          hideCategory={!!lockedCategory}
        />
      </div>

      <div>
        {searchQuery && (
          <div className="mb-6 rounded-md bg-secondary px-4 py-3 text-sm text-foreground">
            Showing results for <strong>&quot;{searchQuery}&quot;</strong>
          </div>
        )}
        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 border border-border px-4 py-2 text-xs font-semibold tracking-wide text-foreground lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            FILTERS
          </button>
          <p className="hidden text-sm text-muted-foreground lg:block">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> products
          </p>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
              className="border border-border bg-background px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3">
              {paginatedProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} variant="featured" priority={i < 4} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => { setPage(Math.max(1, safePage - 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                  disabled={safePage <= 1}
                  className="rounded-md border border-border px-4 py-2 text-xs font-semibold tracking-wide text-foreground transition-colors hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                    className={`flex h-9 w-9 items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                      p === safePage
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-foreground hover:bg-secondary"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => { setPage(Math.min(totalPages, safePage + 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                  disabled={safePage >= totalPages}
                  className="rounded-md border border-border px-4 py-2 text-xs font-semibold tracking-wide text-foreground transition-colors hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-display text-lg font-bold text-foreground">No products found</p>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters.</p>
            <button
              onClick={() => setFilters(emptyFilters)}
              className="mt-6 bg-primary px-6 py-3 text-xs font-semibold tracking-widest text-primary-foreground"
            >
              CLEAR FILTERS
            </button>
          </div>
        )}
      </div>

      {/* Mobile filter drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full w-[300px] max-w-[85vw] overflow-y-auto bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-end">
              <button onClick={() => setMobileOpen(false)} aria-label="Close filters">
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(emptyFilters)}
              priceCeiling={PRICE_CEILING}
              hideCategory={!!lockedCategory}
            />
            <button
              onClick={() => setMobileOpen(false)}
              className="mt-6 w-full bg-primary py-3 text-xs font-semibold tracking-widest text-primary-foreground"
            >
              VIEW {filtered.length} RESULTS
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
