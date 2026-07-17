import "server-only"
import { cookies } from "next/headers"
import { randomBytes } from "crypto"
import { run, getOne } from "@/lib/db"

const COOKIE_NAME = "customer_session"

export type CustomerSession = {
  id: number
  name: string
  phone: string
  email: string
  address: string
  city: string
  avatar: string
  google_id: string | null
  reward_points: number
}

export async function createCustomerSession(customerId: number): Promise<void> {
  const token = randomBytes(32).toString("hex")
  // Clean up old sessions for this customer (one active session per customer)
  await run("DELETE FROM customer_sessions WHERE customer_id = ?", [customerId])
  // Create new session
  await run("INSERT INTO customer_sessions (customer_id, token) VALUES (?, ?)", [customerId, token])

  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function destroyCustomerSession(): Promise<void> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (token) {
    await run("DELETE FROM customer_sessions WHERE token = ?", [token])
  }
  store.delete(COOKIE_NAME)
}

export async function getLoggedInCustomer(): Promise<CustomerSession | null> {
  try {
    const store = await cookies()
    const token = store.get(COOKIE_NAME)?.value
    if (!token) return null

    const row = await getOne<CustomerSession>(
      `SELECT c.id, c.name, c.phone, c.email, c.address, c.city, c.avatar, c.google_id, c.reward_points
       FROM customer_sessions s
       JOIN customers c ON c.id = s.customer_id
       WHERE s.token = ?`,
      [token],
    )

    return row || null
  } catch {
    return null
  }
}
