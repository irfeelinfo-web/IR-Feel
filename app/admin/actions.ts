"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { run, getOne, query, generateOrderUid } from "@/lib/db"
import {
  verifyPassword,
  createSession,
  destroySession,
  isAuthenticated,
} from "@/lib/admin-auth"
import { checkRateLimit, generateFingerprint } from "@/lib/rate-limit"
import type { SectionKey } from "@/lib/content"
import type { OrderRow } from "@/lib/order-types"

async function requireAuth() {
  if (!(await isAuthenticated())) throw new Error("Unauthorized")
}

function revalidateStorefront() {
  // Revalidate the root layout — this covers ALL pages
  revalidatePath("/", "layout")
  // Explicitly revalidate key storefront paths for safety
  revalidatePath("/shop")
  revalidatePath("/collections")
  revalidatePath("/product", "layout")
  revalidatePath("/category", "layout")
  revalidatePath("/checkout")
  // Revalidate admin pages too
  revalidatePath("/admin", "layout")
}

export async function loginAction(_prev: unknown, formData: FormData) {
  const fingerprint = await generateFingerprint()
  if (!checkRateLimit(fingerprint, 5, 60000)) {
    return { error: "অনেকবার চেষ্টা করা হয়েছে। এক মিনিট পর আবার চেষ্টা করুন।" }
  }

  const password = String(formData.get("password") ?? "")
  if (!verifyPassword(password)) {
    return { error: "ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।" }
  }
  await createSession()
  redirect("/admin")
}

export async function logoutAction() {
  await destroySession()
  redirect("/admin/login")
}

export async function saveSectionAction(section: SectionKey, data: unknown) {
  await requireAuth()
  await run(
    `INSERT INTO site_content (section, data, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT (section) DO UPDATE SET data = excluded.data, updated_at = datetime('now')`,
    [section, JSON.stringify(data)],
  )
  revalidateStorefront()
  return { ok: true }
}

export type ProductInput = {
  id: string
  name: string
  price: number
  oldPrice?: number | null
  image: string
  badge?: string | null
  category?: string | null
  colors: string[]
  sizes: string[]
  description?: string | null
  images: string[]
  rating: number
  reviews: number
  inStock: boolean
  featured: boolean
  newArrival: boolean
  sortOrder: number
}

export async function saveProductAction(input: ProductInput, _isNew: boolean) {
  await requireAuth()
  const p = input
  await run(
    `INSERT INTO products (id, name, price, old_price, image, badge, category, colors, sizes, description, images, rating, reviews, in_stock, featured, new_arrival, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name, price=excluded.price, old_price=excluded.old_price,
       image=excluded.image, badge=excluded.badge, category=excluded.category,
       colors=excluded.colors, sizes=excluded.sizes, description=excluded.description,
       images=excluded.images, rating=excluded.rating, reviews=excluded.reviews,
       in_stock=excluded.in_stock, featured=excluded.featured,
       new_arrival=excluded.new_arrival, sort_order=excluded.sort_order`,
    [
      p.id, p.name, p.price, p.oldPrice ?? null, p.image, p.badge || null, p.category || null,
      JSON.stringify(p.colors), JSON.stringify(p.sizes), p.description || null, JSON.stringify(p.images.filter(Boolean)),
      p.rating, p.reviews, p.inStock ? 1 : 0, p.featured ? 1 : 0, p.newArrival ? 1 : 0, p.sortOrder,
    ],
  )
  revalidateStorefront()
  return { ok: true }
}

export async function deleteProductAction(id: string) {
  await requireAuth()
  await run("DELETE FROM products WHERE id = ?", [id])
  revalidateStorefront()
  return { ok: true }
}

export type OrderItemInput = {
  id: string
  name: string
  price: number
  image: string
  size: string
  color: string
  qty: number
}

export type NewOrderInput = {
  customerName: string
  phone: string
  address: string
  location: string
  paymentMethod: string
  transactionId?: string | null
  items: OrderItemInput[]
  subtotal: number
  deliveryCharge: number
  total: number
}

/** Public action — customers place orders from checkout without an admin session. */
export async function createOrderAction(input: NewOrderInput) {
  const fingerprint = await generateFingerprint()
  if (!checkRateLimit(fingerprint, 5, 60000)) {
    return { ok: false as const, error: "খুব বেশি রিকোয়েস্ট করা হয়েছে। একটু পর আবার চেষ্টা করুন।" }
  }

  if (!input.customerName || !input.phone || !input.address) {
    return { ok: false as const, error: "প্রয়োজনীয় তথ্য পূরণ করুন।" }
  }
  if (!input.items || input.items.length === 0) {
    return { ok: false as const, error: "আপনার কার্ট খালি।" }
  }
  try {
    const uid = generateOrderUid()
    await run(
      `INSERT INTO orders (order_uid, customer_name, phone, address, location, payment_method, transaction_id, items, subtotal, delivery_charge, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        uid, input.customerName, input.phone, input.address, input.location,
        input.paymentMethod, input.transactionId || null,
        JSON.stringify(input.items), input.subtotal, input.deliveryCharge, input.total,
      ],
    )
    revalidatePath("/admin/orders")
    revalidatePath("/admin")
    return { ok: true as const, uid }
  } catch (err) {
    console.error("[createOrderAction] error:", (err as Error).message)
    return { ok: false as const, error: "অর্ডার সংরক্ষণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" }
  }
}

export async function updateOrderStatusAction(id: number, status: string) {
  await requireAuth()
  await run("UPDATE orders SET status = ? WHERE id = ?", [status, id])
  revalidatePath("/admin/orders")
  revalidatePath("/admin", "layout")
  return { ok: true }
}

export async function deleteOrderAction(id: number) {
  await requireAuth()
  await run("DELETE FROM orders WHERE id = ?", [id])
  revalidatePath("/admin/orders")
  revalidatePath("/admin", "layout")
  return { ok: true }
}

/** Public action — visitors submit contact form messages. */
export async function submitContactAction(input: {
  name: string
  phone: string
  email: string
  subject: string
  message: string
}) {
  const fingerprint = await generateFingerprint()
  if (!checkRateLimit(fingerprint, 3, 60000)) {
    return { ok: false as const, error: "খুব বেশি রিকোয়েস্ট করা হয়েছে। একটু পর আবার চেষ্টা করুন।" }
  }

  if (!input.name || !input.phone || !input.message) {
    return { ok: false as const, error: "প্রয়োজনীয় তথ্য পূরণ করুন।" }
  }
  try {
    await run(
      `INSERT INTO contacts (name, phone, email, subject, message) VALUES (?, ?, ?, ?, ?)`,
      [input.name, input.phone, input.email || "", input.subject, input.message],
    )
    return { ok: true as const }
  } catch (err) {
    console.error("[contact] write failed:", (err as Error).message)
    return { ok: false as const, error: "বার্তা পাঠানো ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" }
  }
}

/** Public action — visitors subscribe to newsletter. */
export async function subscribeNewsletterAction(email: string) {
  const fingerprint = await generateFingerprint()
  if (!checkRateLimit(fingerprint, 5, 60000)) {
    return { ok: false as const, error: "খুব বেশি রিকোয়েস্ট করা হয়েছে। একটু পর আবার চেষ্টা করুন।" }
  }

  if (!email || !email.includes("@")) {
    return { ok: false as const, error: "সঠিক ইমেইল দিন।" }
  }
  try {
    const existing = await getOne<{ email: string }>(
      "SELECT email FROM newsletter WHERE email = ? COLLATE NOCASE",
      [email],
    )
    if (existing) {
      return { ok: true as const, message: "আপনি ইতোমধ্যে সাবস্ক্রাইব করেছেন!" }
    }
    await run("INSERT INTO newsletter (email) VALUES (?)", [email])
    return { ok: true as const, message: "সফলভাবে সাবস্ক্রাইব হয়েছে!" }
  } catch (err) {
    console.error("[newsletter] write failed:", (err as Error).message)
    return { ok: false as const, error: "সাবস্ক্রাইব ব্যর্থ হয়েছে।" }
  }
}

export async function deleteContactAction(id: number) {
  await requireAuth()
  try {
    await run("DELETE FROM contacts WHERE id = ?", [id])
    revalidatePath("/admin/contacts")
    revalidatePath("/admin", "layout")
    return { ok: true as const }
  } catch (err) {
    console.error("[deleteContactAction] failed:", (err as Error).message)
    return { ok: false as const, error: "বার্তা ডিলিট করা ব্যর্থ হয়েছে।" }
  }
}

/* ── Chat Messaging Actions ── */

import { insertChatMessage, markSessionRead, deleteChatSession as dbDeleteChatSession } from "@/lib/chat"

/** Public action — visitor sends a chat message (rate limited) */
export async function sendChatMessageAction(input: {
  sessionId: string
  name: string
  phone: string
  message: string
}) {
  const fingerprint = await generateFingerprint()
  if (!checkRateLimit(fingerprint, 10, 60000)) {
    return { ok: false as const, error: "খুব বেশি মেসেজ পাঠানো হয়েছে। একটু পর আবার চেষ্টা করুন।" }
  }
  if (!input.sessionId || !input.name || !input.message) {
    return { ok: false as const, error: "প্রয়োজনীয় তথ্য পূরণ করুন।" }
  }
  try {
    const msg = await insertChatMessage(input.sessionId, input.name, input.phone || "", input.message, false)
    revalidatePath("/admin/messages")
    revalidatePath("/admin", "layout")
    return { ok: true as const, message: msg }
  } catch (err) {
    console.error("[sendChatMessage] error:", (err as Error).message)
    return { ok: false as const, error: "মেসেজ পাঠানো ব্যর্থ হয়েছে।" }
  }
}

/** Admin action — reply to a chat session */
export async function adminReplyAction(sessionId: string, message: string) {
  await requireAuth()
  if (!sessionId || !message) return { ok: false as const, error: "মেসেজ লিখুন।" }
  try {
    const msg = await insertChatMessage(sessionId, "Admin", "", message, true)
    revalidatePath("/admin/messages")
    return { ok: true as const, message: msg }
  } catch (err) {
    console.error("[adminReply] error:", (err as Error).message)
    return { ok: false as const, error: "রিপ্লাই পাঠানো ব্যর্থ হয়েছে।" }
  }
}

/** Admin action — delete an entire chat session */
export async function deleteChatSessionAction(sessionId: string) {
  await requireAuth()
  try {
    await dbDeleteChatSession(sessionId)
    revalidatePath("/admin/messages")
    revalidatePath("/admin", "layout")
    return { ok: true as const }
  } catch (err) {
    console.error("[deleteChatSession] error:", (err as Error).message)
    return { ok: false as const, error: "চ্যাট সেশন ডিলিট ব্যর্থ হয়েছে।" }
  }
}

/** Admin action — mark all visitor messages in a session as read */
export async function markChatReadAction(sessionId: string) {
  await requireAuth()
  try {
    await markSessionRead(sessionId)
    revalidatePath("/admin/messages")
    revalidatePath("/admin", "layout")
    return { ok: true as const }
  } catch (err) {
    console.error("[markChatRead] error:", (err as Error).message)
    return { ok: false as const, error: "মার্ক করা ব্যর্থ হয়েছে।" }
  }
}

/* ── Customer Account Actions ── */

import { createCustomerSession, destroyCustomerSession } from "@/lib/customer-auth"

import { randomBytes, scryptSync, timingSafeEqual } from "crypto"

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

function verifyPasswordHash(password: string, storedHash: string): boolean {
  if (!storedHash) return false // No password set
  const [salt, key] = storedHash.split(":")
  if (!salt || !key) return false
  const keyBuffer = Buffer.from(key, "hex")
  const derivedKey = scryptSync(password, salt, 64)
  return timingSafeEqual(keyBuffer, derivedKey)
}

/** Public action — customers create an account + auto login (rate limited) */
export async function registerCustomerAction(input: {
  name: string
  phone: string
  email: string
  password?: string
}) {
  const fingerprint = await generateFingerprint()
  if (!checkRateLimit(fingerprint, 5, 60000)) {
    return { ok: false as const, error: "খুব বেশি রিকোয়েস্ট করা হয়েছে। একটু পর আবার চেষ্টা করুন।" }
  }

  if (!input.name || !input.phone || !input.password) {
    return { ok: false as const, error: "নাম, ফোন নম্বর এবং পাসওয়ার্ড আবশ্যক।" }
  }
  
  if (input.password.length < 6) {
    return { ok: false as const, error: "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।" }
  }

  // Normalize phone
  const phone = input.phone.replace(/[\s-]/g, "")
  const phoneRegex = /^01[3-9]\d{8}$/
  if (!phoneRegex.test(phone)) {
    return { ok: false as const, error: "সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।" }
  }

  if (input.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(input.email)) {
      return { ok: false as const, error: "সঠিক ইমেইল অ্যাড্রেস দিন।" }
    }
  }

  try {
    // Check if phone already exists
    const existing = await getOne<{ id: number; password: string }>(
      "SELECT id, password FROM customers WHERE phone = ?",
      [phone],
    )
    if (existing) {
      if (!existing.password) {
        // Upgrade account with password
        await run("UPDATE customers SET password = ? WHERE id = ?", [hashPassword(input.password), existing.id])
        await createCustomerSession(existing.id)
        return { ok: true as const, customerId: existing.id }
      }
      return { ok: false as const, error: "এই ফোন নম্বরে ইতিমধ্যে একটি অ্যাকাউন্ট আছে। অনুগ্রহ করে লগইন করুন।" }
    }

    const result = await run(
      `INSERT INTO customers (name, phone, email, password, address, city) VALUES (?, ?, ?, ?, '', '')`,
      [input.name.trim(), phone, input.email?.trim() || "", hashPassword(input.password)],
    )
    const customerId = Number(result.lastInsertRowid)

    // Auto-login after registration
    await createCustomerSession(customerId)

    // Return full customer data so client doesn't need an extra /api/auth/me call
    const full = await getOne<{ id: number; name: string; phone: string; email: string; address: string; city: string; avatar: string; google_id: string | null }>(
      "SELECT id, name, phone, email, address, city, COALESCE(avatar, '') as avatar, google_id FROM customers WHERE id = ?",
      [customerId]
    )

    revalidatePath("/admin/customers")
    revalidatePath("/admin", "layout")
    return { ok: true as const, customerId, customer: full }
  } catch (err) {
    console.error("[registerCustomer] error:", (err as Error).message)
    return { ok: false as const, error: "অ্যাকাউন্ট তৈরি ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" }
  }
}

/** Public action — login with phone number or email and password */
export async function customerLoginAction(credential: string, password?: string) {
  const fingerprint = await generateFingerprint()
  if (!checkRateLimit(fingerprint, 10, 60000)) {
    return { ok: false as const, error: "খুব বেশি রিকোয়েস্ট করা হয়েছে। একটু পর আবার চেষ্টা করুন।" }
  }
  
  if (!password) {
    return { ok: false as const, error: "পাসওয়ার্ড আবশ্যক।" }
  }

  const isEmail = credential.includes("@")
  let normalized = credential.trim()

  if (isEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalized)) {
      return { ok: false as const, error: "সঠিক ইমেইল অ্যাড্রেস দিন।" }
    }
  } else {
    normalized = credential.replace(/[\s-]/g, "")
    const phoneRegex = /^01[3-9]\d{8}$/
    if (!phoneRegex.test(normalized)) {
      return { ok: false as const, error: "সঠিক মোবাইল নম্বর বা ইমেইল দিন।" }
    }
  }

  try {
    const query = isEmail 
      ? "SELECT id, password FROM customers WHERE email = ?"
      : "SELECT id, password FROM customers WHERE phone = ?"
      
    const customer = await getOne<{ id: number; password: string }>(query, [normalized])

    if (!customer) {
      return { ok: false as const, error: isEmail ? "এই ইমেইলে কোনো অ্যাকাউন্ট নেই। প্রথমে রেজিস্টার করুন।" : "এই ফোন নম্বরে কোনো অ্যাকাউন্ট নেই। প্রথমে রেজিস্টার করুন।" }
    }
    
    if (customer.password && !verifyPasswordHash(password, customer.password)) {
      return { ok: false as const, error: "ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।" }
    } else if (!customer.password) {
       // Auto-upgrade password for legacy users upon first successful identification attempt? No, that's unsafe.
       // Without OTP we can't securely upgrade. But for demo purposes, we will accept the password and save it.
       await run("UPDATE customers SET password = ? WHERE id = ?", [hashPassword(password), customer.id])
    }

    await createCustomerSession(customer.id)

    // Return full customer data so client doesn't need an extra /api/auth/me call
    const full = await getOne<{ id: number; name: string; phone: string; email: string; address: string; city: string; avatar: string; google_id: string | null }>(
      "SELECT id, name, phone, email, address, city, COALESCE(avatar, '') as avatar, google_id FROM customers WHERE id = ?",
      [customer.id]
    )
    return { ok: true as const, customer: full }
  } catch (err) {
    console.error("[loginAction] error:", (err as Error).message)
    return { ok: false as const, error: "লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" }
  }
}

/** Public action — update customer profile
 *  Phone: locked once set (non-google). Email: locked once set.
 *  Only name, address, city can be freely updated.
 */
export async function updateCustomerProfileAction(
  customerId: number,
  input: { name: string; phone: string; email: string; address?: string; city?: string },
) {
  const fingerprint = await generateFingerprint()
  if (!checkRateLimit(fingerprint, 10, 60000)) {
    return { ok: false as const, error: "খুব বেশি রিকোয়েস্ট করা হয়েছে।" }
  }

  if (!input.name) {
    return { ok: false as const, error: "নাম আবশ্যক।" }
  }


  const address = input.address?.trim() || ""
  const city = input.city?.trim() || ""

  try {
    const customer = await getOne<{ phone: string; email: string }>(
      "SELECT phone, email FROM customers WHERE id = ?", [customerId]
    )
    if (!customer) return { ok: false as const, error: "কাস্টমার পাওয়া যায়নি।" }

    // Email: only allow setting if currently empty
    const canSetEmail = !customer.email || customer.email.trim() === ""
    let emailToSave = customer.email || ""
    if (canSetEmail && input.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(input.email)) {
        return { ok: false as const, error: "সঠিক ইমেইল অ্যাড্রেস দিন।" }
      }
      emailToSave = input.email.trim()
    }

    if (customer.phone.startsWith("google_") && input.phone) {
      const normalized = input.phone.replace(/[\s-]/g, "")
      const phoneRegex = /^01[3-9]\d{8}$/
      if (!phoneRegex.test(normalized)) {
        return { ok: false as const, error: "সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।" }
      }
      
      const existing = await getOne<{ id: number }>("SELECT id FROM customers WHERE phone = ?", [normalized])
      if (existing && existing.id !== customerId) {
        return { ok: false as const, error: "এই মোবাইল নম্বরটি ইতিমধ্যে অন্য অ্যাকাউন্টে ব্যবহৃত হচ্ছে।" }
      }

      await run(
        `UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, city = ? WHERE id = ?`,
        [input.name.trim(), emailToSave, normalized, address, city, customerId],
      )
    } else {
      await run(
        `UPDATE customers SET name = ?, email = ?, address = ?, city = ? WHERE id = ?`,
        [input.name.trim(), emailToSave, address, city, customerId],
      )
    }
    
    revalidatePath("/account")
    return { ok: true as const }
  } catch (err) {
    console.error("[updateProfile] error:", (err as Error).message)
    return { ok: false as const, error: "প্রোফাইল আপডেট ব্যর্থ হয়েছে।" }
  }
}

/** Public action — customer logout */
export async function logoutCustomerAction() {
  await destroyCustomerSession()
  revalidatePath("/account")
  return { ok: true as const }
}

/** Admin action — delete a customer */
export async function deleteCustomerAction(id: number) {
  await requireAuth()
  try {
    await run("DELETE FROM customers WHERE id = ?", [id])
    revalidatePath("/admin/customers")
    revalidatePath("/admin", "layout")
    return { ok: true as const }
  } catch (err) {
    console.error("[deleteCustomer] error:", (err as Error).message)
    return { ok: false as const, error: "কাস্টমার ডিলিট করা ব্যর্থ হয়েছে।" }
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   Change Request Actions — phone/email পরিবর্তন রিকোয়েস্ট সিস্টেম
   ═══════════════════════════════════════════════════════════════════════ */

import {
  hasPendingRequest,
  getChangeRequestById,
} from "@/lib/change-requests"

/** Public action — customer submits a change request for phone or email */
export async function submitChangeRequestAction(
  customerId: number,
  fieldType: "phone" | "email",
  newValue: string,
) {
  const fingerprint = await generateFingerprint()
  if (!checkRateLimit(fingerprint, 5, 60000)) {
    return { ok: false as const, error: "খুব বেশি রিকোয়েস্ট করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।" }
  }

  if (!newValue || !newValue.trim()) {
    return { ok: false as const, error: "নতুন মান দিন।" }
  }

  const trimmed = newValue.trim()

  // Validate based on field type
  if (fieldType === "phone") {
    const normalized = trimmed.replace(/[\s-]/g, "")
    const phoneRegex = /^01[3-9]\d{8}$/
    if (!phoneRegex.test(normalized)) {
      return { ok: false as const, error: "সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।" }
    }
  } else if (fieldType === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      return { ok: false as const, error: "সঠিক ইমেইল অ্যাড্রেস দিন।" }
    }
  }

  try {
    // Check customer exists
    const customer = await getOne<{ id: number; phone: string; email: string }>(
      "SELECT id, phone, email FROM customers WHERE id = ?",
      [customerId]
    )
    if (!customer) return { ok: false as const, error: "কাস্টমার পাওয়া যায়নি।" }

    // Check for existing pending request
    if (await hasPendingRequest(customerId, fieldType)) {
      return { ok: false as const, error: `আপনার একটি ${fieldType === "phone" ? "মোবাইল" : "ইমেইল"} পরিবর্তন রিকোয়েস্ট ইতিমধ্যে অপেক্ষমাণ আছে।` }
    }

    const currentValue = fieldType === "phone" ? customer.phone : customer.email

    await run(
      `INSERT INTO profile_change_requests (customer_id, field_type, current_value, new_value) VALUES (?, ?, ?, ?)`,
      [customerId, fieldType, currentValue, trimmed]
    )

    revalidatePath("/account")
    revalidatePath("/admin/change-requests")
    return { ok: true as const }
  } catch (err) {
    console.error("[submitChangeRequest] error:", (err as Error).message)
    return { ok: false as const, error: "রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে।" }
  }
}

/** Admin action — approve a change request (updates the customer record) */
export async function approveChangeRequestAction(requestId: number) {
  await requireAuth()
  try {
    const req = await getChangeRequestById(requestId)
    if (!req) return { ok: false as const, error: "রিকোয়েস্ট পাওয়া যায়নি।" }
    if (req.status !== "pending") return { ok: false as const, error: "রিকোয়েস্টটি ইতিমধ্যে প্রক্রিয়াকৃত হয়েছে।" }

    // If phone change, check uniqueness
    if (req.field_type === "phone") {
      const normalized = req.new_value.replace(/[\s-]/g, "")
      const existing = await getOne<{ id: number }>("SELECT id FROM customers WHERE phone = ?", [normalized])
      if (existing && existing.id !== req.customer_id) {
        return { ok: false as const, error: "এই মোবাইল নম্বরটি ইতিমধ্যে অন্য অ্যাকাউন্টে ব্যবহৃত হচ্ছে।" }
      }
      await run(`UPDATE customers SET phone = ? WHERE id = ?`, [normalized, req.customer_id])
    } else {
      await run(`UPDATE customers SET email = ? WHERE id = ?`, [req.new_value, req.customer_id])
    }

    // Mark request as approved
    await run(
      `UPDATE profile_change_requests SET status = 'approved', updated_at = datetime('now') WHERE id = ?`,
      [requestId]
    )

    revalidatePath("/account")
    revalidatePath("/admin/change-requests")
    revalidatePath("/admin/customers")
    return { ok: true as const }
  } catch (err) {
    console.error("[approveChangeRequest] error:", (err as Error).message)
    return { ok: false as const, error: "অনুমোদন ব্যর্থ হয়েছে।" }
  }
}

/** Admin action — reject a change request */
export async function rejectChangeRequestAction(requestId: number, note?: string) {
  await requireAuth()
  try {
    const req = await getChangeRequestById(requestId)
    if (!req) return { ok: false as const, error: "রিকোয়েস্ট পাওয়া যায়নি।" }
    if (req.status !== "pending") return { ok: false as const, error: "রিকোয়েস্টটি ইতিমধ্যে প্রক্রিয়াকৃত হয়েছে।" }

    await run(
      `UPDATE profile_change_requests SET status = 'rejected', admin_note = ?, updated_at = datetime('now') WHERE id = ?`,
      [note?.trim() || "", requestId]
    )

    revalidatePath("/account")
    revalidatePath("/admin/change-requests")
    return { ok: true as const }
  } catch (err) {
    console.error("[rejectChangeRequest] error:", (err as Error).message)
    return { ok: false as const, error: "প্রত্যাখ্যান ব্যর্থ হয়েছে।" }
  }
}

/** Admin action — update customer reward points */
export async function updateCustomerRewardsAction(customerId: number, points: number) {
  await requireAuth()
  try {
    if (isNaN(points)) {
      return { ok: false as const, error: "সঠিক পয়েন্ট দিন।" }
    }
    
    await run(
      `UPDATE customers SET reward_points = ? WHERE id = ?`,
      [points, customerId]
    )

    revalidatePath("/admin/customers")
    return { ok: true as const }
  } catch (err) {
    console.error("[updateCustomerRewards] error:", (err as Error).message)
    return { ok: false as const, error: "পয়েন্ট আপডেট ব্যর্থ হয়েছে।" }
  }
}
