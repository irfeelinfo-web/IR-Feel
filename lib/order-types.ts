// Client-safe order types and label constants (no server-only / pg imports).

export type OrderItem = {
  id: string
  name: string
  price: number
  image: string
  size: string
  color: string
  qty: number
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"

export type OrderRow = {
  id: number
  order_uid: string
  customer_name: string
  phone: string
  address: string
  location: string
  payment_method: string
  transaction_id: string | null
  items: OrderItem[]
  subtotal: number
  delivery_charge: number
  total: number
  status: OrderStatus
  created_at: string
}

export const orderStatuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
]

export const statusLabels: Record<OrderStatus, string> = {
  pending: "পেন্ডিং",
  confirmed: "কনফার্মড",
  shipped: "শিপড",
  delivered: "ডেলিভারড",
  cancelled: "বাতিল",
}

export const paymentLabels: Record<string, string> = {
  cod: "ক্যাশ অন ডেলিভারি",
  bkash: "বিকাশ",
  nagad: "নগদ",
  bank: "ব্যাংক ট্রান্সফার",
}
