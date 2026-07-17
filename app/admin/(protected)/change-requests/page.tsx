import { getAllChangeRequests } from "@/lib/change-requests"
import { ChangeRequestsList } from "@/components/admin/change-requests-list"

export const dynamic = "force-dynamic"

export default async function AdminChangeRequestsPage() {
  const requests = await getAllChangeRequests()
  return <ChangeRequestsList requests={requests} />
}
