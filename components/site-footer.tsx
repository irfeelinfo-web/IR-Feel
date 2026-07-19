import { getFooter, getSettings } from "@/lib/content"
import { defaultFooter, defaultSettings } from "@/lib/site-config"
import { SiteFooterClient } from "./site-footer-client"

export async function SiteFooter() {
  let footer, settings
  try {
    ;[footer, settings] = await Promise.all([getFooter(), getSettings()])
  } catch {
    footer = defaultFooter
    settings = defaultSettings
  }
  return <SiteFooterClient footer={footer} settings={settings} />
}
