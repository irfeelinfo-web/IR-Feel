import "server-only"
import { cache } from "react"
import { getOne } from "./db"
import {
  type SiteSettings,
  type AnnouncementConfig,
  type HeaderConfig,
  type FooterConfig,
  type HomeConfig,
  type PagesConfig,
  type PaymentConfig,
  defaultSettings,
  defaultAnnouncement,
  defaultHeader,
  defaultFooter,
  defaultHome,
  defaultPages,
  defaultPayment,
  mergeDefaults,
} from "./site-config"

export type SectionKey = "settings" | "announcement" | "header" | "footer" | "home" | "pages" | "payment"

function readSection<T>(key: SectionKey, defaults: T): T {
  try {
    const row = getOne<{ data: string }>(
      "SELECT data FROM site_content WHERE section = ?",
      [key],
    )
    if (row) return mergeDefaults(defaults, JSON.parse(row.data))
  } catch {
    // DB read failed — return defaults
  }
  return defaults
}

export const getSettings = cache((): SiteSettings => readSection("settings", defaultSettings))
export const getAnnouncement = cache((): AnnouncementConfig =>
  readSection("announcement", defaultAnnouncement),
)
export const getHeader = cache((): HeaderConfig => readSection("header", defaultHeader))
export const getFooter = cache((): FooterConfig => readSection("footer", defaultFooter))
export const getHome = cache((): HomeConfig => readSection("home", defaultHome))
export const getPages = cache((): PagesConfig => readSection("pages", defaultPages))
export const getPayment = cache((): PaymentConfig => readSection("payment", defaultPayment))

/** Read any section's raw stored data merged with its defaults — used by the admin editors. */
export function getSectionData(key: SectionKey): any {
  switch (key) {
    case "settings":
      return getSettings()
    case "announcement":
      return getAnnouncement()
    case "header":
      return getHeader()
    case "footer":
      return getFooter()
    case "home":
      return getHome()
    case "pages":
      return getPages()
    case "payment":
      return getPayment()
  }
}