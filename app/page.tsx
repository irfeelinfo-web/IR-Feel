import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Hero } from "@/components/home/hero"
import { CategoryGrid } from "@/components/home/category-grid"
import { FeaturedProducts } from "@/components/home/featured-products"
import { PromoBanners } from "@/components/home/promo-banners"
import { FeaturesStrip } from "@/components/home/features-strip"
import { NewArrivals } from "@/components/home/new-arrivals"
import { CustomerReviews } from "@/components/home/customer-reviews"
import { getHome } from "@/lib/content"

export const revalidate = 60

export default async function HomePage() {
  const home = await getHome()
  return (
    <>
      <SiteHeader active="home" />
      <main>
        <Hero slides={home.heroSlides} />
        <CategoryGrid />
        <FeaturedProducts heading={home.featuredHeading} subheading={home.featuredSubheading} />
        <PromoBanners banners={home.promoBanners} />
        <NewArrivals heading={home.newArrivalsHeading} subheading={home.newArrivalsSubheading} />
        <CustomerReviews
          reviews={home.reviews}
          heading={home.reviewsHeading}
          ratingText={home.reviewsRatingText}
        />
        <FeaturesStrip features={home.features} />
      </main>
      <SiteFooter />
    </>
  )
}
