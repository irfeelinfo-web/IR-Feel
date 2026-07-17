import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBanner } from "@/components/page-banner"
import { ShopContent } from "@/components/shop/shop-content"
import { getAllProducts } from "@/lib/products-db"
import type { ShopCategory } from "@/lib/products"
import { buildMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"

type CategoryConfig = {
  title: string
  navKey: string
  description: string
  image: string
  bannerBg?: string
}

const categories: Record<string, CategoryConfig> = {
  men: {
    title: "Men",
    navKey: "men",
    description: "Elevate your everyday wardrobe with premium menswear built for comfort and style.",
    image: "/images/category-men.png",
    bannerBg: "/images/banner-bg-men.jpg",
  },
  women: {
    title: "Women",
    navKey: "women",
    description: "Discover refined essentials and statement pieces designed for the modern woman.",
    image: "/images/category-women.png",
  },
  kids: {
    title: "Kids",
    navKey: "kids",
    description: "Soft, durable and playful styles that keep up with every little adventure.",
    image: "/images/category-kids.png",
  },
  accessories: {
    title: "Accessories",
    navKey: "accessories",
    description: "Finish every look with our curated selection of premium accessories.",
    image: "/images/category-accessories.png",
  },
}


export function generateStaticParams() {
  return Object.keys(categories).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const config = categories[slug] || {
    title: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "),
    navKey: slug,
    description: `Discover our premium ${slug.replace(/-/g, " ")} collection.`,
    image: "/placeholder.svg",
  }
  return buildMetadata({
    title: `${config.title}'s Fashion — Premium ${config.title} Clothing`,
    description: config.description,
    path: `/category/${slug}`,
    images: [config.image],
  })
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const config = categories[slug] || {
    title: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "),
    navKey: slug,
    description: `Discover our premium ${slug.replace(/-/g, " ")} collection.`,
    image: "/placeholder.svg",
    bannerBg: "/placeholder.svg",
  }

  const products = await getAllProducts()

  return (
    <>
      <SiteHeader active={config.navKey} />
      <main>
        {/* Category banner */}
        <PageBanner
          title={config.title}
          description={config.description}
          tagline="Collection"
          backgroundImage={config.bannerBg ?? `/images/banner-bg-${slug}.png`}
        >
          <div className="relative h-28 w-28 sm:h-36 sm:w-36">
            <Image
              src={config.image || "/placeholder.svg"}
              alt={`${config.title} collection`}
              fill
              className="object-cover object-top"
              sizes="(max-width: 640px) 112px, 144px"
            />
          </div>
        </PageBanner>

        {/* Breadcrumb */}
        <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs">
            <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <Link href="/shop" className="text-muted-foreground transition-colors hover:text-foreground">
              Shop
            </Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-foreground">{config.title}</span>
          </nav>
        </div>

        {/* Category grid + filters */}
        <section className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6">
          <Suspense fallback={<div className="py-20 text-center font-semibold">Loading...</div>}>
            <ShopContent products={products} lockedCategory={config.title} />
          </Suspense>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
