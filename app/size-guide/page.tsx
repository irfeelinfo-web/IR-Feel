import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { buildMetadata } from "@/lib/seo"
import Link from "next/link"
import { ChevronRight, Ruler } from "lucide-react"

export async function generateMetadata() {
  return await buildMetadata({
    title: "Size Guide — সাইজ গাইড",
    description: "IR Feel পণ্যের সঠিক সাইজ নির্বাচন করুন। পুরুষ ও মহিলাদের জন্য বিস্তারিত সাইজ চার্ট।",
    path: "/size-guide",
  })
}

const menSizes = [
  { size: "S", chest: "36\"", waist: "30\"", hip: "38\"", shoulder: "16.5\"" },
  { size: "M", chest: "38\"", waist: "32\"", hip: "40\"", shoulder: "17\"" },
  { size: "L", chest: "40\"", waist: "34\"", hip: "42\"", shoulder: "17.5\"" },
  { size: "XL", chest: "42\"", waist: "36\"", hip: "44\"", shoulder: "18\"" },
  { size: "XXL", chest: "44\"", waist: "38\"", hip: "46\"", shoulder: "18.5\"" },
]

const womenSizes = [
  { size: "S", chest: "32\"", waist: "26\"", hip: "34\"", shoulder: "14.5\"" },
  { size: "M", chest: "34\"", waist: "28\"", hip: "36\"", shoulder: "15\"" },
  { size: "L", chest: "36\"", waist: "30\"", hip: "38\"", shoulder: "15.5\"" },
  { size: "XL", chest: "38\"", waist: "32\"", hip: "40\"", shoulder: "16\"" },
  { size: "XXL", chest: "40\"", waist: "34\"", hip: "42\"", shoulder: "16.5\"" },
]

const tips = [
  {
    title: "বুক (Chest)",
    desc: "বুকের সবচেয়ে চওড়া অংশে ফিতা দিয়ে মাপুন। শ্বাস-প্রশ্বাসের স্বাভাবিক অবস্থায় মাপ নিন।",
  },
  {
    title: "কোমর (Waist)",
    desc: "কোমরের সবচেয়ে সরু অংশে, সাধারণত নাভির ঠিক উপরে মাপুন।",
  },
  {
    title: "হিপ (Hip)",
    desc: "হিপের সবচেয়ে চওড়া অংশে মাপুন।",
  },
  {
    title: "কাঁধ (Shoulder)",
    desc: "এক কাঁধের প্রান্ত থেকে অন্য কাঁধের প্রান্ত পর্যন্ত মাপুন।",
  },
]

export default function SizeGuidePage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Banner */}
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-[1280px] px-4 py-14 text-center sm:px-6">
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide sm:text-4xl">
              সাইজ গাইড
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-primary-foreground/70">
              সঠিক সাইজ নির্বাচন করুন — আমাদের বিস্তারিত সাইজ চার্ট দেখুন
            </p>
          </div>
        </section>

        {/* Breadcrumb */}
        <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs">
            <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">Home</Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-foreground">Size Guide</span>
          </nav>
        </div>

        <section className="font-bengali mx-auto max-w-[1280px] px-4 pb-20 sm:px-6">
          {/* How to measure */}
          <div className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <Ruler className="h-5 w-5 text-foreground" />
              </span>
              <h2 className="font-display text-xl font-bold text-foreground">কিভাবে মাপবেন</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tips.map((tip) => (
                <div key={tip.title} className="rounded-lg border border-border bg-card p-5">
                  <h3 className="mb-2 text-sm font-semibold text-foreground">{tip.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Men's chart */}
          <div className="mb-12">
            <h2 className="font-display mb-4 text-lg font-bold text-foreground">পুরুষদের সাইজ চার্ট (ইঞ্চি)</h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary text-foreground">
                    <th className="px-5 py-3 text-left font-semibold">সাইজ</th>
                    <th className="px-5 py-3 text-left font-semibold">বুক (Chest)</th>
                    <th className="px-5 py-3 text-left font-semibold">কোমর (Waist)</th>
                    <th className="px-5 py-3 text-left font-semibold">হিপ (Hip)</th>
                    <th className="px-5 py-3 text-left font-semibold">কাঁধ (Shoulder)</th>
                  </tr>
                </thead>
                <tbody>
                  {menSizes.map((row, i) => (
                    <tr key={row.size} className={i % 2 === 0 ? "bg-background" : "bg-secondary/30"}>
                      <td className="px-5 py-3 font-bold text-foreground">{row.size}</td>
                      <td className="px-5 py-3 text-muted-foreground">{row.chest}</td>
                      <td className="px-5 py-3 text-muted-foreground">{row.waist}</td>
                      <td className="px-5 py-3 text-muted-foreground">{row.hip}</td>
                      <td className="px-5 py-3 text-muted-foreground">{row.shoulder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Women's chart */}
          <div className="mb-12">
            <h2 className="font-display mb-4 text-lg font-bold text-foreground">মহিলাদের সাইজ চার্ট (ইঞ্চি)</h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary text-foreground">
                    <th className="px-5 py-3 text-left font-semibold">সাইজ</th>
                    <th className="px-5 py-3 text-left font-semibold">বুক (Chest)</th>
                    <th className="px-5 py-3 text-left font-semibold">কোমর (Waist)</th>
                    <th className="px-5 py-3 text-left font-semibold">হিপ (Hip)</th>
                    <th className="px-5 py-3 text-left font-semibold">কাঁধ (Shoulder)</th>
                  </tr>
                </thead>
                <tbody>
                  {womenSizes.map((row, i) => (
                    <tr key={row.size} className={i % 2 === 0 ? "bg-background" : "bg-secondary/30"}>
                      <td className="px-5 py-3 font-bold text-foreground">{row.size}</td>
                      <td className="px-5 py-3 text-muted-foreground">{row.chest}</td>
                      <td className="px-5 py-3 text-muted-foreground">{row.waist}</td>
                      <td className="px-5 py-3 text-muted-foreground">{row.hip}</td>
                      <td className="px-5 py-3 text-muted-foreground">{row.shoulder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Note */}
          <div className="rounded-lg border border-gold/30 bg-gold/5 p-6">
            <h3 className="mb-2 text-sm font-bold text-foreground">📌 গুরুত্বপূর্ণ তথ্য</h3>
            <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
              <li>• সাইজ চার্টটি আনুমানিক এবং পণ্যভেদে সামান্য তারতম্য হতে পারে।</li>
              <li>• দুই সাইজের মাঝে পড়লে বড় সাইজটি নির্বাচন করুন।</li>
              <li>• Slim fit পণ্যে এক সাইজ বড় অর্ডার করার পরামর্শ দেওয়া হয়।</li>
              <li>• সাইজ সংক্রান্ত যেকোনো প্রশ্নে আমাদের সাথে যোগাযোগ করুন।</li>
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
