"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type CustomerData = {
  id: number
  name: string
  phone: string
  email: string
  address: string
  city: string
  avatar: string
  google_id: string | null
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
  initial,
}: {
  children: ReactNode
  initial: CustomerData
}) {
  const [customer, setCustomer] = useState<CustomerData>(initial)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me")
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