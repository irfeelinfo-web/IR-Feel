import { NextResponse } from "next/server"
import { getSettings } from "@/lib/content"
import { getLoggedInCustomer } from "@/lib/customer-auth"
import { getOne, query, run } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const debug: any = {
    steps: [],
  }

  try {
    debug.steps.push("Checking raw DB connection via lib/db.ts query...")
    await query("SELECT 1")
    debug.steps.push("Raw DB query Success!")
  } catch (e: any) {
    debug.steps.push(`Raw DB query Error: ${e.message}`)
    debug.error = e.message
    debug.stack = e.stack
    return NextResponse.json(debug)
  }

  try {
    debug.steps.push("Calling getSettings...")
    await getSettings()
    debug.steps.push("getSettings Success!")
  } catch (e: any) {
    debug.steps.push(`getSettings Error: ${e.message}`)
    debug.error = e.message
    debug.stack = e.stack
    return NextResponse.json(debug)
  }

  try {
    debug.steps.push("Calling getLoggedInCustomer...")
    await getLoggedInCustomer()
    debug.steps.push("getLoggedInCustomer Success!")
  } catch (e: any) {
    debug.steps.push(`getLoggedInCustomer Error: ${e.message}`)
    debug.error = e.message
    debug.stack = e.stack
    return NextResponse.json(debug)
  }

  debug.steps.push("All clear!")
  return NextResponse.json(debug)
}
