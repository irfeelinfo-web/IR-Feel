import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/admin-auth"
import { LoginForm } from "@/components/admin/login-form"

export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage() {
  if (await isAuthenticated()) redirect("/admin")
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
            Admin Panel
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">লগইন করতে পাসওয়ার্ড দিন</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
