"use client"

import Link from "next/link"
import { useState } from "react"
import { Send, CheckCircle2 } from "lucide-react"
import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon } from "@/components/brand-icons"
import { subscribeNewsletterAction } from "@/app/admin/actions"
import type { FooterConfig, SiteSettings } from "@/lib/site-config"

export function SiteFooterClient({
  footer,
  settings,
}: {
  footer: FooterConfig
  settings: SiteSettings
}) {
  const [nlStatus, setNlStatus] = useState<"idle" | "saving" | "done">("idle")
  const [nlMessage, setNlMessage] = useState("")

  const socials = [
    { Icon: FacebookIcon, href: settings.socials.facebook, name: "Facebook" },
    { Icon: InstagramIcon, href: settings.socials.instagram, name: "Instagram" },
    { Icon: TwitterIcon, href: settings.socials.twitter, name: "Twitter" },
    { Icon: YoutubeIcon, href: settings.socials.youtube, name: "YouTube" },
  ].filter((s) => s.href && s.href !== "#")

  async function handleNewsletter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (nlStatus === "saving") return
    const form = e.currentTarget
    const email = String(new FormData(form).get("email") ?? "").trim()
    setNlStatus("saving")
    const res = await subscribeNewsletterAction(email)
    if (res.ok) {
      setNlStatus("done")
      setNlMessage(res.message ?? "সফলভাবে সাবস্ক্রাইব হয়েছে!")
      form.reset()
    } else {
      setNlMessage(res.error ?? "সমস্যা হয়েছে।")
      setNlStatus("idle")
    }
  }

  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Newsletter */}
          <div className="lg:col-span-2 lg:pr-8">
            <h3 className="font-display text-lg font-bold tracking-wide">{footer.newsletterTitle}</h3>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-footer-foreground/60">
              {footer.newsletterText}
            </p>
            {nlStatus === "done" ? (
              <div className="mt-6 flex max-w-sm items-center gap-2 rounded-md border border-white/15 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" strokeWidth={2} />
                <span className="text-sm text-footer-foreground/80">{nlMessage}</span>
              </div>
            ) : (
              <form className="mt-6 flex max-w-sm items-stretch" onSubmit={handleNewsletter}>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="আপনার ইমেইল দিন"
                  aria-label="Email address"
                  className="h-11 w-full border border-white/15 bg-transparent px-4 text-base text-footer-foreground placeholder:text-footer-foreground/40 focus:border-white/40 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={nlStatus === "saving"}
                  aria-label="Subscribe"
                  className="flex h-11 w-12 shrink-0 items-center justify-center bg-gold text-primary transition-colors hover:bg-gold/85 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
            {nlMessage && nlStatus !== "done" && (
              <p className="mt-2 text-xs text-red-400">{nlMessage}</p>
            )}
          </div>

          {/* Link columns */}
          {footer.columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold tracking-widest text-footer-foreground/50">{col.title}</h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-footer-foreground/75 transition-colors hover:text-footer-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Follow us */}
        {socials.length > 0 && (
          <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold tracking-widest text-gold/70">FOLLOW US</span>
              <div className="flex items-center gap-3">
                {socials.map(({ Icon, href, name }, i) => (
                  <Link
                    key={i}
                    href={href}
                    aria-label={`${name} এ ফলো করুন`}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-gold/20 hover:text-gold"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-6">
          <p className="text-xs text-footer-foreground/50">{footer.copyright.replace(/© \d{4}/, `© ${new Date().getFullYear()}`)}</p>
          <div className="flex items-center gap-2">
            {footer.paymentBadges.map((p) => (
              <span
                key={p}
                className="flex h-6 min-w-10 items-center justify-center rounded border border-gold/20 bg-white px-1.5 text-[9px] font-bold text-footer"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
