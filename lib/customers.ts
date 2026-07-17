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

export async function getAllCustomers(): Promise<CustomerRow[]> {
  return query<CustomerRow>("SELECT * FROM customers ORDER BY created_at DESC")
}

export async function getCustomerByPhone(phone: string): Promise<CustomerRow | undefined> {
  const rows = await query<CustomerRow>("SELECT * FROM customers WHERE phone = ?", [phone])
  return rows[0]
}

export async function getCustomerCount(): Promise<number> {
  const row = await query<{ c: number }>("SELECT COUNT(*) as c FROM customers")
  return row[0]?.c ?? 0
}
