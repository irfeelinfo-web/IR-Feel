"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

export type CustomerData = {
  id: number
  name: string
  phone: string
  email: string
  address: string
  city: string
  avatar: string
  google_id: string | null
  reward_points: number
} | null

type CustomerContextType = {
  customer: CustomerData
  setCustomer: (c: CustomerData) => void
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const CustomerContext = createContext<CustomerContextType>({
  customer: null,
  setCustomer: () => {},
  refresh: async () => {},
  logout: async () => {},
})

export function useCustomer() {
  return useContext(CustomerContext)
}

export function CustomerProvider({
  children,
  initial = null,
}: {
  children: ReactNode
  initial?: CustomerData
}) {
  const [customer, setCustomer] = useState<CustomerData>(initial)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/me")
      if (res.ok) {
        const data = await res.json()
        setCustomer(data.customer || null)
      } else {
        setCustomer(null)
      }
    } catch {
      setCustomer(null)
    }
  }, [])

  // Auto-fetch customer on mount when no server-side initial data provided
  useEffect(() => {
    if (!initial) {
      refresh()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setCustomer(null)
    } catch {
      // Still clear client state even if server fails
      setCustomer(null)
    }
  }, [])

  return (
    <CustomerContext.Provider value={{ customer, setCustomer, refresh, logout }}>
      {children}
    </CustomerContext.Provider>
  )
}

