"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay } from "swiper/modules"
import "swiper/css"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/products"

export function RelatedProducts({
  products,
  currentId,
}: {
  products: Product[]
  currentId?: string
}) {
  const items = currentId ? products.filter((p) => p.id !== currentId) : products
  if (items.length === 0) return null
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-16 sm:px-6">
      <h2 className="text-center font-display text-xl font-bold tracking-widest text-foreground">
        YOU MIGHT ALSO LIKE
      </h2>
      <div className="mt-3 flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="mt-8">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={20}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          breakpoints={{
            0: { slidesPerView: 2 },
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 5 },
          }}
        >
          {items.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} variant="simple" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
