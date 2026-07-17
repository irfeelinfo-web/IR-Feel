import { getAllOrders } from "@/lib/orders"
import { OrdersList } from "@/components/admin/orders-list"

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage() {
  const orders = await getAllOrders()
  return <OrdersList orders={orders} />
}
