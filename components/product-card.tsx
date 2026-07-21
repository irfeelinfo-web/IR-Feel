"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart } from "lucide-react"
import { bdt, type Product } from "@/lib/products"
import { useCart } from "@/lib/cart-context"

function Badge({ badge }: { badge: NonNullable<Product["badge"]> }) {
  const styles =
    badge === "NEW"
      ? "bg-primary text-primary-foreground"
      : "bg-gold text-primary-foreground"
  return (
    <span
      className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wider ${styles}`}
    >
      {badge}
    </span>
  )
}

function Price({ price, oldPrice }: { price: number; oldPrice?: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-foreground">{bdt(price)}</span>
      {oldPrice && (
        <span className="text-sm text-muted-foreground line-through">{bdt(oldPrice)}</span>
      )}
    </div>
  )
}

export function ProductCard({
  product,
  variant = "simple",
  priority = false,
}: {
  product: Product
  variant?: "simple" | "featured"
  priority?: boolean
}) {
  const { addItem, openCart } = useCart()
  const router = useRouter()
  const href = `/product/${product.id}`

  function addToCart() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: product.sizes?.[0] ?? "",
      color: product.colors?.[0] ?? "",
    })
  }

  // Add the item and go straight to the order/checkout page.
  function handleOrderNow() {
    addToCart()
    router.push("/checkout")
  }

  // Add the item to the cart and open the drawer so the user can keep shopping.
  function handleAddToCart() {
    addToCart()
    openCart()
  }

  return (
    <div className="group relative flex flex-col">
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
        <Link href={href} className="absolute inset-0 block">
          {product.badge && <Badge badge={product.badge} />}
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            priority={priority}
            className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>
      </div>

      <div className="pt-3">
        <Link href={href}>
          <h3 className="text-sm font-medium text-foreground transition-colors hover:text-gold">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1">
          <Price price={product.price} oldPrice={product.oldPrice} />
        </div>

        <div className="mt-3 flex items-stretch gap-2">
          <button
            onClick={handleOrderNow}
            className="flex-1 rounded-lg border border-border/40 bg-white/40 dark:bg-black/40 py-2.5 text-[11px] font-bold tracking-widest text-foreground backdrop-blur-md transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/10"
            style={{
              boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
            }}
          >
            ORDER NOW
          </button>
          <button
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            className="flex w-11 items-center justify-center rounded-lg border border-gold/40 bg-white/40 dark:bg-black/40 text-gold backdrop-blur-md transition-all duration-300 hover:bg-gold hover:text-white hover:border-gold hover:shadow-lg hover:shadow-gold/15"
            style={{
              boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
            }}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
