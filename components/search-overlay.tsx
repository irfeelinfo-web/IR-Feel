"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Loader2, ArrowRight, TrendingUp } from "lucide-react"
import { bdt } from "@/lib/products"

type SearchResult = {
  id: string
  name: string
  price: number
  oldPrice: number | null
  image: string
  category: string | null
  badge: string | null
}

const POPULAR = ["হুডি", "জ্যাকেট", "ডেনিম", "Men", "Women", "Accessories"]

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Focus the input and lock scroll when the overlay opens.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 60)
      document.body.style.overflow = "hidden"
      return () => {
        clearTimeout(t)
        document.body.style.overflow = ""
      }
    }
  }, [open])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  // Reset state when closed.
  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
      setSearched(false)
      setLoading(false)
    }
  }, [open])

  // Debounced live search.
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setSearched(false)
      setLoading(false)
      return
    }
    setLoading(true)
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        })
        const data = await res.json()
        setResults(data.results ?? [])
        setSearched(true)
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setResults([])
          setSearched(true)
        }
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const goToShop = useCallback(
    (term: string) => {
      const q = term.trim()
      if (!q) return
      onClose()
      router.push(`/shop?q=${encodeURIComponent(q)}`)
    },
    [onClose, router],
  )

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    goToShop(query)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <button
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200"
      />

      {/* Panel */}
      <div className="relative mx-auto mt-0 w-full max-w-[1280px] animate-in slide-in-from-top-4 fade-in duration-300">
        <div className="mx-2 mt-2 overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl sm:mx-4 sm:mt-4">
          {/* Input row */}
          <form onSubmit={onSubmit} className="flex items-center gap-3 border-b border-border/50 px-4 py-4 sm:px-6">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="পণ্য, ক্যাটাগরি খুঁজুন..."
              className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-lg"
              autoComplete="off"
              enterKeyHint="search"
            />
            {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </form>

          {/* Body */}
          <div className="max-h-[70vh] overflow-y-auto">
            {/* Empty / prompt state */}
            {query.trim().length < 2 && (
              <div className="px-4 py-6 sm:px-6">
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" /> জনপ্রিয় সার্চ
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map((term) => (
                    <button
                      key={term}
                      onClick={() => goToShop(term)}
                      className="rounded-full border border-border bg-muted/40 px-4 py-1.5 text-sm text-foreground transition-colors hover:border-foreground hover:bg-muted"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {query.trim().length >= 2 && results.length > 0 && (
              <ul className="divide-y divide-border/40">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/product/${p.id}`}
                      onClick={onClose}
                      className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50 sm:px-6"
                    >
                      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={p.image || "/placeholder.svg"}
                          alt={p.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                        {p.category && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{p.category}</p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-foreground">{bdt(p.price)}</p>
                        {p.oldPrice && (
                          <p className="text-xs text-muted-foreground line-through">{bdt(p.oldPrice)}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => goToShop(query)}
                    className="flex w-full items-center justify-center gap-2 px-4 py-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
                  >
                    &ldquo;{query.trim()}&rdquo; এর সব ফলাফল দেখুন
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </li>
              </ul>
            )}

            {/* No results */}
            {query.trim().length >= 2 && !loading && searched && results.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-medium text-foreground">
                  &ldquo;{query.trim()}&rdquo; এর জন্য কোনো পণ্য পাওয়া যায়নি
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                   ভিন্ন কীওয়ার্ড ব্যবহার করুন অথবা সম্পূর্ণ শপ ব্রাউজ করুন।
                </p>
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                   সব পণ্য দেখুন
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
