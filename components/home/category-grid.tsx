import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getHome } from "@/lib/content"

export async function CategoryGrid() {
  const home = await getHome()
  const categories = home.categories.filter((c) => c.enabled !== false)
  if (categories.length === 0) return null
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-xl bg-muted"
          >
            <Image
              src={cat.image || "/placeholder.svg"}
              alt={cat.name}
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute bottom-2 left-2 z-10 rounded-lg p-2 px-3 transition-all duration-350 ease-out group-hover:bottom-2.5 bg-white/75 dark:bg-black/75 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.5)] sm:bottom-3.5 sm:left-3.5 sm:p-3.5 sm:pr-6 sm:rounded-xl">
              <h3 className="font-display text-[11px] font-bold tracking-wide text-foreground sm:text-sm">
                {cat.name}
              </h3>
              <span className="mt-0.5 flex items-center gap-1 text-[8px] font-semibold tracking-widest text-foreground/85 sm:text-[9px]">
                SHOP NOW
                <ArrowRight className="h-2.5 w-2.5 transition-transform duration-300 group-hover:translate-x-1 sm:h-3 sm:w-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
