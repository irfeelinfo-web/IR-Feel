import { MapPin, Phone, Clock, Store } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { JsonLd } from "@/components/json-ld"
import { buildMetadata, SITE_URL, absoluteUrl, BRAND_NAME, BRAND_EMAIL } from "@/lib/seo"
import { getPages } from "@/lib/content"

export const revalidate = 60


export async function generateMetadata() {
  return await buildMetadata({
    title: "Our Stores — IR Feel Showrooms",
    description:
      "Find IR Feel showroom addresses, phone numbers and opening hours across Bangladesh. আমাদের শোরুমগুলোর ঠিকানা ও খোলার সময় জেনে নিন।",
    path: "/our-stores",
  })
}

const fallbackStores = [
  {
    name: "Gulshan Flagship Store",
    address: "১২৩ ফ্যাশন এভিনিউ, গুলশান-২, ঢাকা-১২১২",
    phone: "+880 1700-000000",
    hours: "শনি - বৃহস্পতি: সকাল ১০টা - রাত ৯টা",
  },
  {
    name: "Dhanmondi Outlet",
    address: "৪৫ মিরপুর রোড, ধানমন্ডি ২৭, ঢাকা-১২০৯",
    phone: "+880 1700-111111",
    hours: "শনি - বৃহস্পতি: সকাল ১০টা - রাত ৯টা",
  },
  {
    name: "Chattogram Store",
    address: "৭৮ জিইসি মোড়, নাসিরাবাদ, চট্টগ্রাম-৪২০০",
    phone: "+880 1700-222222",
    hours: "শনি - বৃহস্পতি: সকাল ১০টা - রাত ৮টা",
  },
  {
    name: "Sylhet Store",
    address: "৯ জিন্দাবাজার, সিলেট-৩১০০",
    phone: "+880 1700-333333",
    hours: "শনি - বৃহস্পতি: সকাল ১০টা - রাত ৮টা",
  },
]

export default async function OurStoresPage() {
  const pages = await getPages()
  const stores = pages.stores && pages.stores.length > 0 ? pages.stores : fallbackStores

  const storesLd = stores.map((store, i) => ({
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "@id": `${SITE_URL}/our-stores#store-${i + 1}`,
    name: `${BRAND_NAME} — ${store.name}`,
    image: absoluteUrl("/og-image.png"),
    telephone: store.phone,
    email: BRAND_EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: store.address,
      addressCountry: "BD",
    },
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
  }))

  return (
    <>
      <JsonLd data={storesLd} />
      <SiteHeader />
      <main className="bg-background">
        <section className="border-b border-border bg-secondary/50">
          <div className="mx-auto max-w-[1280px] px-4 py-14 text-center sm:px-6 sm:py-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
              <Store className="h-3.5 w-3.5" />
              Visit Us
            </span>
            <h1 className="mx-auto mt-5 max-w-2xl text-balance text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
              Our Stores
            </h1>
            <p className="font-bengali mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              দেশের বিভিন্ন শহরে আমাদের শোরুমে সরাসরি এসে পণ্য দেখুন ও কিনুন। নিচে আমাদের সব
              শাখার ঠিকানা ও যোগাযোগের তথ্য দেওয়া হলো।
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {stores.map((store) => (
              <div key={store.name} className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-bold text-foreground">{store.name}</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.8} />
                    <p className="font-bengali text-sm leading-relaxed text-muted-foreground">{store.address}</p>
                  </div>
                  {store.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.8} />
                      <a
                        href={`tel:${store.phone.replace(/[^+\d]/g, "")}`}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {store.phone}
                      </a>
                    </div>
                  )}
                  {store.hours && (
                    <div className="flex items-start gap-3">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.8} />
                      <p className="font-bengali text-sm leading-relaxed text-muted-foreground">{store.hours}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
