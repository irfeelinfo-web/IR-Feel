import "server-only"
import { cookies } from "next/headers"
import { createHmac, timingSafeEqual } from "crypto"

const COOKIE_NAME = "admin_session"

// Check for missing password at startup (only in development or server start)
if (!process.env.ADMIN_PASSWORD) {
  console.warn("⚠️  WARNING: ADMIN_PASSWORD environment variable is not set!")
  console.warn("⚠️  The admin panel will be inaccessible. Please set it in your .env file.")
}

/**
 * Read the admin password from the environment.
 * Some environments store the value wrapped in matching quotes (e.g. '@secret@').
 * Next.js's dotenv strips those locally but production keeps them verbatim, which
 * would make the same password behave differently across environments. We strip a
 * single pair of surrounding matching quotes so login works consistently everywhere.
 */
function getAdminPassword(): string {
  let password = process.env.ADMIN_PASSWORD ?? ""
  if (
    password.length >= 2 &&
    ((password.startsWith('"') && password.endsWith('"')) ||
      (password.startsWith("'") && password.endsWith("'")))
  ) {
    password = password.slice(1, -1)
  }
  return password
}

function expectedToken(): string {
  const password = getAdminPassword()
  // Token is an HMAC of a fixed string keyed by the admin password.
  // It can't be forged without knowing the password, and it never exposes the password.
  return createHmac("sha256", password).update("fashion-admin-session-v1").digest("hex")
}

export function verifyPassword(input: string): boolean {
  const password = getAdminPassword()
  if (!password) return false
  // Hash both to ensure constant-length comparison — prevents timing side-channel leaks
  const a = createHmac("sha256", "verify").update(input).digest()
  const b = createHmac("sha256", "verify").update(password).digest()
  return timingSafeEqual(a, b)
}

export async function createSession() {
  const store = await cookies()
  store.set(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function destroySession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return false
  const expected = expectedToken()
  const a = Buffer.from(token)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
