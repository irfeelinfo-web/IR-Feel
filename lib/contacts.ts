import "server-only"
import { query } from "./db"

export type ContactMessage = {
  id: number
  name: string
  phone: string
  email: string
  subject: string
  message: string
  created_at: string
}

export async function getAllContacts(): Promise<ContactMessage[]> {
  return query<ContactMessage>(
    `SELECT id, name, phone, email, subject, message, created_at 
     FROM contacts 
     ORDER BY created_at DESC`
  )
}
