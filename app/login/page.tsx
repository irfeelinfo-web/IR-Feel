import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AccountPageClient } from "@/app/account/account-client"
import { getSettings } from "@/lib/content"
import { getLoggedInCustomer } from "@/lib/customer-auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "লগইন / রেজিস্টার",
  description: "আপনার অ্যাকাউন্টে লগইন করুন অথবা নতুন অ্যাকাউন্ট খুলুন।",
}

export default async function LoginPage() {
  // If already logged in, redirect to account
  const customer = await getLoggedInCustomer()
  if (customer) {
    redirect("/account")
  }

  const settings = await getSettings()

  return (
    <>
      <SiteHeader active="account" />
      <main className="min-h-screen bg-background">
        <AccountPageClient accountPromo={settings.accountPromo} recentOrders={[]} />
      </main>
      <SiteFooter />
    </>
  )
}
