"use server"

import { getOne } from "@/lib/db"
import { checkRateLimit } from "@/lib/rate-limit"
import { headers } from "next/headers"

/** Normalize phone to last 11 digits (Bangladesh format) */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  // If starts with 880 and has 13 digits, strip country code
  if (digits.length === 13 && digits.startsWith("880")) return digits.slice(2)
  // Return last 11 digits for matching
  return digits.slice(-11)
}

export async function trackOrderAction(orderId: string, phone: string) {
  // Rate limiting to prevent abuse
  const h = await headers()
  const ip = h.get("x-forwarded-for") || "127.0.0.1"
  const isAllowed = await checkRateLimit(`track_${ip}`, 30, 60_000) // 30 req per minute
  if (!isAllowed) {
    return { error: "অনেক বেশি অনুরোধ করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।" }
  }

  if (!orderId || !phone) {
    return { error: "অর্ডার আইডি এবং ফোন নম্বর উভয়ই দিন।" }
  }

  // Clean up input — strip spaces, handle both "IRF-XXXXYYYY" and "IRFXXXXYYYY"
  const uid = orderId.trim().toUpperCase().replace(/\s+/g, "")
  const normalizedPhone = normalizePhone(phone)

  if (!uid) {
    return { error: "সঠিক অর্ডার আইডি দিন।" }
  }

  if (normalizedPhone.length < 10) {
    return { error: "সঠিক ফোন নম্বর দিন।" }
  }

  try {
    // Fetch all orders matching this UID then filter by phone
    const order = await getOne<any>(
      `SELECT id, order_uid, customer_name, phone, address, status, items, subtotal, delivery_charge, total, created_at 
       FROM orders 
       WHERE order_uid = ?`,
      [uid]
    )

    if (!order) {
      return { error: "এই তথ্য দিয়ে কোনো অর্ডার পাওয়া যায়নি।" }
    }

    // Normalize stored phone and compare
    if (normalizePhone(order.phone) !== normalizedPhone) {
      return { error: "এই তথ্য দিয়ে কোনো অর্ডার পাওয়া যায়নি।" }
    }

    if (order.items) {
      order.items = JSON.parse(order.items)
    }

    return { success: true, order }
  } catch (error) {
    console.error("Track Order Error:", error)
    return { error: "অর্ডার খুঁজে পেতে সমস্যা হয়েছে।" }
  }
}
