import { BadgeCheck, Truck, ShieldCheck, RotateCcw } from "lucide-react"

const features = [
  {
    icon: BadgeCheck,
    title: "অরিজিনাল প্রোডাক্ট",
    desc: "সব পণ্য ১০০% অরিজিনাল",
  },
  {
    icon: Truck,
    title: "ফ্রি ডেলিভারি",
    desc: "৳ ৯৯৯+ অর্ডারে ফ্রি ডেলিভারি",
  },
  {
    icon: ShieldCheck,
    title: "নিরাপদ পেমেন্ট",
    desc: "আপনার পেমেন্ট ১০০% নিরাপদ",
  },
  {
    icon: RotateCcw,
    title: "সহজ রিটার্ন",
    desc: "৭ দিনের মধ্যে রিটার্ন সুবিধা",
  },
]

export function CheckoutFeatures() {
  return (
    <section className="font-bengali border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="flex items-center justify-center gap-3 text-center sm:justify-start sm:text-left">
            <f.icon className="h-8 w-8 shrink-0 text-foreground" strokeWidth={1.5} />
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
