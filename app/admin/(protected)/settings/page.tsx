import { getSettings, getAnnouncement } from "@/lib/content"
import { SettingsEditor } from "@/components/admin/editors/settings-editor"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const [settings, announcement] = await Promise.all([getSettings(), getAnnouncement()])
  return <SettingsEditor initialSettings={settings} initialAnnouncement={announcement} />
}
