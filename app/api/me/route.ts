import { NextResponse } from "next/server"
import { getLoggedInCustomer } from "@/lib/customer-auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const customer = await getLoggedInCustomer()
    return NextResponse.json({ customer })
  } catch {
    return NextResponse.json({ customer: null })
  }
}
