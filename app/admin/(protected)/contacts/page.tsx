import { getAllContacts } from "@/lib/contacts"
import { ContactsList } from "@/components/admin/contacts-list"

export const dynamic = "force-dynamic"

export default async function AdminContactsPage() {
  const contacts = await getAllContacts()
  return <ContactsList contacts={contacts} />
}
