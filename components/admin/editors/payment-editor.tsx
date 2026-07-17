"use client"

import { useState, useMemo } from "react"
import type { PaymentConfig } from "@/lib/site-config"
import { saveSectionAction } from "@/app/admin/actions"
import { PageTitle, Card, TextField, Toggle } from "@/components/admin/ui"
import { SaveBar } from "@/components/admin/save-bar"

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function PaymentEditor({ initial }: { initial: PaymentConfig }) {
  const [p, setP] = useState<PaymentConfig>(initial)

  const isDirty = useMemo(() => !deepEqual(initial, p), [initial, p])

  const set = <K extends keyof PaymentConfig>(k: K, v: PaymentConfig[K]) =>
    setP((prev) => ({ ...prev, [k]: v }))

  async function save() {
    await saveSectionAction("payment", p)
  }

  return (
    <div className="max-w-3xl">
      <PageTitle
        title="পেমেন্ট ও ডেলিভারি সেটিংস"
        description="পেমেন্ট নাম্বার, ব্যাংক তথ্য এবং ডেলিভারি চার্জ এখান থেকে আপডেট করুন।"
      />

      <div className="flex flex-col gap-5">

        {/* ─── Delivery Charges ─── */}
        <Card title="ডেলিভারি চার্জ">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="ঢাকার ভিতরে চার্জ (টাকা)"
              type="number"
              value={p.insideDhakaCharge ?? 60}
              placeholder="যেমন: 60"
              onChange={(v) => set("insideDhakaCharge", Number(v) || 0)}
            />
            <TextField
              label="ঢাকার বাইরে চার্জ (টাকা)"
              type="number"
              value={p.outsideDhakaCharge ?? 120}
              placeholder="যেমন: 120"
              onChange={(v) => set("outsideDhakaCharge", Number(v) || 0)}
            />
          </div>
          <div className="mt-4">
            <Toggle
              label="ক্যাশ অন ডেলিভারি (COD) চালু আছে"
              checked={p.codEnabled ?? true}
              onChange={(v) => set("codEnabled", v)}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            ডেলিভারি চার্জ চেকআউট পেজে অর্ডার সামারিতে দেখানো হবে এবং অর্ডারের মোট হিসাবে যোগ হবে।
          </p>
        </Card>

        {/* ─── bKash ─── */}
        <Card title="বিকাশ (bKash)">
          <TextField
            label="বিকাশ পার্সোনাল নাম্বার"
            value={p.bkashNumber}
            placeholder="01XXXXXXXXX"
            onChange={(v) => set("bkashNumber", v)}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            গ্রাহক বিকাশ সিলেক্ট করলে এই নাম্বারটি চেকআউট পেজে দেখানো হবে।
          </p>
        </Card>

        {/* ─── Nagad ─── */}
        <Card title="নগদ (Nagad)">
          <TextField
            label="নগদ পার্সোনাল নাম্বার"
            value={p.nagadNumber}
            placeholder="01XXXXXXXXX"
            onChange={(v) => set("nagadNumber", v)}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            গ্রাহক নগদ সিলেক্ট করলে এই নাম্বারটি চেকআউট পেজে দেখানো হবে।
          </p>
        </Card>

        {/* ─── Bank Transfer ─── */}
        <Card title="ব্যাংক ট্রান্সফার">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="ব্যাংকের নাম"
              value={p.bankName}
              placeholder="যেমন: The City Bank PLC"
              onChange={(v) => set("bankName", v)}
            />
            <TextField
              label="একাউন্ট নাম"
              value={p.bankAccountName}
              placeholder="যেমন: IR Feel Enterprise"
              onChange={(v) => set("bankAccountName", v)}
            />
            <TextField
              label="একাউন্ট নম্বর"
              value={p.bankAccountNumber}
              placeholder="যেমন: 1203456789001"
              onChange={(v) => set("bankAccountNumber", v)}
            />
            <TextField
              label="ব্রাঞ্চ"
              value={p.bankBranch}
              placeholder="যেমন: Gulshan Branch, Dhaka"
              onChange={(v) => set("bankBranch", v)}
            />
            <TextField
              label="রাউটিং নম্বর"
              value={p.bankRoutingNumber}
              placeholder="যেমন: 225261234"
              onChange={(v) => set("bankRoutingNumber", v)}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            গ্রাহক ব্যাংক ট্রান্সফার সিলেক্ট করলে এই তথ্যগুলো চেকআউট পেজে দেখানো হবে।
          </p>
        </Card>
      </div>

      <SaveBar onSave={save} isDirty={isDirty} />
    </div>
  )
}
