"use client"

import { useState } from "react"
import { Send, CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { submitContactAction } from "@/app/admin/actions"

const subjects = ["অর্ডার সম্পর্কিত", "পণ্য জিজ্ঞাসা", "রিটার্ন/এক্সচেঞ্জ", "অভিযোগ", "অন্যান্য"]

export function ContactForm() {
  const [subject, setSubject] = useState(subjects[0])
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === "saving") return

    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get("name") ?? "").trim()
    const phone = String(data.get("phone") ?? "").trim()
    const email = String(data.get("email") ?? "").trim()
    const message = String(data.get("message") ?? "").trim()

    setError(null)
    setStatus("saving")

    const res = await submitContactAction({ name, phone, email, subject, message })

    if (!res.ok) {
      setError(res.error ?? "কিছু একটা সমস্যা হয়েছে।")
      setStatus("idle")
      return
    }

    setStatus("done")
    form.reset()
  }

  if (status === "done") {
    return (
      <div className="glass-contact-form font-bengali flex flex-col items-center justify-center gap-5 p-10 text-center sm:p-14">
        <span className="glass-icon-circle flex h-16 w-16 items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-gold" strokeWidth={1.6} />
        </span>
        <h3 className="text-xl font-bold text-foreground sm:text-2xl">Message Sent Successfully</h3>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          ধন্যবাদ! আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে। সাধারণত ২৪ কর্মঘণ্টার মধ্যে আমরা উত্তর দিয়ে থাকি।
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground backdrop-blur-sm transition hover:border-gold/40 hover:bg-gold/5"
        >
          আরেকটি বার্তা পাঠান
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-contact-form font-bengali flex flex-col gap-6 p-6 sm:p-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="glass-icon-circle flex h-9 w-9 items-center justify-center">
            <Sparkles className="h-4 w-4 text-gold" />
          </span>
          <h2 className="text-xl font-bold text-foreground">Send Us a Message</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          ফর্মটি পূরণ করুন, আমরা যত দ্রুত সম্ভব যোগাযোগ করব।
        </p>
      </div>

      {/* Name + Phone */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="c-name" className="text-sm font-medium text-foreground">
            আপনার নাম <span className="text-destructive">*</span>
          </label>
          <input
            id="c-name"
            name="name"
            required
            placeholder="পুরো নাম লিখুন"
            className="glass-contact-input h-11 px-4 text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="c-phone" className="text-sm font-medium text-foreground">
            মোবাইল নাম্বার <span className="text-destructive">*</span>
          </label>
          <input
            id="c-phone"
            name="phone"
            required
            inputMode="numeric"
            pattern="^01[3-9]\d{8}$"
            title="সঠিক বাংলাদেশি মোবাইল নাম্বার দিন (যেমন: 01712345678)"
            placeholder="01XXXXXXXXX"
            className="glass-contact-input h-11 px-4 text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="c-email" className="text-sm font-medium text-foreground">
            ইমেইল
          </label>
          <input
            id="c-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className="glass-contact-input h-11 px-4 text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Subject tags */}
      <div className="flex flex-col gap-2.5">
        <span className="text-sm font-medium text-foreground">বিষয় নির্বাচন করুন</span>
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSubject(s)}
              className={`rounded-xl border px-4 py-2 text-xs font-medium transition ${
                subject === s
                  ? "glass-tag-active border-gold/50 text-foreground"
                  : "glass-tag-inactive text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="flex flex-col gap-2">
        <label htmlFor="c-message" className="text-sm font-medium text-foreground">
          আপনার বার্তা <span className="text-destructive">*</span>
        </label>
        <textarea
          id="c-message"
          name="message"
          required
          rows={5}
          placeholder="আপনার প্রশ্ন বা মন্তব্য বিস্তারিত লিখুন..."
          className="glass-contact-input resize-none px-4 py-3 text-base text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-center text-sm font-medium text-destructive backdrop-blur-sm">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "saving"}
        className="btn-contact-submit flex h-14 w-full items-center justify-center gap-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground disabled:opacity-60"
      >
        {status === "saving" ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          <Send className="h-4 w-4" strokeWidth={2} />
        )}
        {status === "saving" ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
      </button>
    </form>
  )
}
