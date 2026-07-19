import { NextResponse } from "next/server"
import { run, getOne } from "@/lib/db"
import { createCustomerSession } from "@/lib/customer-auth"

/**
 * Decode AND verify Google ID token.
 * Fix #2: We now verify the token signature by calling Google's tokeninfo endpoint
 * instead of blindly trusting the JWT payload.
 */
async function verifyGoogleToken(token: string): Promise<Record<string, unknown>> {
  // Use Google's tokeninfo endpoint to verify signature + claims
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`)
  if (!res.ok) {
    throw new Error("Google token verification failed")
  }
  return await res.json()
}

export async function POST(request: Request) {
  try {
    const { credential } = await request.json()
    if (!credential) {
      return NextResponse.json({ error: "Missing credential" }, { status: 400 })
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      return NextResponse.json({ error: "Google sign-in not configured" }, { status: 500 })
    }

    // Verify the Google ID token via Google's endpoint (signature + claims)
    let payload: Record<string, unknown>
    try {
      payload = await verifyGoogleToken(credential)
    } catch {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 401 })
    }

    // Validate token claims
    if (payload.aud !== clientId) {
      return NextResponse.json({ error: "Token audience mismatch" }, { status: 401 })
    }
    if (payload.iss !== "accounts.google.com" && payload.iss !== "https://accounts.google.com") {
      return NextResponse.json({ error: "Invalid token issuer" }, { status: 401 })
    }
    const exp = typeof payload.exp === "number" ? payload.exp
      : typeof payload.exp === "string" ? parseInt(payload.exp, 10) : 0
    if (Date.now() / 1000 > exp) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 })
    }

    const googleId = payload.sub as string
    const email = (payload.email as string) || ""
    const name = (payload.name as string) || ""
    const picture = (payload.picture as string) || ""

    // Find existing customer by google_id or email
    let customer = await getOne<{ id: number }>(
      "SELECT id FROM customers WHERE google_id = ?",
      [googleId],
    )

    if (!customer && email) {
      customer = await getOne<{ id: number }>(
        "SELECT id FROM customers WHERE email = ? AND email != ''",
        [email],
      )
      // Link Google ID to existing customer
      if (customer) {
        await run(
          "UPDATE customers SET google_id = ?, avatar = CASE WHEN avatar = '' THEN ? ELSE avatar END, name = CASE WHEN name = '' THEN ? ELSE name END WHERE id = ?",
          [googleId, picture, name, customer.id],
        )
      }
    }

    // Fix: Use unique placeholder phone to avoid UNIQUE constraint violation
    // when multiple Google users sign up without providing a phone number.
    if (!customer) {
      const placeholderPhone = `google_${googleId}`
      const result = await run(
        `INSERT INTO customers (name, phone, email, google_id, avatar) VALUES (?, ?, ?, ?, ?)`,
        [name, placeholderPhone, email, googleId, picture],
      )
      customer = { id: Number(result.lastInsertRowid) }
    } else {
      // Update avatar if empty
      await run(
        "UPDATE customers SET avatar = CASE WHEN avatar = '' THEN ? ELSE avatar END WHERE id = ?",
        [picture, customer.id],
      )
    }

    // Create session
    await createCustomerSession(customer.id)

    // Fetch full customer data
    const full = await getOne<{
      id: number
      name: string
      phone: string
      email: string
      address: string
      city: string
      avatar: string
      google_id: string
      reward_points: number
    }>("SELECT id, name, phone, email, address, city, avatar, google_id, reward_points FROM customers WHERE id = ?", [customer.id])

    return NextResponse.json({ ok: true, customer: full })
  } catch (err) {
    console.error("[google-auth] error:", (err as Error).message)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
