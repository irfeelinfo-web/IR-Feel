import { NextResponse } from "next/server"
import { destroyCustomerSession } from "@/lib/customer-auth"

export async function POST() {
  try {
    await destroyCustomerSession()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
