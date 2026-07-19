/**
 * Rate Limiter using DB storage.
 * Works across serverless function invocations (persists in Turso).
 * Uses atomic upsert to eliminate read-then-write race condition.
 */

import { headers } from "next/headers"
import { run, getOne } from "@/lib/db"

export async function checkRateLimit(ip: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now()
  const expiresAt = now + windowMs

  // Cleanup expired records (approx 5% of the time, with batch limit)
  if (Math.random() < 0.05) {
    await run("DELETE FROM rate_limits WHERE expires_at < ? LIMIT 100", [now]).catch(() => {
      // LIMIT may not be supported in all SQLite builds — fallback to unbounded delete
      return run("DELETE FROM rate_limits WHERE expires_at < ?", [now])
    })
  }

  // Atomic upsert: insert or increment count in a single statement.
  // If the record expired, reset count to 1 and set a new expiry.
  // If the record is active and count < limit, increment by 1.
  // If the record is active and count >= limit, don't increment (the SELECT below detects it).
  await run(
    `INSERT INTO rate_limits (ip, count, expires_at) VALUES (?, 1, ?)
     ON CONFLICT(ip) DO UPDATE SET
       count = CASE
         WHEN rate_limits.expires_at < ? THEN 1
         WHEN rate_limits.count < ? THEN rate_limits.count + 1
         ELSE rate_limits.count
       END,
       expires_at = CASE
         WHEN rate_limits.expires_at < ? THEN ?
         ELSE rate_limits.expires_at
       END`,
    [ip, expiresAt, now, limit, now, expiresAt]
  )

  // Now check the current count
  const record = await getOne<{ count: number; expires_at: number }>(
    "SELECT count, expires_at FROM rate_limits WHERE ip = ?",
    [ip]
  )

  if (!record) return true
  if (record.expires_at < now) return true
  return record.count <= limit
}

export async function generateFingerprint(): Promise<string> {
  const h = await headers()
  const forwarded = h.get("x-forwarded-for") || ""
  // Use only the first IP from x-forwarded-for (client IP) for better accuracy
  const ip = forwarded.split(",")[0]?.trim() || "unknown"
  return ip
}
