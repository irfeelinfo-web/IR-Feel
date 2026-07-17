import { NextResponse } from "next/server"
import { getLoggedInCustomer } from "@/lib/customer-auth"

export async function GET() {
  try {
    const customer = await getLoggedInCustomer()
    return NextResponse.json({ customer })
  } catch {
    return NextResponse.json({ customer: null })
  }
}
