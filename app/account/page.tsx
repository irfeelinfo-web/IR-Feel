import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AccountPageClient } from "./account-client"
import { getSettings } from "@/lib/content"
import { getLoggedInCustomer } from "@/lib/customer-auth"
import { getOrdersByPhone } from "@/lib/orders"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "আমার অ্যাকাউন্ট",
  description: "আপনার অ্যাকাউন্ট ম্যানেজ করুন, প্রোফাইল আপডেট করুন এবং অর্ডার ট্র্যাক করুন।",
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const nextUrl = typeof params.next === "string" ? params.next : "/account"

  const customer = await getLoggedInCustomer()
  if (!customer) {
    redirect(`/login?next=${encodeURIComponent(nextUrl)}`)
  }

  const settings = await getSettings()
  
  // Fetch orders linked to this customer's phone
  const recentOrders = customer.phone && !customer.phone.startsWith("google_") 
    ? await getOrdersByPhone(customer.phone) 
    : []
  
  return (
    <>
      <SiteHeader active="account" />
      <main className="min-h-screen bg-background">
        <AccountPageClient accountPromo={settings.accountPromo} recentOrders={recentOrders} nextUrl={nextUrl} />
      </main>
      <SiteFooter />
    </>
  )
}
