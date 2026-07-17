import "server-only"
import { query } from "./db"
import type { OrderRow } from "./order-types"

export type { OrderItem, OrderStatus, OrderRow } from "./order-types"
export { orderStatuses, statusLabels, paymentLabels } from "./order-types"

export async function getAllOrders(): Promise<OrderRow[]> {
  const rows = await query<OrderRow & { items: string }>(
    `SELECT id, order_uid, customer_name, phone, address, location, payment_method,
            transaction_id, items, subtotal, delivery_charge, total,
            status, created_at
     FROM orders ORDER BY created_at DESC`,
  )
  return rows.map((r) => ({
    ...r,
    items: typeof r.items === "string" ? JSON.parse(r.items) : r.items,
  }))
}

export async function getOrdersByPhone(phone: string): Promise<OrderRow[]> {
  const rows = await query<OrderRow & { items: string }>(
    `SELECT id, order_uid, customer_name, phone, address, location, payment_method,
            transaction_id, items, subtotal, delivery_charge, total,
            status, created_at
     FROM orders WHERE phone = ? ORDER BY created_at DESC`,
    [phone]
  )
  return rows.map((r) => ({
    ...r,
    items: typeof r.items === "string" ? JSON.parse(r.items) : r.items,
  }))
}
