"use client"

import { useState, useMemo } from "react"
import type {
  HomeConfig,
  HeroSlide,
  CategoryItem,
  PromoBanner,
  FeatureItem,
  ReviewItem,
} from "@/lib/site-config"
import { saveSectionAction } from "@/app/admin/actions"
import {
  PageTitle,
  Card,
  TextField,
  AreaField,
  Toggle,
  ArrayItem,
  AddButton,
  moveItem,
} from "@/components/admin/ui"
import { ImageField } from "@/components/admin/image-field"
import { SaveBar } from "@/components/admin/save-bar"

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function HomeEditor({ initial }: { initial: HomeConfig }) {
  const [h, setH] = useState<HomeConfig>(initial)

  const isDirty = useMemo(() => !deepEqual(initial, h), [initial, h])

  const set = <K extends keyof HomeConfig>(k: K, v: HomeConfig[K]) => setH((p) => ({ ...p, [k]: v }))

  const updateSlide = (i: number, patch: Partial<HeroSlide>) =>
    set("heroSlides", h.heroSlides.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  const updateCategory = (i: number, patch: Partial<CategoryItem>) =>
    set("categories", h.categories.map((c, idx) => (idx === i ? { ...c, ...patch } : c)))
  const updateBanner = (i: number, patch: Partial<PromoBanner>) =>
    set("promoBanners", h.promoBanners.map((b, idx) => (idx === i ? { ...b, ...patch } : b)))
  const updateFeature = (i: number, patch: Partial<FeatureItem>) =>
    set("features", h.features.map((f, idx) => (idx === i ? { ...f, ...patch } : f)))
  const updateReview = (i: number, patch: Partial<ReviewItem>) =>
    set("reviews", h.reviews.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))

  return (
    <div className="max-w-3xl">
      <PageTitle title="হোমপেজ" description="হিরো স্লাইডার, ক্যাটাগরি, ব্যানার, ফিচার ও রিভিউ বদলান।" />

      <div className="flex flex-col gap-5">
        <Card title="হিরো স্লাইডার">
          <div className="flex flex-col gap-3">
            {h.heroSlides.map((s, i) => (
              <ArrayItem
                key={i}
                index={i}
                total={h.heroSlides.length}
                title={s.titleLine1 || "স্লাইড"}
                onMove={(from, to) => set("heroSlides", moveItem(h.heroSlides, from, to))}
                onRemove={(idx) => set("heroSlides", h.heroSlides.filter((_, x) => x !== idx))}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextField label="লেবেল" value={s.label} onChange={(v) => updateSlide(i, { label: v })} />
                  <TextField label="টাইটেল লাইন ১" value={s.titleLine1} onChange={(v) => updateSlide(i, { titleLine1: v })} />
                  <TextField label="টাইটেল লাইন ২" value={s.titleLine2} onChange={(v) => updateSlide(i, { titleLine2: v })} />
                  <TextField label="অ্যাকসেন্ট শব্দ" value={s.accent} onChange={(v) => updateSlide(i, { accent: v })} />
                </div>
                <div className="mt-3">
                  <AreaField label="সাবটাইটেল" value={s.subtitle} onChange={(v) => updateSlide(i, { subtitle: v })} />
                </div>
                <div className="mt-3">
                  <ImageField label="স্লাইড ইমেজ" value={s.image} onChange={(v) => updateSlide(i, { image: v })} />
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextField label="ইমেজ Alt টেক্সট" value={s.alt} onChange={(v) => updateSlide(i, { alt: v })} />
                  <TextField label="বাটন টেক্সট" value={s.buttonText} onChange={(v) => updateSlide(i, { buttonText: v })} />
                  <TextField label="বাটন লিংক" value={s.buttonHref} onChange={(v) => updateSlide(i, { buttonHref: v })} />
                </div>
              </ArrayItem>
            ))}
            <AddButton
              label="নতুন স্লাইড"
              onClick={() =>
                set("heroSlides", [
                  ...h.heroSlides,
                  {
                    label: "NEW",
                    titleLine1: "TITLE",
                    titleLine2: "LINE ",
                    accent: "ACCENT",
                    subtitle: "",
                    image: "",
                    alt: "",
                    buttonText: "SHOP NOW",
                    buttonHref: "/shop",
                  },
                ])
              }
            />
          </div>
        </Card>

        <Card title="সেকশন হেডিং">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="ফিচার্ড হেডিং" value={h.featuredHeading} onChange={(v) => set("featuredHeading", v)} />
            <TextField label="ফিচার্ড সাব-হেডিং" value={h.featuredSubheading} onChange={(v) => set("featuredSubheading", v)} />
            <TextField label="ক্যাটাগরি হেডিং" value={h.categoriesHeading} onChange={(v) => set("categoriesHeading", v)} />
            <TextField label="নিউ অ্যারাইভাল হেডিং" value={h.newArrivalsHeading} onChange={(v) => set("newArrivalsHeading", v)} />
            <TextField label="নিউ অ্যারাইভাল সাব-হেডিং" value={h.newArrivalsSubheading} onChange={(v) => set("newArrivalsSubheading", v)} />
            <TextField label="রিভিউ হেডিং" value={h.reviewsHeading} onChange={(v) => set("reviewsHeading", v)} />
            <TextField label="রিভিউ রেটিং টেক্সট" value={h.reviewsRatingText} onChange={(v) => set("reviewsRatingText", v)} />
          </div>
        </Card>

        <Card title="ক্যাটাগরি কার্ড">
          <div className="flex flex-col gap-3">
            {h.categories.map((c, i) => (
              <ArrayItem
                key={i}
                index={i}
                total={h.categories.length}
                title={c.name || "ক্যাটাগরি"}
                onMove={(from, to) => set("categories", moveItem(h.categories, from, to))}
                onRemove={(idx) => set("categories", h.categories.filter((_, x) => x !== idx))}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextField label="নাম" value={c.name} onChange={(v) => updateCategory(i, { name: v })} />
                  <TextField label="লিংক" value={c.href} onChange={(v) => updateCategory(i, { href: v })} />
                </div>
                <div className="mt-3">
                  <ImageField label="ছবি" value={c.image} onChange={(v) => updateCategory(i, { image: v })} />
                </div>
              </ArrayItem>
            ))}
            <AddButton
              label="নতুন ক্যাটাগরি"
              onClick={() => set("categories", [...h.categories, { name: "NEW", image: "", href: "/shop" }])}
            />
          </div>
        </Card>

        <Card title="প্রোমো ব্যানার">
          <div className="flex flex-col gap-3">
            {h.promoBanners.map((b, i) => (
              <ArrayItem
                key={i}
                index={i}
                total={h.promoBanners.length}
                title={b.title || "ব্যানার"}
                onMove={(from, to) => set("promoBanners", moveItem(h.promoBanners, from, to))}
                onRemove={(idx) => set("promoBanners", h.promoBanners.filter((_, x) => x !== idx))}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextField label="টাইটেল" value={b.title} onChange={(v) => updateBanner(i, { title: v })} />
                  <TextField label="হাইলাইট" value={b.highlight} onChange={(v) => updateBanner(i, { highlight: v })} />
                  <TextField label="সাবটাইটেল" value={b.subtitle} onChange={(v) => updateBanner(i, { subtitle: v })} />
                  <TextField label="নোট" value={b.note} onChange={(v) => updateBanner(i, { note: v })} />
                  <TextField label="বাটন টেক্সট" value={b.buttonText} onChange={(v) => updateBanner(i, { buttonText: v })} />
                  <TextField label="বাটন লিংক" value={b.buttonHref} onChange={(v) => updateBanner(i, { buttonHref: v })} />
                </div>
                <div className="mt-3">
                  <ImageField label="ছবি (image টাইপের জন্য)" value={b.image} onChange={(v) => updateBanner(i, { image: v })} />
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Toggle
                    label="ইমেজ ব্যানার (বন্ধ থাকলে সলিড রঙ)"
                    checked={b.kind === "image"}
                    onChange={(v) => updateBanner(i, { kind: v ? "image" : "solid" })}
                  />
                  <Toggle label="ডার্ক ব্যাকগ্রাউন্ড" checked={b.dark} onChange={(v) => updateBanner(i, { dark: v })} />
                </div>
              </ArrayItem>
            ))}
            <AddButton
              label="নতুন ব্যানার"
              onClick={() =>
                set("promoBanners", [
                  ...h.promoBanners,
                  {
                    kind: "solid",
                    title: "TITLE",
                    subtitle: "",
                    highlight: "",
                    note: "",
                    image: "",
                    buttonText: "SHOP NOW",
                    buttonHref: "/shop",
                    dark: true,
                  },
                ])
              }
            />
          </div>
        </Card>

        <Card title="ফিচার (আইকন সহ সুবিধা)">
          <div className="flex flex-col gap-3">
            {h.features.map((f, i) => (
              <ArrayItem
                key={i}
                index={i}
                total={h.features.length}
                title={f.title || "ফিচার"}
                onMove={(from, to) => set("features", moveItem(h.features, from, to))}
                onRemove={(idx) => set("features", h.features.filter((_, x) => x !== idx))}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <TextField
                    label="আইকন (Truck, RotateCcw, ShieldCheck, Headphones)"
                    value={f.icon}
                    onChange={(v) => updateFeature(i, { icon: v })}
                  />
                  <TextField label="টাইটেল" value={f.title} onChange={(v) => updateFeature(i, { title: v })} />
                  <TextField label="বর্ণনা" value={f.desc} onChange={(v) => updateFeature(i, { desc: v })} />
                </div>
              </ArrayItem>
            ))}
            <AddButton
              label="নতুন ফিচার"
              onClick={() => set("features", [...h.features, { icon: "Truck", title: "TITLE", desc: "" }])}
            />
          </div>
        </Card>

        <Card title="কাস্টমার রিভিউ">
          <div className="flex flex-col gap-3">
            {h.reviews.map((r, i) => (
              <ArrayItem
                key={i}
                index={i}
                total={h.reviews.length}
                title={r.name || "রিভিউ"}
                onMove={(from, to) => set("reviews", moveItem(h.reviews, from, to))}
                onRemove={(idx) => set("reviews", h.reviews.filter((_, x) => x !== idx))}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextField label="নাম" value={r.name} onChange={(v) => updateReview(i, { name: v })} />
                  <TextField label="ভূমিকা" value={r.role} onChange={(v) => updateReview(i, { role: v })} />
                  <TextField label="ইনিশিয়াল (যেমন AR)" value={r.initials} onChange={(v) => updateReview(i, { initials: v })} />
                  <TextField
                    label="রেটিং (0-5)"
                    type="number"
                    value={r.rating}
                    onChange={(v) => updateReview(i, { rating: Math.max(0, Math.min(5, Number(v) || 0)) })}
                  />
                </div>
                <div className="mt-3">
                  <AreaField label="রিভিউ টেক্সট" value={r.text} onChange={(v) => updateReview(i, { text: v })} />
                </div>
              </ArrayItem>
            ))}
            <AddButton
              label="নতুন রিভিউ"
              onClick={() =>
                set("reviews", [...h.reviews, { name: "", role: "Verified Buyer", rating: 5, text: "", initials: "" }])
              }
            />
          </div>
        </Card>
      </div>

      <SaveBar onSave={async () => void (await saveSectionAction("home", h))} isDirty={isDirty} />
    </div>
  )
}
