"use client"

import dynamic from "next/dynamic"

const ChatWidget = dynamic(
  () => import("@/components/chat-widget").then((m) => m.ChatWidget),
  { ssr: false, loading: () => null }
)

export function LazyChatWidget() {
  return <ChatWidget />
}
