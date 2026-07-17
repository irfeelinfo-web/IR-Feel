import { getFooter } from "@/lib/content"
import { FooterEditor } from "@/components/admin/editors/footer-editor"

export const dynamic = "force-dynamic"

export default async function FooterPage() {
  const footer = await getFooter()
  return <FooterEditor initial={footer} />
}
