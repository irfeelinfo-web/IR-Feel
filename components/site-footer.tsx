import { getFooter, getSettings } from "@/lib/content"
import { SiteFooterClient } from "./site-footer-client"

export async function SiteFooter() {
  const [footer, settings] = await Promise.all([getFooter(), getSettings()])
  return <SiteFooterClient footer={footer} settings={settings} />
}
