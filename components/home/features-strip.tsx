import { Truck, RotateCcw, ShieldCheck, Headphones, Gift, Tag, Clock, Star, type LucideIcon } from "lucide-react"
import type { FeatureItem } from "@/lib/site-config"

const iconMap: Record<string, LucideIcon> = {
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  Gift,
  Tag,
  Clock,
  Star,
}

export function FeaturesStrip({ features }: { features: FeatureItem[] }) {
  if (features.length === 0) return null
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid grid-cols-1 gap-6 rounded-2xl glass-order-card px-6 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border/40">
        {features.map((f) => {
          const Icon = iconMap[f.icon] ?? Truck
          return (
            <div key={f.title} className="flex items-center gap-4 lg:justify-center lg:px-4">
              <Icon className="h-8 w-8 shrink-0 text-gold" strokeWidth={1.25} />
              <div>
                <p className="text-xs font-semibold tracking-widest text-foreground">{f.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
