import { RotateCcw, CheckCircle2, XCircle, RefreshCw } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { buildMetadata } from "@/lib/seo"
import { getPages } from "@/lib/content"

export const revalidate = 60


export async function generateMetadata() {
  return await buildMetadata({
    title: "Returns & Exchanges",
    description:
      "IR Feel returns & exchange policy. Return or exchange your order within 7 days of delivery. সহজ রিটার্ন ও এক্সচেঞ্জ নীতি।",
    path: "/returns-exchanges",
  })
}

const steps = [
  {
    icon: RotateCcw,
    title: "Request Return",
    text: "পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে আমাদের সাথে যোগাযোগ করে রিটার্ন রিকোয়েস্ট করুন।",
  },
  {
    icon: RefreshCw,
    title: "Ship It Back",
    text: "মূল প্যাকেজিং ও ট্যাগসহ পণ্যটি আমাদের ঠিকানায় পাঠিয়ে দিন।",
  },
  {
    icon: CheckCircle2,
    title: "Get Refund",
    text: "পণ্য যাচাইয়ের পর ৩-৫ কর্মদিবসের মধ্যে রিফান্ড বা এক্সচেঞ্জ সম্পন্ন হবে।",
  },
]

const eligible = [
  "৭ দিনের মধ্যে রিটার্ন রিকোয়েস্ট করা হয়েছে",
  "পণ্য অব্যবহৃত ও মূল অবস্থায় আছে",
  "মূল ট্যাগ ও প্যাকেজিং অক্ষত আছে",
  "ভুল বা ত্রুটিপূর্ণ পণ্য পাঠানো হয়েছে",
]

const notEligible = [
  "ব্যবহৃত বা ধোয়া পণ্য",
  "ট্যাগ বা প্যাকেজিং ছাড়া পণ্য",
  "৭ দিন পার হয়ে যাওয়া রিকোয়েস্ট",
  "সেল বা ক্লিয়ারেন্স আইটেম",
]

export default async function ReturnsExchangesPage() {
  const pages = await getPages()

  return (
    <>
      <SiteHeader />
      <main className="bg-background">
        <section className="border-b border-border bg-secondary/50">
          <div className="mx-auto max-w-[1280px] px-4 py-14 text-center sm:px-6 sm:py-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
              <RotateCcw className="h-3.5 w-3.5" />
              Easy & Hassle-Free
            </span>
            <h1 className="mx-auto mt-5 max-w-2xl text-balance text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
              {pages.returnsTitle || "Returns & Exchanges"}
            </h1>
            <div className="font-bengali mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base whitespace-pre-line">
              {pages.returnsBody || "পছন্দ না হলে চিন্তা নেই। ৭ দিনের মধ্যে সহজেই পণ্য ফেরত বা পরিবর্তন করতে পারবেন—কোনো ঝামেলা ছাড়াই।"}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary">
                     <step.icon className="h-5 w-5 text-gold" strokeWidth={1.8} />
                  </div>
                  <span className="text-2xl font-extrabold text-border">{`0${i + 1}`}</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{step.title}</h3>
                <p className="font-bengali mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" strokeWidth={2} />
                <h3 className="text-base font-bold text-foreground">Eligible for Return</h3>
              </div>
              <ul className="font-bengali mt-4 space-y-3">
                {eligible.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" strokeWidth={2} />
                <h3 className="text-base font-bold text-foreground">Not Eligible</h3>
              </div>
              <ul className="font-bengali mt-4 space-y-3">
                {notEligible.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
