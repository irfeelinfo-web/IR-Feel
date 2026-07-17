"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, X, ShoppingBag } from "lucide-react"
import { bdt } from "@/lib/products"
import { useWishlist } from "@/lib/wishlist-context"
import { useCart } from "@/lib/cart-context"

export function WishlistContent() {
  const { items, remove, clear } = useWishlist()
  const { addItem, openCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Heart className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
        </span>
        <h2 className="mt-6 font-display text-xl font-semibold text-foreground">
          Your wishlist is empty
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Save your favourite items here by tapping the heart on any product.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-xs font-semibold tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"} saved
        </p>
        <button
          onClick={clear}
          className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-xl border border-border bg-card"
          >
            <button
              onClick={() => remove(item.id)}
              aria-label={`Remove ${item.name} from wishlist`}
              className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
            >
              <X className="h-4 w-4" />
            </button>

            <Link href={`/product/${item.id}`} className="block">
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </Link>

            <div className="p-3">
              <Link href={`/product/${item.id}`}>
                <h3 className="line-clamp-1 text-sm font-medium text-foreground transition-colors hover:text-primary">
                  {item.name}
                </h3>
              </Link>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{bdt(item.price)}</span>
                {item.oldPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {bdt(item.oldPrice)}
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  addItem({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    size: "M",
                    color: "Default",
                  })
                  openCart()
                }}
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-[11px] font-semibold tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                ADD TO CART
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
