import { getSettings, getAnnouncement, getHeader } from "@/lib/content"
import { SiteHeaderClient } from "./site-header-client"

export async function SiteHeader({ active = "home" }: { active?: string }) {
  const [settings, announcement, header] = await Promise.all([
    getSettings(),
    getAnnouncement(),
    getHeader(),
  ])
  return (
    <SiteHeaderClient
      active={active}
      settings={settings}
      announcement={announcement}
      nav={header.nav}
    />
  )
}
