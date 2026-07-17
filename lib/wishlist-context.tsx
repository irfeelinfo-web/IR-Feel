"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type WishlistItem = {
  id: string
  name: string
  price: number
  oldPrice?: number
  image: string
}

type WishlistContextValue = {
  items: WishlistItem[]
  count: number
  has: (id: string) => boolean
  toggle: (item: WishlistItem) => void
  add: (item: WishlistItem) => void
  remove: (id: string) => void
  clear: () => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

const STORAGE_KEY = "fashion-wishlist"

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Load persisted wishlist on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {
      // ignore malformed storage
    }
    setHydrated(true)
  }, [])

  // Persist wishlist whenever it changes (after initial hydration).
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore quota errors
    }
  }, [items, hydrated])

  function add(item: WishlistItem) {
    setItems((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]))
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function toggle(item: WishlistItem) {
    setItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item],
    )
  }

  function clear() {
    setItems([])
  }

  const value = useMemo<WishlistContextValue>(() => {
    const has = (id: string) => items.some((i) => i.id === id)
    return { items, count: items.length, has, toggle, add, remove, clear }
  }, [items])

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider")
  return ctx
}