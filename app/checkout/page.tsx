import { ShieldCheck } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { OrderSummary } from "@/components/checkout/order-summary"
import { CheckoutFeatures } from "@/components/checkout/checkout-features"
import { buildMetadata } from "@/lib/seo"
import { getPayment, getSettings } from "@/lib/content"


export async function generateMetadata() {
  return await buildMetadata({
    title: "Checkout",
    description: "Complete your IR Feel order securely.",
    path: "/checkout",
    noIndex: true,
  })
}

export default async function CheckoutPage() {
  const payment = await getPayment()
  const settings = await getSettings()
  const freeShippingThreshold = settings.freeShippingThreshold ?? 0

  return (
    <>
      <SiteHeader />
      <main className="bg-white dark:bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
          {/* Heading */}
          <div className="font-bengali mb-8 flex items-center gap-3 glass-order-card p-4 sm:p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/60 backdrop-blur-md">
              <ShieldCheck className="h-6 w-6 text-foreground" strokeWidth={1.8} />
            </span>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-foreground">অর্ডার নিশ্চিত করুন</h1>
              <p className="text-sm text-muted-foreground">নিরাপদে অর্ডার সম্পন্ন করুন</p>
            </div>
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
            <CheckoutForm payment={payment} freeShippingThreshold={freeShippingThreshold} />
            <OrderSummary payment={payment} freeShippingThreshold={freeShippingThreshold} />
          </div>
        </div>

        <CheckoutFeatures />
      </main>
      <SiteFooter />
    </>
  )
}
