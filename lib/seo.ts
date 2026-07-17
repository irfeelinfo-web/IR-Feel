import type { Metadata } from "next"
import { getSettings } from "./content"

/**
 * Central SEO configuration for IR Feel.
 * The canonical site URL can be overridden with NEXT_PUBLIC_SITE_URL
 * (set this to your production domain, e.g. https://www.irfeel.info).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.irfeel.info"
).replace(/\/$/, "")

export const BRAND_NAME = "IR Feel"
export const BRAND_TAGLINE =
  "Trendy premium fashion from IR Feel that elevates your everyday style."
export const BRAND_EMAIL = "irfeel.info@gmail.com"

export const DEFAULT_OG_IMAGE = "/og-image.png"

export const SITE_KEYWORDS = [
  "IR Feel",
  "IR Feel fashion",
  "IR Feel clothing",
  "premium fashion Bangladesh",
  "trendy clothing",
  "men fashion",
  "women fashion",
  "streetwear",
  "hoodies",
  "jackets",
  "denim",
  "accessories",
  "online clothing store Bangladesh",
  "ফ্যাশন",
  "প্রিমিয়াম পোশাক",
]

/** Build an absolute URL from a path. */
export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

type BuildMetadataOptions = {
  title?: string
  description?: string
  path?: string
  images?: string[]
  keywords?: string[]
  type?: "website" | "article"
  noIndex?: boolean
}

/**
 * Build consistent, professional metadata for any page.
 * Falls back to brand-level defaults (and DB-stored settings) when values are omitted.
 */
export async function buildMetadata(
  opts: BuildMetadataOptions = {},
): Promise<Metadata> {
  let settings: import("./site-config").SiteSettings | null = null
  try { settings = getSettings() } catch { /* fallback to null */ }
  const brand = settings?.brandName?.trim() || BRAND_NAME
  const baseDescription =
    settings?.metaDescription?.trim() || BRAND_TAGLINE

  const title = opts.title ?? `${brand} — Premium Fashion & Streetwear`
  const description = opts.description ?? baseDescription
  const path = opts.path ?? "/"
  const url = absoluteUrl(path)
  const images = (opts.images && opts.images.length > 0
    ? opts.images
    : [DEFAULT_OG_IMAGE]
  ).map((img) => absoluteUrl(img))

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords: opts.keywords ?? SITE_KEYWORDS,
    applicationName: brand,
    authors: [{ name: brand }],
    creator: brand,
    publisher: brand,
    alternates: {
      canonical: path,
    },
    robots: opts.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: opts.type ?? "website",
      siteName: brand,
      title,
      description,
      url,
      locale: "en_US",
      alternateLocale: ["bn_BD"],
      images: images.map((image) => ({
        url: image,
        width: 1200,
        height: 630,
        alt: title,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  }
}
