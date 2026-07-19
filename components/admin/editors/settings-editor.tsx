"use client"

import { useState, useMemo, useEffect } from "react"
import type { SiteSettings, AnnouncementConfig } from "@/lib/site-config"
import { saveSectionAction } from "@/app/admin/actions"
import { PageTitle, Card, TextField, AreaField, Toggle } from "@/components/admin/ui"
import { SaveBar } from "@/components/admin/save-bar"
import { ImageField } from "@/components/admin/image-field"

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function SettingsEditor({
  initialSettings,
  initialAnnouncement,
}: {
  initialSettings: SiteSettings
  initialAnnouncement: AnnouncementConfig
}) {
  const [s, setS] = useState<SiteSettings>(initialSettings)
  const [a, setA] = useState<AnnouncementConfig>(initialAnnouncement)

  useEffect(() => {
    setS(initialSettings)
    setA(initialAnnouncement)
  }, [initialSettings, initialAnnouncement])

  const isDirty = useMemo(
    () => !deepEqual(initialSettings, s) || !deepEqual(initialAnnouncement, a),
    [initialSettings, s, initialAnnouncement, a],
  )

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS((p) => ({ ...p, [k]: v }))
  const setSocial = (k: keyof SiteSettings["socials"], v: string) =>
    setS((p) => ({ ...p, socials: { ...p.socials, [k]: v } }))
  const setAnn = <K extends keyof AnnouncementConfig>(k: K, v: AnnouncementConfig[K]) =>
    setA((p) => ({ ...p, [k]: v }))

  async function save() {
    await saveSectionAction("settings", s)
    await saveSectionAction("announcement", a)
  }

  return (
    <div className="max-w-3xl">
      <PageTitle
        title="সাইট সেটিংস"
        description="এখানে ব্র্যান্ড নাম, লোগো, ফোন, ইমেইল ইত্যাদি বদলালে পুরো সাইটে বদলে যাবে।"
      />

      <div className="flex flex-col gap-5">
        <Card title="ব্র্যান্ড ও পরিচিতি">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="ব্র্যান্ড নাম" value={s.brandName} onChange={(v) => set("brandName", v)} />
            <TextField
              label="ব্র্যান্ড অ্যাকসেন্ট (নামের পরের চিহ্ন)"
              value={s.brandAccent}
              onChange={(v) => set("brandAccent", v)}
            />
          </div>
          <div className="mt-4">
            <ImageField
              label="লোগো ইমেজ (দিলে টেক্সট ব্র্যান্ডের বদলে দেখাবে)"
              value={s.logoImage}
              onChange={(v) => set("logoImage", v)}
            />
          </div>
        </Card>

        <Card title="যোগাযোগ">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="ফোন নম্বর" value={s.phone} onChange={(v) => set("phone", v)} placeholder="+880 1700-000000" />
            <TextField label="WhatsApp নম্বর" value={s.whatsappNumber || ""} onChange={(v) => set("whatsappNumber", v)} placeholder="+880 1700-000000" />
            <TextField label="ইমেইল" value={s.email} onChange={(v) => set("email", v)} placeholder="hello@irfeel.info" />
            <TextField label="ঠিকানা" value={s.address} onChange={(v) => set("address", v)} placeholder="Dhaka, Bangladesh" />
          </div>
        </Card>

        <Card title="প্রোডাক্ট পেজ">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Toggle label="WhatsApp এ অর্ডার করার বাটন দেখান" checked={s.productWhatsappButton ?? true} onChange={(v) => set("productWhatsappButton", v)} />
            <Toggle label="কল করে অর্ডার করার বাটন দেখান" checked={s.productCallButton ?? true} onChange={(v) => set("productCallButton", v)} />
          </div>
        </Card>

        <Card title="দোকান সেটিংস">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="কারেন্সি চিহ্ন" value={s.currencySymbol} onChange={(v) => set("currencySymbol", v)} />
            <TextField
              label="ফ্রি শিপিং সীমা (টাকা)"
              type="number"
              value={s.freeShippingThreshold}
              onChange={(v) => set("freeShippingThreshold", Number(v) || 0)}
            />
          </div>
        </Card>

        <Card title="সোশ্যাল লিংক">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Facebook" value={s.socials.facebook} onChange={(v) => setSocial("facebook", v)} />
            <TextField label="Instagram" value={s.socials.instagram} onChange={(v) => setSocial("instagram", v)} />
            <TextField label="Twitter / X" value={s.socials.twitter} onChange={(v) => setSocial("twitter", v)} />
            <TextField label="YouTube" value={s.socials.youtube} onChange={(v) => setSocial("youtube", v)} />
          </div>
        </Card>

        <Card title="SEO / মেটা">
          <div className="flex flex-col gap-4">
            <TextField label="পেজ টাইটেল" value={s.metaTitle} onChange={(v) => set("metaTitle", v)} />
            <AreaField label="মেটা ডেসক্রিপশন" value={s.metaDescription} onChange={(v) => set("metaDescription", v)} />
            <ImageField
              label="ফ্যাভিকন / ব্রাউজার ট্যাবের লোগো"
              value={s.faviconImage || ""}
              onChange={(v) => set("faviconImage", v)}
            />
          </div>
        </Card>

        <Card title="অ্যানাউন্সমেন্ট বার (হেডারের উপরের বার)">
          <div className="flex flex-col gap-4">
            <Toggle label="অ্যানাউন্সমেন্ট বার দেখান" checked={a.enabled} onChange={(v) => setAnn("enabled", v)} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="টেক্সট" value={a.text} onChange={(v) => setAnn("text", v)} />
              <TextField label="হাইলাইট (যেমন ৳ 999)" value={a.highlight} onChange={(v) => setAnn("highlight", v)} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Toggle label="Help & Support লিংক" checked={a.showHelp} onChange={(v) => setAnn("showHelp", v)} />
              <Toggle label="Track Order লিংক" checked={a.showTrackOrder} onChange={(v) => setAnn("showTrackOrder", v)} />
            </div>
          </div>
        </Card>

        <Card title="অ্যাকাউন্ট পেজ প্রোমো ব্যানার">
          <div className="flex flex-col gap-4">
            <Toggle label="প্রোমো ব্যানার দেখান" checked={s.accountPromo?.enabled ?? true} onChange={(v) => setS(p => ({ ...p, accountPromo: { ...p.accountPromo, enabled: v } }))} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="টাইটেল" value={s.accountPromo?.title || ""} onChange={(v) => setS(p => ({ ...p, accountPromo: { ...p.accountPromo, title: v } }))} />
              <TextField label="বাটন টেক্সট" value={s.accountPromo?.buttonText || ""} onChange={(v) => setS(p => ({ ...p, accountPromo: { ...p.accountPromo, buttonText: v } }))} />
            </div>
            <AreaField label="বিবরণ" value={s.accountPromo?.text || ""} onChange={(v) => setS(p => ({ ...p, accountPromo: { ...p.accountPromo, text: v } }))} />
            <TextField label="বাটন লিংক" value={s.accountPromo?.buttonHref || ""} onChange={(v) => setS(p => ({ ...p, accountPromo: { ...p.accountPromo, buttonHref: v } }))} />
          </div>
        </Card>
      </div>

      <SaveBar onSave={save} isDirty={isDirty} />
    </div>
  )
}
