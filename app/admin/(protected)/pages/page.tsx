import { getPages } from "@/lib/content"
import { PagesEditor } from "@/components/admin/editors/pages-editor"

export const dynamic = "force-dynamic"

export default async function PagesAdminPage() {
  const pages = await getPages()
  return <PagesEditor initial={pages} />
}
