import "server-only"
import { query, getOne } from "@/lib/db"

export type ChangeRequestRow = {
  id: number
  customer_id: number
  field_type: "phone" | "email"
  current_value: string
  new_value: string
  status: "pending" | "approved" | "rejected"
  admin_note: string
  created_at: string
  updated_at: string
}

export type ChangeRequestWithCustomer = ChangeRequestRow & {
  customer_name: string
  customer_phone: string
  customer_email: string
}

/** Get all change requests with customer info (for admin) */
export async function getAllChangeRequests(status?: string): Promise<ChangeRequestWithCustomer[]> {
  let sql = `
    SELECT r.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
    FROM profile_change_requests r
    JOIN customers c ON c.id = r.customer_id
  `
  const params: string[] = []
  if (status) {
    sql += ` WHERE r.status = ?`
    params.push(status)
  }
  sql += ` ORDER BY r.created_at DESC`
  return query<ChangeRequestWithCustomer>(sql, params)
}

/** Count pending change requests */
export async function getPendingChangeRequestCount(): Promise<number> {
  const row = await getOne<{ c: number }>(
    "SELECT COUNT(*) as c FROM profile_change_requests WHERE status = 'pending'"
  )
  return row?.c ?? 0
}

/** Get change requests for a specific customer */
export async function getChangeRequestsByCustomer(customerId: number): Promise<ChangeRequestRow[]> {
  return query<ChangeRequestRow>(
    "SELECT * FROM profile_change_requests WHERE customer_id = ? ORDER BY created_at DESC",
    [customerId]
  )
}

/** Check if customer already has a pending request for this field */
export async function hasPendingRequest(customerId: number, fieldType: string): Promise<boolean> {
  const row = await getOne<{ c: number }>(
    "SELECT COUNT(*) as c FROM profile_change_requests WHERE customer_id = ? AND field_type = ? AND status = 'pending'",
    [customerId, fieldType]
  )
  return (row?.c ?? 0) > 0
}

/** Get a single change request by ID */
export async function getChangeRequestById(id: number): Promise<ChangeRequestWithCustomer | undefined> {
  return await getOne<ChangeRequestWithCustomer>(
    `SELECT r.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
     FROM profile_change_requests r
     JOIN customers c ON c.id = r.customer_id
     WHERE r.id = ?`,
    [id]
  ) || undefined
}
