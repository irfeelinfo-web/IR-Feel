import "server-only"
import { query } from "./db"
import type { OrderRow } from "./order-types"

export type { OrderItem, OrderStatus, OrderRow } from "./order-types"
export { orderStatuses, statusLabels, paymentLabels } from "./order-types"

export function getAllOrders(): OrderRow[] {
  const rows = query<OrderRow & { items: string }>(
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

export function getOrdersByPhone(phone: string): OrderRow[] {
  const rows = query<OrderRow & { items: string }>(
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
