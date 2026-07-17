import { getHeader } from "@/lib/content"
import { HeaderEditor } from "@/components/admin/editors/header-editor"

export const dynamic = "force-dynamic"

export default async function HeaderPage() {
  const header = await getHeader()
  return <HeaderEditor initial={header} />
}
