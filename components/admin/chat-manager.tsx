"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  MessageCircle,
  Send,
  Loader2,
  Search,
  Trash2,
  Phone,
  User,
  Clock,
  ChevronLeft,
  X,
} from "lucide-react"
import { adminReplyAction, deleteChatSessionAction, markChatReadAction } from "@/app/admin/actions"
import type { ChatSession } from "@/lib/chat"
import { PageTitle } from "@/components/admin/ui"
import { useToast } from "@/components/admin/toast-context"

type Message = {
  id: number
  session_id: string
  sender_name: string
  sender_phone: string
  message: string
  is_admin: number
  is_read: number
  created_at: string
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso.replace(" ", "T") + "Z")
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
  } catch {
    return ""
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso.replace(" ", "T") + "Z").toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function timeAgo(iso: string) {
  try {
    const now = Date.now()
    const then = new Date(iso.replace(" ", "T") + "Z").getTime()
    const diff = Math.floor((now - then) / 1000)
    if (diff < 60) return "এইমাত্র"
    if (diff < 3600) return `${Math.floor(diff / 60)} মিনিট আগে`
    if (diff < 86400) return `${Math.floor(diff / 3600)} ঘণ্টা আগে`
    return `${Math.floor(diff / 86400)} দিন আগে`
  } catch {
    return iso
  }
}

export function ChatManager({ sessions: initialSessions }: { sessions: ChatSession[] }) {
  const router = useRouter()
  const toast = useToast()
  const [sessions, setSessions] = useState(initialSessions)
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const replyInputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setSessions(initialSessions)
  }, [initialSessions])

  const filtered = useMemo(() => {
    if (!search.trim()) return sessions
    const q = search.toLowerCase()
    return sessions.filter(
      (s) =>
        s.sender_name.toLowerCase().includes(q) ||
        s.sender_phone.includes(q) ||
        s.last_message.toLowerCase().includes(q),
    )
  }, [sessions, search])

  const activeSessionData = useMemo(
    () => sessions.find((s) => s.session_id === activeSession),
    [sessions, activeSession],
  )

  /* ── Scroll to bottom ── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  /* ── Fetch messages for active session ── */
  const fetchSessionMessages = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/chat/sessions?sessionId=${encodeURIComponent(sessionId)}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages ?? [])
      }
    } catch { /* ignore */ }
  }, [])

  /* ── Refresh sessions list ── */
  const refreshSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/sessions")
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions ?? [])
      }
    } catch { /* ignore */ }
  }, [])

  /* ── Select a session ── */
  async function selectSession(sessionId: string) {
    setActiveSession(sessionId)
    setLoadingMsgs(true)
    setMessages([])
    await fetchSessionMessages(sessionId)
    setLoadingMsgs(false)
    // Mark as read
    await markChatReadAction(sessionId)
    // Update local unread count
    setSessions((prev) =>
      prev.map((s) => (s.session_id === sessionId ? { ...s, unread: 0 } : s)),
    )
    replyInputRef.current?.focus()
  }

  /* ── Polling ── */
  useEffect(() => {
    if (activeSession) {
      pollRef.current = setInterval(async () => {
        await fetchSessionMessages(activeSession)
        await refreshSessions()
      }, 6000)
      return () => {
        if (pollRef.current) clearInterval(pollRef.current)
      }
    }
  }, [activeSession, fetchSessionMessages, refreshSessions])

  /* ── Also poll sessions when no conversation is open ── */
  useEffect(() => {
    if (!activeSession) {
      const timer = setInterval(refreshSessions, 10000)
      return () => clearInterval(timer)
    }
  }, [activeSession, refreshSessions])

  /* ── Send admin reply ── */
  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault()
    const msg = reply.trim()
    if (!msg || !activeSession || sending) return
    setSending(true)
    try {
      const res = await adminReplyAction(activeSession, msg)
      if (res.ok) {
        setReply("")
        await fetchSessionMessages(activeSession)
        replyInputRef.current?.focus()
      } else {
        toast.error(res.error || "রিপ্লাই পাঠানো ব্যর্থ হয়েছে।")
      }
    } catch {
      toast.error("রিপ্লাই পাঠানো ব্যর্থ হয়েছে।")
    }
    setSending(false)
  }

  /* ── Delete session ── */
  async function handleDelete(sessionId: string) {
    setDeleting(true)
    try {
      const res = await deleteChatSessionAction(sessionId)
      if (res.ok) {
        toast.success("চ্যাট সেশন সফলভাবে মুছে ফেলা হয়েছে!")
        setSessions((prev) => prev.filter((s) => s.session_id !== sessionId))
        if (activeSession === sessionId) {
          setActiveSession(null)
          setMessages([])
        }
        router.refresh()
      } else {
        toast.error(res.error || "ডিলিট ব্যর্থ হয়েছে।")
      }
    } catch {
      toast.error("ডিলিট ব্যর্থ হয়েছে।")
    }
    setDeleting(false)
    setConfirmDelete(null)
  }

  const totalUnread = sessions.reduce((sum, s) => sum + s.unread, 0)

  return (
    <div>
      <PageTitle
        title="লাইভ চ্যাট"
        description={`ওয়েবসাইট ভিজিটরদের চ্যাট ম্যানেজ করুন। ${totalUnread > 0 ? `(${totalUnread} টি অপঠিত)` : ""}`}
      />

      <div className="mt-4 flex overflow-hidden rounded-2xl border border-border bg-card" style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}>
        {/* ── Left: Session List ── */}
        <div
          className={`flex w-full flex-col border-r border-border lg:w-80 lg:shrink-0 ${
            activeSession ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Search */}
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
                className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground outline-none focus:border-foreground"
              />
            </div>
          </div>

          {/* Sessions list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <MessageCircle className="h-8 w-8 text-muted-foreground" strokeWidth={1.4} />
                <p className="text-xs text-muted-foreground">
                  {sessions.length === 0
                    ? "এখনো কোনো চ্যাট আসেনি।"
                    : "সার্চ ফিল্টারে কোনো চ্যাট মিলছে না।"}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((session) => (
                  <li key={session.session_id}>
                    <button
                      type="button"
                      onClick={() => selectSession(session.session_id)}
                      className={`flex w-full items-start gap-3 p-3.5 text-left transition-colors hover:bg-muted/50 ${
                        activeSession === session.session_id
                          ? "bg-primary/5 border-l-2 border-l-primary"
                          : ""
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold text-white">
                        {session.sender_name.charAt(0).toUpperCase()}
                        {session.unread > 0 && (
                          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                            {session.unread}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${session.unread > 0 ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                            {session.sender_name}
                          </span>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {timeAgo(session.last_at)}
                          </span>
                        </div>
                        {session.sender_phone && (
                          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Phone className="h-2.5 w-2.5" /> {session.sender_phone}
                          </p>
                        )}
                        <p className={`mt-0.5 truncate text-xs ${session.unread > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                          {session.last_message}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Right: Conversation View ── */}
        <div
          className={`flex min-w-0 flex-1 flex-col ${
            activeSession ? "flex" : "hidden lg:flex"
          }`}
        >
          {!activeSession ? (
            /* Empty state */
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <MessageCircle className="h-8 w-8 text-muted-foreground" strokeWidth={1.4} />
              </div>
              <p className="text-sm text-muted-foreground">
                বাম দিক থেকে একটি চ্যাট সেশন সিলেক্ট করুন
              </p>
            </div>
          ) : (
            <>
              {/* Conversation Header */}
              <div className="flex items-center gap-3 border-b border-border p-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSession(null)
                    setMessages([])
                  }}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold text-white">
                  {activeSessionData?.sender_name.charAt(0).toUpperCase() ?? "?"}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    {activeSessionData?.sender_name ?? "Unknown"}
                  </h3>
                  {activeSessionData?.sender_phone && (
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Phone className="h-3 w-3" /> {activeSessionData.sender_phone}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {activeSessionData?.sender_phone && (
                    <a
                      href={`https://wa.me/${activeSessionData.sender_phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-2 text-[#25D366] hover:bg-green-50 dark:hover:bg-green-950/30"
                      title="WhatsApp"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  )}

                  {confirmDelete === activeSession ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDelete(activeSession)}
                        disabled={deleting}
                        className="rounded-lg bg-red-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "মুছুন"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(null)}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-bold text-foreground hover:bg-muted"
                      >
                        না
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(activeSession)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="সেশন ডিলিট"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto bg-muted/30 px-4 py-4">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-16 text-center">
                    <p className="text-xs text-muted-foreground">এই সেশনে কোনো মেসেজ নেই।</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {messages.map((msg, i) => {
                      const isAdmin = !!msg.is_admin
                      // Date separator
                      const prevMsg = i > 0 ? messages[i - 1] : null
                      const showDate =
                        !prevMsg ||
                        formatDate(msg.created_at) !== formatDate(prevMsg.created_at)
                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div className="my-2 flex items-center justify-center">
                              <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-medium text-muted-foreground">
                                {formatDate(msg.created_at)}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                                isAdmin
                                  ? "rounded-br-md bg-primary text-primary-foreground"
                                  : "rounded-bl-md bg-card text-foreground border border-border"
                              }`}
                            >
                              {!isAdmin && (
                                <p className="mb-0.5 flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                  <User className="h-2.5 w-2.5" /> {msg.sender_name}
                                </p>
                              )}
                              <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
                                {msg.message}
                              </p>
                              <p
                                className={`mt-1 text-right text-[10px] ${
                                  isAdmin ? "text-primary-foreground/60" : "text-muted-foreground"
                                }`}
                              >
                                {formatTime(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Reply input */}
              <form
                onSubmit={handleSendReply}
                className="flex items-center gap-2 border-t border-border bg-card p-3"
              >
                <input
                  ref={replyInputRef}
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="রিপ্লাই লিখুন..."
                  className="h-10 flex-1 rounded-xl border border-border bg-background px-3.5 text-sm text-foreground outline-none focus:border-foreground"
                />
                <button
                  type="submit"
                  disabled={!reply.trim() || sending}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
