import { getAllCustomers } from "@/lib/customers"
import { CustomersList } from "@/components/admin/customers-list"

export const dynamic = "force-dynamic"

export default async function AdminCustomersPage() {
  const customers = await getAllCustomers()
  return <CustomersList customers={customers} />
}
