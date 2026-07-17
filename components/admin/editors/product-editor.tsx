"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { saveProductAction, type ProductInput } from "@/app/admin/actions"
import { shopCategories, shopSizes } from "@/lib/products"
import { PageTitle, Card, TextField, AreaField, Toggle, Field, Input } from "@/components/admin/ui"
import { ImageField, GalleryImageInput } from "@/components/admin/image-field"
import { SaveBar } from "@/components/admin/save-bar"
import { useToast } from "@/components/admin/toast-context"

const badgeOptions = ["", "NEW", "SALE"] as const

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function ProductEditor({ initial, isNew }: { initial: ProductInput; isNew: boolean }) {
  const router = useRouter()
  const toast = useToast()
  const [p, setP] = useState<ProductInput>(initial)
  const [idTouched, setIdTouched] = useState(!isNew)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const isDirty = useMemo(() => !deepEqual(initial, p), [initial, p])

  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => {
    setP((prev) => ({ ...prev, [k]: v }))
    // Clear validation error on change
    if (validationErrors[k]) {
      setValidationErrors((prev) => {
        const next = { ...prev }
        delete next[k]
        return next
      })
    }
  }

  function onNameChange(v: string) {
    setP((prev) => ({
      ...prev,
      name: v,
      id: isNew && !idTouched ? slugify(v) : prev.id,
    }))
    if (validationErrors.name) {
      setValidationErrors((prev) => {
        const next = { ...prev }
        delete next.name
        return next
      })
    }
  }

  function toggleSize(size: string) {
    setP((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }))
  }

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (!p.name.trim()) errors.name = "প্রোডাক্টের নাম আবশ্যক"
    if (!p.id.trim()) errors.id = "আইডি / স্লাগ আবশ্যক"
    if (p.price <= 0) errors.price = "দাম ০ এর বেশি হতে হবে"
    if (!p.image.trim()) errors.image = "প্রধান ছবি আবশ্যক"
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function save() {
    if (!validate()) {
      toast.error("প্রয়োজনীয় তথ্য পূরণ করুন!")
      throw new Error("ভ্যালিডেশন ব্যর্থ — প্রয়োজনীয় তথ্য পূরণ করুন")
    }
    const res = await saveProductAction({ ...p, id: p.id.trim() }, isNew)
    if (!res.ok) throw new Error("save failed")
    router.push("/admin/products")
    router.refresh()
  }

  return (
    <div className="max-w-3xl">
      <PageTitle
        title={isNew ? "নতুন প্রোডাক্ট" : "প্রোডাক্ট এডিট"}
        description="প্রোডাক্টের সব তথ্য এখান থেকে নিয়ন্ত্রণ করুন।"
      />

      <div className="flex flex-col gap-5">
        <Card title="মূল তথ্য">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <TextField label="প্রোডাক্টের নাম" value={p.name} onChange={onNameChange} />
              {validationErrors.name && (
                <p className="mt-1 text-xs font-medium text-red-600">{validationErrors.name}</p>
              )}
            </div>
            <div>
              <Field label="আইডি / স্লাগ (ইউনিক)">
                <Input
                  value={p.id}
                  disabled={!isNew}
                  placeholder="premium-hoodie"
                  onChange={(e) => {
                    setIdTouched(true)
                    set("id", slugify(e.target.value))
                  }}
                />
              </Field>
              {validationErrors.id && (
                <p className="mt-1 text-xs font-medium text-red-600">{validationErrors.id}</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <AreaField label="বর্ণনা" value={p.description ?? ""} onChange={(v) => set("description", v)} />
          </div>
        </Card>

        <Card title="দাম ও ক্যাটাগরি">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <TextField
                label="দাম (৳)"
                type="number"
                value={p.price}
                onChange={(v) => set("price", Number(v) || 0)}
              />
              {validationErrors.price && (
                <p className="mt-1 text-xs font-medium text-red-600">{validationErrors.price}</p>
              )}
            </div>
            <TextField
              label="পুরনো দাম (৳ — ছাড় দেখাতে)"
              type="number"
              value={p.oldPrice ?? ""}
              onChange={(v) => set("oldPrice", v === "" ? null : Number(v) || 0)}
            />
            <Field label="ক্যাটাগরি">
              <select
                value={p.category ?? ""}
                onChange={(e) => set("category", e.target.value || null)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              >
                <option value="">— নির্বাচন করুন —</option>
                {shopCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="ব্যাজ">
              <select
                value={p.badge ?? ""}
                onChange={(e) => set("badge", e.target.value || null)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              >
                {badgeOptions.map((b) => (
                  <option key={b} value={b}>
                    {b === "" ? "কোনোটি নয়" : b}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        <Card title="ছবি">
          <div>
            <ImageField label="প্রধান ছবি" value={p.image} onChange={(v) => set("image", v)} />
            {validationErrors.image && (
              <p className="mt-1 text-xs font-medium text-red-600">{validationErrors.image}</p>
            )}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">গ্যালারি ছবি (অতিরিক্ত)</span>
            {p.images.map((img, i) => (
              <GalleryImageInput
                key={i}
                value={img}
                onChange={(v) =>
                  set("images", p.images.map((x, idx) => (idx === i ? v : x)))
                }
                onRemove={() => set("images", p.images.filter((_, idx) => idx !== i))}
              />
            ))}
            <button
              type="button"
              onClick={() => set("images", [...p.images, ""])}
              className="flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> ছবি যোগ করুন
            </button>
          </div>
        </Card>

        <Card title="ভ্যারিয়েন্ট">
          <div className="flex flex-col gap-4">
            <TextField
              label="রং (কমা দিয়ে আলাদা)"
              value={p.colors.join(", ")}
              onChange={(v) => set("colors", v.split(",").map((x) => x.trim()).filter(Boolean))}
            />
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground">সাইজ</span>
              <div className="flex flex-wrap gap-2">
                {shopSizes.map((size) => {
                  const active = p.sizes.includes(size)
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`h-9 min-w-11 rounded-lg border px-3 text-sm font-medium transition-colors ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background text-foreground hover:border-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </Card>

        <Card title="স্ট্যাটাস ও রেটিং">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Toggle label="স্টকে আছে" checked={p.inStock} onChange={(v) => set("inStock", v)} />
            <Toggle label="ফিচার্ড প্রোডাক্ট" checked={p.featured} onChange={(v) => set("featured", v)} />
            <Toggle label="নিউ অ্যারাইভাল" checked={p.newArrival} onChange={(v) => set("newArrival", v)} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField
              label="রেটিং (0-5)"
              type="number"
              value={p.rating}
              onChange={(v) => set("rating", Math.max(0, Math.min(5, Number(v) || 0)))}
            />
            <TextField
              label="রিভিউ সংখ্যা"
              type="number"
              value={p.reviews}
              onChange={(v) => set("reviews", Number(v) || 0)}
            />
            <TextField
              label="সাজানোর ক্রম"
              type="number"
              value={p.sortOrder}
              onChange={(v) => set("sortOrder", Number(v) || 0)}
            />
          </div>
        </Card>
      </div>

      <SaveBar onSave={save} isDirty={isDirty} />
    </div>
  )
}
