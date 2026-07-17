import { Star, BadgeCheck, Quote } from "lucide-react"
import { SectionHeading } from "@/components/section-heading"
import type { ReviewItem } from "@/lib/site-config"

type Review = ReviewItem

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="relative flex w-[300px] shrink-0 flex-col gap-4 rounded-2xl glass-order-card p-6 sm:w-[360px]">
      <Quote className="absolute right-5 top-5 h-8 w-8 text-gold/20" aria-hidden />
      <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < review.rating ? "fill-gold text-gold" : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
        &ldquo;{review.text}&rdquo;
      </p>
      <div className="mt-auto flex items-center gap-3 pt-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {review.initials}
        </span>
        <div className="flex flex-col">
          <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
            {review.name}
            <BadgeCheck className="h-4 w-4 text-gold" aria-hidden />
          </span>
          <span className="text-xs text-muted-foreground">{review.role}</span>
        </div>
      </div>
    </article>
  )
}

export function CustomerReviews({
  reviews,
  heading = "WHAT OUR CUSTOMERS SAY",
  ratingText = "4.9/5 from 2,400+ happy customers",
}: {
  reviews: Review[]
  heading?: string
  ratingText?: string
}) {
  if (reviews.length === 0) return null
  const loop = [...reviews, ...reviews]

  return (
    <section className="overflow-hidden bg-secondary/40 py-14">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <SectionHeading>{heading}</SectionHeading>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-gold text-gold" />
            ))}
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {ratingText}
          </span>
        </div>
      </div>

      <div className="marquee-pause relative mt-10">
        {/* Edge fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-secondary/40 to-transparent sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-secondary/40 to-transparent sm:w-28" />

        <div className="marquee-track flex w-max gap-5">
          {loop.map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </div>
      </div>
    </section>
  )
}
