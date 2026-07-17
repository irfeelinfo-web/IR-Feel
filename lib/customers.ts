import "server-only"
import { query } from "@/lib/db"

export type CustomerRow = {
  id: number
  name: string
  phone: string
  email: string
  google_id: string | null
  avatar: string
  reward_points: number
  created_at: string
}

export function getAllCustomers(): CustomerRow[] {
  return query<CustomerRow>("SELECT * FROM customers ORDER BY created_at DESC")
}

export function getCustomerByPhone(phone: string): CustomerRow | undefined {
  return query<CustomerRow>("SELECT * FROM customers WHERE phone = ?", [phone])[0]
}

export function getCustomerCount(): number {
  const row = query<{ c: number }>("SELECT COUNT(*) as c FROM customers")
  return row[0]?.c ?? 0
}
