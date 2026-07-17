import { NextRequest, NextResponse } from "next/server"
import { getSessionMessages, insertChatMessage } from "@/lib/chat"
import { checkRateLimit, generateFingerprint } from "@/lib/rate-limit"

/** GET /api/chat?sessionId=xxx — fetch messages for a session (polling) */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId")
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 })
  }
  try {
    const messages = await getSessionMessages(sessionId)
    return NextResponse.json({ messages })
  } catch (err) {
    console.error("[api/chat GET]", (err as Error).message)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

/** POST /api/chat — send a new chat message (visitor side) */
export async function POST(req: NextRequest) {
  const fingerprint = await generateFingerprint()
  if (!await checkRateLimit(fingerprint, 10, 60000)) {
    return NextResponse.json(
      { error: "Too many messages. Please wait." },
      { status: 429 },
    )
  }

  try {
    const body = await req.json()
    const { sessionId, name, phone, message } = body as {
      sessionId: string
      name: string
      phone: string
      message: string
    }
    if (!sessionId || !name || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }
    const msg = await insertChatMessage(sessionId, name, phone || "", message, false)
    return NextResponse.json({ ok: true, message: msg })
  } catch (err) {
    console.error("[api/chat POST]", (err as Error).message)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
