import { getPayment } from "@/lib/content"
import { PaymentEditor } from "@/components/admin/editors/payment-editor"

export const dynamic = "force-dynamic"

export default async function PaymentSettingsPage() {
  const payment = await getPayment()
  return <PaymentEditor initial={payment} />
}
