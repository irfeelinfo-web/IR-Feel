import "server-only"
import { query, run } from "./db"

export type ChatMessage = {
  id: number
  session_id: string
  sender_name: string
  sender_phone: string
  message: string
  is_admin: number
  is_read: number
  created_at: string
}

export type ChatSession = {
  session_id: string
  sender_name: string
  sender_phone: string
  last_message: string
  last_at: string
  unread: number
  total: number
}

/** Get all messages for a specific session, ordered chronologically */
export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  return query<ChatMessage>(
    `SELECT id, session_id, sender_name, sender_phone, message, is_admin, is_read, created_at
     FROM chat_messages
     WHERE session_id = ?
     ORDER BY created_at ASC`,
    [sessionId],
  )
}

/** Get all chat sessions grouped, for admin panel */
export async function getAllChatSessions(): Promise<ChatSession[]> {
  return query<ChatSession>(
    `SELECT
       session_id,
       MAX(CASE WHEN is_admin = 0 THEN sender_name ELSE NULL END) AS sender_name,
       MAX(CASE WHEN is_admin = 0 THEN sender_phone ELSE NULL END) AS sender_phone,
       (SELECT message FROM chat_messages m2 WHERE m2.session_id = cm.session_id ORDER BY m2.created_at DESC LIMIT 1) AS last_message,
       MAX(created_at) AS last_at,
       SUM(CASE WHEN is_admin = 0 AND is_read = 0 THEN 1 ELSE 0 END) AS unread,
       COUNT(*) AS total
     FROM chat_messages cm
     GROUP BY session_id
     ORDER BY MAX(created_at) DESC`,
  )
}

/** Get total unread message count (visitor messages only) */
export async function getUnreadChatCount(): Promise<number> {
  const row = await query<{ c: number }>(
    `SELECT COUNT(*) as c FROM chat_messages WHERE is_admin = 0 AND is_read = 0`,
  )
  return row[0]?.c ?? 0
}

/** Mark all visitor messages in a session as read */
export async function markSessionRead(sessionId: string): Promise<void> {
  await run(
    `UPDATE chat_messages SET is_read = 1 WHERE session_id = ? AND is_admin = 0 AND is_read = 0`,
    [sessionId],
  )
}

/** Insert a new chat message */
export async function insertChatMessage(
  sessionId: string,
  senderName: string,
  senderPhone: string,
  message: string,
  isAdmin: boolean,
): Promise<ChatMessage> {
  await run(
    `INSERT INTO chat_messages (session_id, sender_name, sender_phone, message, is_admin)
     VALUES (?, ?, ?, ?, ?)`,
    [sessionId, senderName, senderPhone, message, isAdmin ? 1 : 0],
  )
  // Return the just-inserted row
  const rows = await query<ChatMessage>(
    `SELECT * FROM chat_messages WHERE session_id = ? ORDER BY id DESC LIMIT 1`,
    [sessionId],
  )
  return rows[0]
}

/** Delete all messages for a session */
export async function deleteChatSession(sessionId: string): Promise<void> {
  await run(`DELETE FROM chat_messages WHERE session_id = ?`, [sessionId])
}
