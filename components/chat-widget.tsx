"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MessageCircle, X, Send, Loader2, User, Phone } from "lucide-react"
import { usePathname } from "next/navigation"

type Message = {
  id: number
  session_id: string
  sender_name: string
  message: string
  is_admin: number
  created_at: string
}

function generateSessionId() {
  return "chat_" + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso + "Z")
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
  } catch {
    return ""
  }
}

export function ChatWidget() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhoneVal] = useState("")
  const [started, setStarted] = useState(false)
  const [sessionId, setSessionId] = useState("")
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /* ── Init from localStorage ── */
  useEffect(() => {
    if (isAdmin) return
    const stored = localStorage.getItem("chat_session")
    if (stored) {
      try {
        const data = JSON.parse(stored)
        if (data.sessionId && data.name) {
          setSessionId(data.sessionId)
          setName(data.name)
          setPhoneVal(data.phone || "")
          setStarted(true)
        }
      } catch { /* ignore */ }
    }
  }, [isAdmin])

  /* ── Scroll to bottom ── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  /* ── Poll for new messages ── */
  const fetchMessages = useCallback(async () => {
    if (!sessionId) return
    try {
      const res = await fetch(`/api/chat?sessionId=${encodeURIComponent(sessionId)}`)
      if (res.ok) {
        const data = await res.json()
        const newMsgs = data.messages as Message[]
        setMessages((prev) => {
          if (newMsgs.length > prev.length) {
            // Check if there's a new admin message
            const lastNew = newMsgs[newMsgs.length - 1]
            if (lastNew.is_admin && !open) {
              setHasNewMessage(true)
            }
            return newMsgs
          }
          return prev
        })
      }
    } catch { /* ignore polling errors */ }
  }, [sessionId, open])

  useEffect(() => {
    if (isAdmin || !started || !sessionId) return
    fetchMessages()
    pollRef.current = setInterval(fetchMessages, 4000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [isAdmin, started, sessionId, fetchMessages])

  /* ── Clear new message indicator when opened ── */
  useEffect(() => {
    if (open) {
      setHasNewMessage(false)
      fetchMessages()
    }
  }, [open, fetchMessages])

  /* ── Start Chat ── */
  function handleStart(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const sid = generateSessionId()
    setSessionId(sid)
    setStarted(true)
    localStorage.setItem("chat_session", JSON.stringify({ sessionId: sid, name: name.trim(), phone: phone.trim() }))
  }

  /* ── Send message ── */
  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const msg = input.trim()
    if (!msg || sending) return

    setSending(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, name, phone, message: msg }),
      })
      if (res.ok) {
        setInput("")
        await fetchMessages()
        inputRef.current?.focus()
      }
    } catch { /* ignore */ }
    setSending(false)
  }

  // Don't render on admin pages
  if (isAdmin) return null

  return (
    <>
      {/* Floating Button Container */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center justify-center">
        {!open && (
          <div className="absolute inset-0 rounded-full bg-[#1b3636]/40 animate-ping" style={{ animationDuration: '2.5s' }} />
        )}
        <button
          id="chat-widget-toggle"
          type="button"
          onClick={() => setOpen(!open)}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#203c40] to-[#122426] text-[#e2b678] shadow-2xl shadow-[#1b3636]/40 transition-all duration-300 hover:scale-110 hover:shadow-[#1b3636]/60 active:scale-95"
          aria-label="চ্যাট করুন"
        >
          {open ? (
            <X className="h-4 w-4" strokeWidth={2.5} />
          ) : (
            <>
              <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
              {hasNewMessage && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-50 flex w-[350px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl shadow-black/20 dark:border-white/10 dark:bg-neutral-900"
          style={{ height: "min(520px, calc(100vh - 8rem))" }}
        >
          {/* Header */}
          <div className="relative flex items-center gap-3 bg-gradient-to-r from-[#1b3a3a] to-[#203c40] px-4 py-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <MessageCircle className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white">আমাদের সাথে চ্যাট করুন</h3>
              <p className="text-[11px] text-white/70">সাধারণত কয়েক মিনিটেই রিপ্লাই দিই</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {!started ? (
            /* ── Registration Form ── */
            <form onSubmit={handleStart} className="flex flex-1 flex-col justify-center gap-4 px-5 py-6">
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#1b3a3a]/10 dark:bg-[#1b3a3a]/30">
                <MessageCircle className="h-7 w-7 text-[#1b3a3a] dark:text-[#e2b678]" />
              </div>
              <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                চ্যাট শুরু করতে আপনার তথ্য দিন
              </p>

              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="আপনার নাম *"
                  required
                  className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 text-sm text-neutral-900 outline-none transition-colors focus:border-[#d4a96a] focus:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-[#e2b678] dark:focus:bg-neutral-800"
                />
              </div>

              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhoneVal(e.target.value)}
                  placeholder="ফোন নম্বর (ঐচ্ছিক)"
                  className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 text-sm text-neutral-900 outline-none transition-colors focus:border-[#d4a96a] focus:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-[#e2b678] dark:focus:bg-neutral-800"
                />
              </div>

              <button
                type="submit"
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1b3a3a] to-[#203c40] text-sm font-semibold text-[#e2b678] transition-all hover:opacity-90 active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4" />
                চ্যাট শুরু করুন
              </button>
            </form>
          ) : (
            /* ── Chat View ── */
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollBehavior: "smooth" }}>
                {messages.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1b3a3a]/10 dark:bg-[#1b3a3a]/30">
                      <Send className="h-5 w-5 text-[#1b3a3a] dark:text-[#e2b678]" />
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      হ্যালো {name}! 👋 আমাদের কিছু জিজ্ঞাসা থাকলে মেসেজ দিন।
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {messages.map((msg) => {
                    const isAdmin = !!msg.is_admin
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                            isAdmin
                              ? "rounded-bl-md bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                              : "rounded-br-md bg-gradient-to-br from-[#1b3a3a] to-[#203c40] text-white"
                          }`}
                        >
                          {isAdmin && (
                            <p className="mb-0.5 text-[10px] font-bold text-[#d4a96a] dark:text-[#e2b678]">
                              Admin
                            </p>
                          )}
                          <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
                            {msg.message}
                          </p>
                          <p
                            className={`mt-1 text-right text-[10px] ${
                              isAdmin
                                ? "text-neutral-400 dark:text-neutral-500"
                                : "text-white/60"
                            }`}
                          >
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 border-t border-neutral-100 px-3 py-3 dark:border-neutral-800"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="মেসেজ লিখুন..."
                  className="h-10 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 text-sm text-neutral-900 outline-none transition-colors focus:border-[#d4a96a] focus:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-[#e2b678]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1b3a3a] to-[#203c40] text-[#e2b678] transition-all hover:opacity-90 disabled:opacity-40"
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
      )}
    </>
  )
}
