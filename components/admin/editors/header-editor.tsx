"use client"

import { useState, useMemo } from "react"
import type { HeaderConfig, NavItem } from "@/lib/site-config"
import { saveSectionAction } from "@/app/admin/actions"
import { PageTitle, Card, TextField, ArrayItem, AddButton, moveItem } from "@/components/admin/ui"
import { SaveBar } from "@/components/admin/save-bar"

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function HeaderEditor({ initial }: { initial: HeaderConfig }) {
  const [nav, setNav] = useState<NavItem[]>(initial.nav)

  const isDirty = useMemo(() => !deepEqual(initial.nav, nav), [initial.nav, nav])

  const update = (i: number, patch: Partial<NavItem>) =>
    setNav((p) => p.map((item, idx) => (idx === i ? { ...item, ...patch } : item)))

  return (
    <div className="max-w-2xl">
      <PageTitle title="হেডার মেনু" description="নেভিগেশন মেনুর আইটেম যোগ, বদল বা মুছে ফেলুন।" />

      <Card title="মেনু আইটেম">
        <div className="flex flex-col gap-3">
          {nav.map((item, i) => (
            <ArrayItem
              key={i}
              index={i}
              total={nav.length}
              title={item.label || "মেনু আইটেম"}
              onMove={(from, to) => setNav((p) => moveItem(p, from, to))}
              onRemove={(idx) => setNav((p) => p.filter((_, x) => x !== idx))}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <TextField label="লেবেল" value={item.label} onChange={(v) => update(i, { label: v })} />
                <TextField label="লিংক (href)" value={item.href} onChange={(v) => update(i, { href: v })} />
                <TextField label="key (ইউনিক)" value={item.key} onChange={(v) => update(i, { key: v })} />
              </div>
            </ArrayItem>
          ))}
          <AddButton
            label="নতুন মেনু আইটেম"
            onClick={() =>
              setNav((p) => [...p, { label: "NEW", href: "/", key: `item-${p.length + 1}` }])
            }
          />
        </div>
      </Card>

      <SaveBar onSave={async () => void (await saveSectionAction("header", { nav }))} isDirty={isDirty} />
    </div>
  )
}
