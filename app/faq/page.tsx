import { HelpCircle } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { FaqAccordion } from "@/components/faq/faq-accordion"
import { JsonLd } from "@/components/json-ld"
import { buildMetadata } from "@/lib/seo"
import { getPages } from "@/lib/content"

export const revalidate = 60


export async function generateMetadata() {
  return await buildMetadata({
    title: "FAQ — Frequently Asked Questions",
    description:
      "Answers to common IR Feel questions about ordering, payment, delivery and returns. অর্ডার, পেমেন্ট, ডেলিভারি ও রিটার্ন সম্পর্কে সচরাচর জিজ্ঞাসিত প্রশ্ন।",
    path: "/faq",
  })
}

export default async function FaqPage() {
  const pages = await getPages()
  const faqs = pages.faq && pages.faq.length > 0 ? pages.faq : []

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  return (
    <>
      <JsonLd data={faqLd} />
      <SiteHeader />
      <main className="bg-background">
        {/* Hero */}
        <section className="border-b border-border bg-secondary/50">
          <div className="mx-auto max-w-[1280px] px-4 py-14 text-center sm:px-6 sm:py-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
              <HelpCircle className="h-3.5 w-3.5" />
              Got Questions?
            </span>
            <h1 className="mx-auto mt-5 max-w-2xl text-balance text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
              {pages.faqTitle || "Frequently Asked Questions"}
            </h1>
            <p className="font-bengali mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {pages.faqIntro || "অর্ডার, পেমেন্ট, ডেলিভারি বা রিটার্ন—আপনার সব প্রশ্নের উত্তর এখানে। খুঁজে না পেলে সরাসরি আমাদের সাথে যোগাযোগ করুন।"}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <FaqAccordion items={faqs} />
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
