import type { MetadataRoute } from "next"
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/seo"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND_NAME} — Premium Fashion & Streetwear`,
    short_name: BRAND_NAME,
    description: BRAND_TAGLINE,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#111111",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-light-32x32.png", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  }
}
