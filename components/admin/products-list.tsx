"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Loader2, Package, Search, X } from "lucide-react"
import { deleteProductAction } from "@/app/admin/actions"
import { bdt } from "@/lib/products"
import type { AdminProduct } from "@/lib/products-db"
import { PageTitle } from "@/components/admin/ui"
import { useToast } from "@/components/admin/toast-context"

type StockFilter = "all" | "in" | "out"

export function ProductsList({ products: initialProducts }: { products: AdminProduct[] }) {
  const router = useRouter()
  const toast = useToast()
  const [products, setProducts] = useState(initialProducts)

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [stock, setStock] = useState<StockFilter>("all")

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const p of products) if (p.category) set.add(p.category)
    return Array.from(set).sort()
  }, [products])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false
      if (category !== "all" && p.category !== category) return false
      if (stock === "in" && !p.inStock) return false
      if (stock === "out" && p.inStock) return false
      return true
    })
  }, [products, search, category, stock])

  const hasFilters = search.trim() !== "" || category !== "all" || stock !== "all"

  function clearFilters() {
    setSearch("")
    setCategory("all")
    setStock("all")
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    // Optimistic: remove from local list immediately
    const previousProducts = products
    setProducts((prev) => prev.filter((p) => p.id !== id))

    try {
      await deleteProductAction(id)
      toast.success("প্রোডাক্ট সফলভাবে মুছে ফেলা হয়েছে!")
      router.refresh()
    } catch (e) {
      console.error("[products-list] delete product error:", (e as Error).message)
      // Rollback on error
      setProducts(previousProducts)
      toast.error("প্রোডাক্ট মুছতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।")
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  const selectClass =
    "h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="প্রোডাক্ট" description="আপনার স্টোরের সব প্রোডাক্ট এখান থেকে ম্যানেজ করুন।" />
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> নতুন প্রোডাক্ট
        </Link>
      </div>

      {products.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="প্রোডাক্টের নাম দিয়ে সার্চ করুন..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none focus:border-foreground"
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
            <option value="all">সব ক্যাটাগরি</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select value={stock} onChange={(e) => setStock(e.target.value as StockFilter)} className={selectClass}>
            <option value="all">সব স্টক</option>
            <option value="in">স্টকে আছে</option>
            <option value="out">স্টক আউট</option>
          </select>
        </div>
      )}

      {products.length > 0 && (
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {filtered.length} / {products.length} প্রোডাক্ট
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 font-medium text-foreground hover:bg-muted"
            >
              <X className="h-3 w-3" /> ফিল্টার মুছুন
            </button>
          )}
        </div>
      )}

      {products.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Package className="h-10 w-10 text-muted-foreground" strokeWidth={1.4} />
          <p className="text-sm text-muted-foreground">এখনো কোনো প্রোডাক্ট নেই।</p>
          <Link
            href="/admin/products/new"
            className="mt-1 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            প্রথম প্রোডাক্ট যোগ করুন
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Search className="h-10 w-10 text-muted-foreground" strokeWidth={1.4} />
          <p className="text-sm text-muted-foreground">এই ফিল্টারে কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-1 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            ফিল্টার মুছুন
          </button>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <ul className="divide-y divide-border">
            {filtered.map((p) => (
              <li key={p.id} className={`flex items-center gap-4 p-4 transition-opacity ${deletingId === p.id ? "opacity-40" : ""}`}>
                <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image || "/placeholder.svg"} alt={p.name} className="h-full w-full object-cover object-top" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{p.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{bdt(p.price)}</span>
                    {p.category && <span className="rounded-full bg-muted px-2 py-0.5">{p.category}</span>}
                    {p.badge && <span className="rounded-full bg-muted px-2 py-0.5">{p.badge}</span>}
                    {!p.inStock && <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">স্টক আউট</span>}
                    {p.featured && <span className="rounded-full bg-muted px-2 py-0.5">ফিচার্ড</span>}
                  </div>
                </div>

                {confirmId === p.id ? (
                  <div className="flex items-center gap-2">
                    <span className="hidden text-xs text-muted-foreground sm:inline">নিশ্চিত?</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {deletingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      হ্যাঁ, মুছুন
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      বাতিল
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/products/${p.id}`}
                      aria-label="এডিট"
                      className="rounded-lg border border-border p-2 text-foreground transition-colors hover:bg-muted"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      aria-label="মুছুন"
                      onClick={() => setConfirmId(p.id)}
                      className="rounded-lg border border-border p-2 text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
