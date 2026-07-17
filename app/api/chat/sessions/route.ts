import { NextResponse } from "next/server"
import { getAllChatSessions, getSessionMessages, getUnreadChatCount } from "@/lib/chat"
import { isAuthenticated } from "@/lib/admin-auth"

/** GET /api/chat/sessions — admin-only: get all chat sessions, or a single session's messages */
export async function GET(req: Request) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(req.url)
  const sessionId = url.searchParams.get("sessionId")

  try {
    if (sessionId) {
      // Return messages for a specific session
      const messages = getSessionMessages(sessionId)
      return NextResponse.json({ messages })
    }
    // Return all sessions overview
    const sessions = getAllChatSessions()
    const unread = getUnreadChatCount()
    return NextResponse.json({ sessions, unread })
  } catch (err) {
    console.error("[api/chat/sessions GET]", (err as Error).message)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
