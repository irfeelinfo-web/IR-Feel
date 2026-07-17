import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/admin-auth"
import { AdminShell } from "@/components/admin/admin-shell"

export const metadata = {
  title: "Admin Panel",
  robots: { index: false, follow: false },
}

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  if (!(await isAuthenticated())) redirect("/admin/login")
  return <AdminShell>{children}</AdminShell>
}
