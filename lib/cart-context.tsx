"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

export type CartItem = {
  id: string
  name: string
  price: number
  image: string
  size: string
  color: string
  qty: number
}

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void
  removeItem: (id: string, size: string, color: string) => void
  updateQty: (id: string, size: string, color: string, qty: number) => void
  clear: () => void
  deliveryLocation: "inside" | "outside"
  setDeliveryLocation: (location: "inside" | "outside") => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = "fashion-cart"

function lineKey(id: string, size: string, color: string) {
  return `${id}__${size}__${color}`
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [deliveryLocation, setDeliveryLocation] = useState<"inside" | "outside">("inside")

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  // Load persisted cart + delivery location on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
      const loc = localStorage.getItem("cart_delivery_location")
      if (loc === "inside" || loc === "outside") setDeliveryLocation(loc)
    } catch {
      // ignore malformed storage
    }
    setHydrated(true)
  }, [])

  // Persist cart whenever it changes (after initial hydration).
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore quota errors
    }
  }, [items, hydrated])

  // Persist delivery location.
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem("cart_delivery_location", deliveryLocation)
    } catch {}
  }, [deliveryLocation, hydrated])

  const addItem = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const key = lineKey(item.id, item.size, item.color)
      const existing = prev.find((i) => lineKey(i.id, i.size, i.color) === key)
      if (existing) {
        return prev.map((i) =>
          lineKey(i.id, i.size, i.color) === key ? { ...i, qty: i.qty + qty } : i,
        )
      }
      return [...prev, { ...item, qty }]
    })
  }, [])

  const removeItem = useCallback((id: string, size: string, color: string) => {
    const key = lineKey(id, size, color)
    setItems((prev) => prev.filter((i) => lineKey(i.id, i.size, i.color) !== key))
  }, [])

  const updateQty = useCallback((id: string, size: string, color: string, qty: number) => {
    const key = lineKey(id, size, color)
    setItems((prev) =>
      prev.map((i) => (lineKey(i.id, i.size, i.color) === key ? { ...i, qty: Math.max(1, qty) } : i)),
    )
  }, [])

  const clear = useCallback(() => {
    setItems([])
    setDeliveryLocation("inside")
  }, [])

  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => sum + i.price * i.qty, 0)
  }, [items])

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0)
    return {
      items,
      count,
      subtotal,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      updateQty,
      clear,
      deliveryLocation,
      setDeliveryLocation,
    }
  }, [items, isOpen, subtotal, deliveryLocation, openCart, closeCart, addItem, removeItem, updateQty, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within a CartProvider")
  return ctx
}