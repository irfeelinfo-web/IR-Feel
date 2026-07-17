/**
 * Rate Limiter using DB storage.
 * Works across serverless function invocations (persists in Turso).
 */

import { run, getOne } from "@/lib/db"

export async function checkRateLimit(ip: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now()

  // Occasionally cleanup expired records (approx 1% of the time)
  if (Math.random() < 0.01) {
    await run("DELETE FROM rate_limits WHERE expires_at < ?", [now])
  }

  const record = await getOne<{ count: number; expires_at: number }>(
    "SELECT count, expires_at FROM rate_limits WHERE ip = ?",
    [ip]
  )

  if (!record || record.expires_at < now) {
    await run(
      "INSERT INTO rate_limits (ip, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(ip) DO UPDATE SET count = 1, expires_at = excluded.expires_at",
      [ip, now + windowMs]
    )
    return true
  }

  if (record.count >= limit) {
    return false
  }

  await run("UPDATE rate_limits SET count = count + 1 WHERE ip = ?", [ip])
  return true
}

import { headers } from "next/headers"

export async function generateFingerprint(): Promise<string> {
  const h = await headers()
  const ip = h.get("x-forwarded-for") || "unknown"
  const ua = h.get("user-agent") || "unknown"
  return `${ip}-${ua}`
}
