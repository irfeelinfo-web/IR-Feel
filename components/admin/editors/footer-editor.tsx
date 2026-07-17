"use client"

import { useState, useMemo } from "react"
import type { FooterConfig, FooterColumn, FooterLink } from "@/lib/site-config"
import { saveSectionAction } from "@/app/admin/actions"
import { PageTitle, Card, TextField, ArrayItem, AddButton, moveItem, Field, Input } from "@/components/admin/ui"
import { SaveBar } from "@/components/admin/save-bar"
import { Plus, Trash2 } from "lucide-react"

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function FooterEditor({ initial }: { initial: FooterConfig }) {
  const [f, setF] = useState<FooterConfig>(initial)

  const isDirty = useMemo(() => !deepEqual(initial, f), [initial, f])

  const set = <K extends keyof FooterConfig>(k: K, v: FooterConfig[K]) => setF((p) => ({ ...p, [k]: v }))

  const updateColumn = (ci: number, patch: Partial<FooterColumn>) =>
    setF((p) => ({ ...p, columns: p.columns.map((c, i) => (i === ci ? { ...c, ...patch } : c)) }))

  const updateLink = (ci: number, li: number, patch: Partial<FooterLink>) =>
    setF((p) => ({
      ...p,
      columns: p.columns.map((c, i) =>
        i === ci ? { ...c, links: c.links.map((l, x) => (x === li ? { ...l, ...patch } : l)) } : c,
      ),
    }))

  return (
    <div className="max-w-3xl">
      <PageTitle title="ফুটার" description="নিউজলেটার, লিংক কলাম, কপিরাইট ও পেমেন্ট ব্যাজ বদলান।" />

      <div className="flex flex-col gap-5">
        <Card title="নিউজলেটার">
          <div className="flex flex-col gap-4">
            <TextField label="শিরোনাম" value={f.newsletterTitle} onChange={(v) => set("newsletterTitle", v)} />
            <TextField label="বর্ণনা" value={f.newsletterText} onChange={(v) => set("newsletterText", v)} />
          </div>
        </Card>

        <Card title="লিংক কলাম">
          <div className="flex flex-col gap-3">
            {f.columns.map((col, ci) => (
              <ArrayItem
                key={ci}
                index={ci}
                total={f.columns.length}
                title={col.title || "কলাম"}
                onMove={(from, to) => set("columns", moveItem(f.columns, from, to))}
                onRemove={(idx) => set("columns", f.columns.filter((_, x) => x !== idx))}
              >
                <TextField label="কলাম শিরোনাম" value={col.title} onChange={(v) => updateColumn(ci, { title: v })} />
                <div className="mt-3 flex flex-col gap-2">
                  {col.links.map((link, li) => (
                    <div key={li} className="flex items-end gap-2">
                      <div className="flex-1">
                        <Field label="লেবেল">
                          <Input value={link.label} onChange={(e) => updateLink(ci, li, { label: e.target.value })} />
                        </Field>
                      </div>
                      <div className="flex-1">
                        <Field label="লিংক">
                          <Input value={link.href} onChange={(e) => updateLink(ci, li, { href: e.target.value })} />
                        </Field>
                      </div>
                      <button
                        type="button"
                        aria-label="লিংক মুছুন"
                        onClick={() =>
                          updateColumn(ci, { links: col.links.filter((_, x) => x !== li) })
                        }
                        className="mb-1 rounded p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => updateColumn(ci, { links: [...col.links, { label: "New Link", href: "/" }] })}
                    className="flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" /> লিংক যোগ করুন
                  </button>
                </div>
              </ArrayItem>
            ))}
            <AddButton
              label="নতুন কলাম"
              onClick={() => set("columns", [...f.columns, { title: "NEW", links: [] }])}
            />
          </div>
        </Card>

        <Card title="নিচের বার">
          <div className="flex flex-col gap-4">
            <TextField label="কপিরাইট টেক্সট" value={f.copyright} onChange={(v) => set("copyright", v)} />
            <TextField
              label="পেমেন্ট ব্যাজ (কমা দিয়ে আলাদা)"
              value={f.paymentBadges.join(", ")}
              onChange={(v) => set("paymentBadges", v.split(",").map((x) => x.trim()).filter(Boolean))}
            />
          </div>
        </Card>
      </div>

      <SaveBar onSave={async () => void (await saveSectionAction("footer", f))} isDirty={isDirty} />
    </div>
  )
}
