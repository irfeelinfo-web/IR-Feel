import { Truck, PackageCheck, MapPin, Clock } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { buildMetadata } from "@/lib/seo"
import { getPages } from "@/lib/content"

export const dynamic = "force-dynamic"



export async function generateMetadata() {
  return await buildMetadata({
    title: "Shipping & Delivery",
    description:
      "IR Feel delivery charges, timelines and nationwide home delivery across Bangladesh. Free shipping on orders over ৳ 999. দেশজুড়ে হোম ডেলিভারি।",
    path: "/shipping-delivery",
  })
}

const highlights = [
  {
    icon: Truck,
    title: "Delivery Charge",
    lines: ["ঢাকার ভেতরে: ৳ ৬০", "ঢাকার বাইরে: ৳ ১২০"],
  },
  {
    icon: Clock,
    title: "Delivery Time",
    lines: ["ঢাকার ভেতরে: ১-২ দিন", "ঢাকার বাইরে: ৩-৫ দিন"],
  },
  {
    icon: MapPin,
    title: "Coverage",
    lines: ["সারা বাংলাদেশে হোম ডেলিভারি", "৬৪ জেলায় সেবা উপলব্ধ"],
  },
  {
    icon: PackageCheck,
    title: "Order Tracking",
    lines: ["অর্ডার কনফার্মেশন SMS", "ডেলিভারির আগে কল"],
  },
]

const faqs = [
  {
    q: "অর্ডার কনফার্ম হওয়ার কতক্ষণ পর ডেলিভারি শুরু হয়?",
    a: "অর্ডার কনফার্ম হওয়ার পর আমরা ২৪ ঘণ্টার মধ্যে পণ্য প্যাকেজিং করে কুরিয়ারে হস্তান্তর করি।",
  },
  {
    q: "ক্যাশ অন ডেলিভারি কি সব জায়গায় পাওয়া যায়?",
    a: "হ্যাঁ, সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। পণ্য হাতে পেয়ে মূল্য পরিশোধ করতে পারবেন।",
  },
  {
    q: "ডেলিভারি চার্জ কি ফেরতযোগ্য?",
    a: "পণ্য ফেরত দিলে ডেলিভারি চার্জ ফেরতযোগ্য নয়। তবে আমাদের ভুলে সমস্যা হলে সম্পূর্ণ চার্জ ফেরত দেওয়া হয়।",
  },
]

export default async function ShippingDeliveryPage() {
  const pages = await getPages()

  return (
    <>
      <SiteHeader />
      <main className="bg-background">
        <section className="border-b border-border bg-secondary/50">
          <div className="mx-auto max-w-[1280px] px-4 py-14 text-center sm:px-6 sm:py-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
              <Truck className="h-3.5 w-3.5" />
              Fast & Reliable
            </span>
            <h1 className="mx-auto mt-5 max-w-2xl text-balance text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
              {pages.shippingTitle || "Shipping & Delivery"}
            </h1>
            <div className="font-bengali mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base whitespace-pre-line">
              {pages.shippingBody || "আপনার অর্ডার যেন সময়মতো, নিরাপদে পৌঁছে যায়—তা নিশ্চিত করতে আমরা সারা দেশে দ্রুত ও নির্ভরযোগ্য ডেলিভারি সেবা দিচ্ছি।"}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-lg border border-border bg-card p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary">
                  <item.icon className="h-5 w-5 text-gold" strokeWidth={1.8} />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{item.title}</h3>
                <div className="font-bengali mt-2 space-y-1">
                  {item.lines.map((line) => (
                    <p key={line} className="text-sm leading-relaxed text-muted-foreground">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-14 max-w-3xl">
            <h2 className="text-center text-2xl font-bold text-foreground">Common Questions</h2>
            <div className="mt-6 divide-y divide-border rounded-lg border border-border bg-card">
              {faqs.map((item) => (
                <div key={item.q} className="p-6">
                  <h3 className="font-bengali text-base font-semibold text-foreground">{item.q}</h3>
                  <p className="font-bengali mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
