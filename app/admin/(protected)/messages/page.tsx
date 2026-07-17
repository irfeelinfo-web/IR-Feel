import { getAllChatSessions } from "@/lib/chat"
import { ChatManager } from "@/components/admin/chat-manager"

export const dynamic = "force-dynamic"

export default async function AdminMessagesPage() {
  const sessions = await getAllChatSessions()
  return <ChatManager sessions={sessions} />
}
