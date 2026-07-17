"use client"

import { useState, useMemo } from "react"
import type { PagesConfig, FaqItem, StoreLocation } from "@/lib/site-config"
import { saveSectionAction } from "@/app/admin/actions"
import { PageTitle, Card, TextField, AreaField, ArrayItem, AddButton, moveItem } from "@/components/admin/ui"
import { SaveBar } from "@/components/admin/save-bar"

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function PagesEditor({ initial }: { initial: PagesConfig }) {
  const [p, setP] = useState<PagesConfig>(initial)

  const isDirty = useMemo(() => !deepEqual(initial, p), [initial, p])

  const set = <K extends keyof PagesConfig>(k: K, v: PagesConfig[K]) => setP((prev) => ({ ...prev, [k]: v }))

  const updateFaq = (i: number, patch: Partial<FaqItem>) =>
    set("faq", p.faq.map((f, idx) => (idx === i ? { ...f, ...patch } : f)))
  const updateStore = (i: number, patch: Partial<StoreLocation>) =>
    set("stores", p.stores.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))

  return (
    <div className="max-w-3xl">
      <PageTitle title="পেজ কনটেন্ট" description="FAQ, শিপিং, রিটার্ন, কন্টাক্ট ও স্টোর তথ্য বদলান।" />

      <div className="flex flex-col gap-5">
        <Card title="FAQ পেজ">
          <div className="flex flex-col gap-4">
            <TextField label="শিরোনাম" value={p.faqTitle} onChange={(v) => set("faqTitle", v)} />
            <AreaField label="ভূমিকা" value={p.faqIntro} onChange={(v) => set("faqIntro", v)} />
            <div className="flex flex-col gap-3">
              {p.faq.map((f, i) => (
                <ArrayItem
                  key={i}
                  index={i}
                  total={p.faq.length}
                  title={f.q || "প্রশ্ন"}
                  onMove={(from, to) => set("faq", moveItem(p.faq, from, to))}
                  onRemove={(idx) => set("faq", p.faq.filter((_, x) => x !== idx))}
                >
                  <div className="flex flex-col gap-3">
                    <TextField label="প্রশ্ন" value={f.q} onChange={(v) => updateFaq(i, { q: v })} />
                    <AreaField label="উত্তর" value={f.a} onChange={(v) => updateFaq(i, { a: v })} />
                  </div>
                </ArrayItem>
              ))}
              <AddButton label="নতুন প্রশ্ন" onClick={() => set("faq", [...p.faq, { q: "", a: "" }])} />
            </div>
          </div>
        </Card>

        <Card title="শিপিং ও ডেলিভারি">
          <div className="flex flex-col gap-4">
            <TextField label="শিরোনাম" value={p.shippingTitle} onChange={(v) => set("shippingTitle", v)} />
            <AreaField label="বিবরণ" value={p.shippingBody} onChange={(v) => set("shippingBody", v)} />
          </div>
        </Card>

        <Card title="রিটার্ন ও এক্সচেঞ্জ">
          <div className="flex flex-col gap-4">
            <TextField label="শিরোনাম" value={p.returnsTitle} onChange={(v) => set("returnsTitle", v)} />
            <AreaField label="বিবরণ" value={p.returnsBody} onChange={(v) => set("returnsBody", v)} />
          </div>
        </Card>

        <Card title="ট্র্যাক অর্ডার">
          <div className="flex flex-col gap-4">
            <TextField label="শিরোনাম" value={p.trackOrderTitle || ""} onChange={(v) => set("trackOrderTitle", v)} />
            <AreaField label="ভূমিকা" value={p.trackOrderIntro || ""} onChange={(v) => set("trackOrderIntro", v)} />
          </div>
        </Card>

        <Card title="কন্টাক্ট পেজ">
          <div className="flex flex-col gap-4">
            <TextField label="শিরোনাম" value={p.contactTitle} onChange={(v) => set("contactTitle", v)} />
            <AreaField label="ভূমিকা" value={p.contactIntro} onChange={(v) => set("contactIntro", v)} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="ফোন" value={p.contactPhone} onChange={(v) => set("contactPhone", v)} />
              <TextField label="WhatsApp নম্বর" value={p.contactWhatsapp || ""} onChange={(v) => set("contactWhatsapp", v)} />
              <TextField label="ইমেইল" value={p.contactEmail} onChange={(v) => set("contactEmail", v)} />
              <TextField label="ঠিকানা" value={p.contactAddress} onChange={(v) => set("contactAddress", v)} />
              <TextField label="সময়সূচি" value={p.contactHours} onChange={(v) => set("contactHours", v)} />
            </div>
          </div>
        </Card>

        <Card title="স্টোর লোকেশন">
          <div className="flex flex-col gap-3">
            {p.stores.map((s, i) => (
              <ArrayItem
                key={i}
                index={i}
                total={p.stores.length}
                title={s.name || "স্টোর"}
                onMove={(from, to) => set("stores", moveItem(p.stores, from, to))}
                onRemove={(idx) => set("stores", p.stores.filter((_, x) => x !== idx))}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextField label="নাম" value={s.name} onChange={(v) => updateStore(i, { name: v })} />
                  <TextField label="ফোন" value={s.phone} onChange={(v) => updateStore(i, { phone: v })} />
                  <TextField label="ঠিকানা" value={s.address} onChange={(v) => updateStore(i, { address: v })} />
                  <TextField label="সময়সূচি" value={s.hours} onChange={(v) => updateStore(i, { hours: v })} />
                </div>
              </ArrayItem>
            ))}
            <AddButton
              label="নতুন স্টোর"
              onClick={() => set("stores", [...p.stores, { name: "", address: "", phone: "", hours: "" }])}
            />
          </div>
        </Card>
      </div>

      <SaveBar onSave={async () => void (await saveSectionAction("pages", p))} isDirty={isDirty} />
    </div>
  )
}
