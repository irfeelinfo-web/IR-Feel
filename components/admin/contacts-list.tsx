"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mail, Phone, Calendar, ChevronDown, ChevronUp, Trash2, Loader2, Search, X, MessageSquare, Send } from "lucide-react"
import { deleteContactAction } from "@/app/admin/actions"
import type { ContactMessage } from "@/lib/contacts"
import { PageTitle } from "@/components/admin/ui"
import { useToast } from "@/components/admin/toast-context"

const subjects = ["অর্ডার সম্পর্কিত", "পণ্য জিজ্ঞাসা", "রিটার্ন/এক্সচেঞ্জ", "অভিযোগ", "অন্যান্য"]

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export function ContactsList({ contacts: initialContacts }: { contacts: ContactMessage[] }) {
  const router = useRouter()
  const toast = useToast()
  const [contacts, setContacts] = useState(initialContacts)

  useEffect(() => {
    setContacts(initialContacts)
  }, [initialContacts])
  const [openId, setOpenId] = useState<number | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [subjectFilter, setSubjectFilter] = useState<string | "all">("all")

  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = { all: contacts.length }
    for (const s of subjects) counts[s] = 0
    for (const c of contacts) {
      if (c.subject) {
        counts[c.subject] = (counts[c.subject] ?? 0) + 1
      }
    }
    return counts
  }, [contacts])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return contacts.filter((c) => {
      if (subjectFilter !== "all" && c.subject !== subjectFilter) return false
      if (q) {
        const haystack = `${c.name} ${c.phone} ${c.email} ${c.subject} ${c.message}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [contacts, search, subjectFilter])

  const hasFilters = search.trim() !== "" || subjectFilter !== "all"

  async function remove(id: number) {
    setBusyId(id)
    // Optimistic: remove from local list immediately
    const previousContacts = contacts
    setContacts((prev) => prev.filter((c) => c.id !== id))

    try {
      const res = await deleteContactAction(id)
      if (res.ok) {
        toast.success("বার্তা সফলভাবে মুছে ফেলা হয়েছে!")
        router.refresh()
      } else {
        // Rollback on server error
        setContacts(previousContacts)
        toast.error(res.error || "বার্তা ডিলিট করা সম্ভব হয়নি।")
      }
    } catch (e) {
      console.error("[contacts-list] delete failed:", (e as Error).message)
      // Rollback on network error
      setContacts(previousContacts)
      toast.error("বার্তা মুছতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।")
    } finally {
      setBusyId(null)
      setConfirmId(null)
    }
  }

  return (
    <div className="max-w-4xl">
      <PageTitle title="যোগাযোগ বার্তা" description="কাস্টমারদের পাঠানো সকল ইনকোয়ারি ও ফিডব্যাক মেসেজ দেখুন।" />

      {contacts.length > 0 && (
        <div className="flex flex-col gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="কাস্টমারের নাম, ইমেইল, মোবাইল বা বার্তার অংশ বিশেষ দিয়ে খুঁজুন..."
              className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none focus:border-foreground"
            />
          </div>

          {/* Subject filters */}
          <div className="flex flex-wrap gap-2">
            {["all", ...subjects].map((s) => {
              const active = subjectFilter === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubjectFilter(s)}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {s === "all" ? "সব বার্তা" : s}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-background/25 text-background" : "bg-muted text-muted-foreground"}`}>
                    {subjectCounts[s] ?? 0}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Active filters status */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              {filtered.length} / {contacts.length} টি বার্তা পাওয়া গেছে
            </span>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setSubjectFilter("all")
                }}
                className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 font-semibold text-foreground hover:bg-muted"
              >
                <X className="h-3 w-3" /> ফিল্টার মুছুন
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main layout lists */}
      {contacts.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Mail className="h-10 w-10 text-muted-foreground" strokeWidth={1.4} />
          <p className="text-sm text-muted-foreground">এখনো কোনো কাস্টমার বার্তা আসেনি।</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Search className="h-10 w-10 text-muted-foreground" strokeWidth={1.4} />
          <p className="text-sm text-muted-foreground">সার্চ ফিল্টারে কোনো বার্তা মিলছে না।</p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {filtered.map((c) => {
            const open = openId === c.id
            const cleanPhone = (c.phone || "").replace(/[^0-9]/g, "")
            return (
              <div key={c.id} className="overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-sm">
                {/* Header toggle */}
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : c.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left focus:outline-none"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {open ? (
                      <ChevronUp className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground">{c.name}</span>
                        {c.subject && (
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground">
                            {c.subject}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatDate(c.created_at)}
                      </p>
                    </div>
                  </div>
                  <p className="max-w-xs truncate text-xs text-muted-foreground lg:max-w-md">
                    {c.message}
                  </p>
                </button>

                {/* Details view */}
                {open && (
                  <div className="border-t border-border bg-muted/20 p-5">
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
                      {/* Message Body */}
                      <div className="flex flex-col gap-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">বার্তার বিবরণ</span>
                        <div className="whitespace-pre-wrap rounded-xl border border-border bg-background p-4 text-sm leading-relaxed text-foreground">
                          {c.message}
                        </div>
                      </div>

                      {/* Contact Info & Actions */}
                      <div className="flex flex-col gap-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">কাস্টমার কন্টাক্ট ইনফো</span>
                        
                        <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-background p-3 text-sm">
                          <p className="truncate text-foreground font-medium flex items-center gap-2">
                            <span className="font-bold text-muted-foreground">নাম:</span> {c.name}
                          </p>
                          <p className="truncate text-foreground font-medium flex items-center gap-2">
                            <span className="font-bold text-muted-foreground">মোবাইল:</span> {c.phone}
                          </p>
                          {c.email && (
                            <p className="truncate text-foreground font-medium flex items-center gap-2">
                              <span className="font-bold text-muted-foreground">ইমেইল:</span> {c.email}
                            </p>
                          )}
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex flex-col gap-2">
                          <a
                            href={`tel:${c.phone}`}
                            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background text-xs font-bold text-foreground transition-all hover:bg-muted"
                          >
                            <Phone className="h-3.5 w-3.5" /> কল করুন
                          </a>
                          
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-xs font-bold text-white transition-all hover:bg-[#20ba5a]"
                            >
                              <MessageSquare className="h-3.5 w-3.5" /> হোয়াটসঅ্যাপ চ্যাট
                            </a>
                          )}

                          {c.email && (
                            <a
                              href={`mailto:${c.email}`}
                              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background text-xs font-bold text-foreground transition-all hover:bg-muted"
                            >
                              <Send className="h-3.5 w-3.5" /> ইমেইল পাঠান
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom toolbar */}
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                      <div className="text-xs text-muted-foreground">
                        বার্তা আইডি: #{c.id}
                      </div>

                      <div>
                        {confirmId === c.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => remove(c.id)}
                              disabled={busyId === c.id}
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60 flex items-center gap-1"
                            >
                              {busyId === c.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                "হ্যাঁ, মুছুন"
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmId(null)}
                              className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                            >
                              বাতিল
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmId(c.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> বার্তা মুছুন
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
