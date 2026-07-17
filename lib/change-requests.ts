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
export function getAllChangeRequests(status?: string): ChangeRequestWithCustomer[] {
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
export function getPendingChangeRequestCount(): number {
  const row = getOne<{ c: number }>(
    "SELECT COUNT(*) as c FROM profile_change_requests WHERE status = 'pending'"
  )
  return row?.c ?? 0
}

/** Get change requests for a specific customer */
export function getChangeRequestsByCustomer(customerId: number): ChangeRequestRow[] {
  return query<ChangeRequestRow>(
    "SELECT * FROM profile_change_requests WHERE customer_id = ? ORDER BY created_at DESC",
    [customerId]
  )
}

/** Check if customer already has a pending request for this field */
export function hasPendingRequest(customerId: number, fieldType: string): boolean {
  const row = getOne<{ c: number }>(
    "SELECT COUNT(*) as c FROM profile_change_requests WHERE customer_id = ? AND field_type = ? AND status = 'pending'",
    [customerId, fieldType]
  )
  return (row?.c ?? 0) > 0
}

/** Get a single change request by ID */
export function getChangeRequestById(id: number): ChangeRequestWithCustomer | undefined {
  return getOne<ChangeRequestWithCustomer>(
    `SELECT r.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
     FROM profile_change_requests r
     JOIN customers c ON c.id = r.customer_id
     WHERE r.id = ?`,
    [id]
  ) || undefined
}
