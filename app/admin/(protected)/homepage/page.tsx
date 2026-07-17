import { getHome } from "@/lib/content"
import { HomeEditor } from "@/components/admin/editors/home-editor"

export const dynamic = "force-dynamic"

export default async function HomepageAdminPage() {
  const home = await getHome()
  return <HomeEditor initial={home} />
}
