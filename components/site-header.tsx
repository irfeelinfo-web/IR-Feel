import { getSettings, getAnnouncement, getHeader } from "@/lib/content"
import { defaultSettings, defaultAnnouncement, defaultHeader } from "@/lib/site-config"
import { SiteHeaderClient } from "./site-header-client"

export async function SiteHeader({ active = "home" }: { active?: string }) {
  let settings, announcement, header
  try {
    ;[settings, announcement, header] = await Promise.all([
      getSettings(),
      getAnnouncement(),
      getHeader(),
    ])
  } catch {
    settings = defaultSettings
    announcement = defaultAnnouncement
    header = defaultHeader
  }
  return (
    <SiteHeaderClient
      active={active}
      settings={settings}
      announcement={announcement}
      nav={header.nav}
    />
  )
}
