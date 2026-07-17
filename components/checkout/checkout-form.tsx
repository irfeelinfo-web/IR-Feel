"use client"

import { useState, useEffect, useRef } from "react"
import { Truck, CreditCard, ShieldCheck, ChevronRight, Loader2, CheckCircle2, Copy, Check, PackageSearch, ShoppingBag, Sparkles } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { createOrderAction } from "@/app/admin/actions"
import type { PaymentConfig } from "@/lib/site-config"
import { defaultPayment } from "@/lib/site-config"

type PaymentMethod = "cod" | "bkash" | "nagad" | "bank"

const paymentOptions: {
  id: PaymentMethod
  title: string
  desc: string
  logo: string
  badge?: string
}[] = [
  {
    id: "cod",
    title: "ক্যাশ অন ডেলিভারি",
    desc: "পণ্য হাতে পেয়ে টাকা পরিশোধ করুন",
    logo: "/images/pay-cod.png",
    badge: "সর্বাধিক জনপ্রিয়",
  },
  {
    id: "bkash",
    title: "বিকাশ",
    desc: "বিকাশ নাম্বারে পেমেন্ট করুন",
    logo: "/images/pay-bkash.png",
  },
  {
    id: "nagad",
    title: "নগদ",
    desc: "নগদ নাম্বারে পেমেন্ট করুন",
    logo: "/images/pay-nagad.png",
  },
  {
    id: "bank",
    title: "ব্যাংক ট্রান্সফার",
    desc: "যেকোনো ব্যাংক থেকে পেমেন্ট করুন",
    logo: "/images/pay-bank.png",
  },
]

export function CheckoutForm({ payment: paymentConfig = defaultPayment, freeShippingThreshold = 0 }: { payment?: PaymentConfig; freeShippingThreshold?: number }) {
  const { items, subtotal, clear, deliveryLocation, setDeliveryLocation } = useCart()

  // Filter out COD if disabled in admin settings
  const availablePaymentOptions = paymentConfig.codEnabled === false
    ? paymentOptions.filter((o) => o.id !== "cod")
    : paymentOptions
  const defaultMethod: PaymentMethod = availablePaymentOptions[0]?.id ?? "cod"

  const [payment, setPayment] = useState<PaymentMethod>(defaultMethod)
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle")
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const submittingRef = useRef(false)

  const insideCharge = paymentConfig.insideDhakaCharge ?? 60
  const outsideCharge = paymentConfig.outsideDhakaCharge ?? 120
  // Apply free shipping threshold — waive delivery charge when subtotal exceeds threshold
  const isFreeShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold
  const deliveryCharge = items.length > 0 && !isFreeShipping ? (deliveryLocation === "outside" ? outsideCharge : insideCharge) : 0
  const total = subtotal + deliveryCharge

  // Lock body scroll when success modal is open
  useEffect(() => {
    if (status === "done") {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [status])

  const handleCopyOrderId = async () => {
    if (!orderId) return
    try {
      await navigator.clipboard.writeText(orderId ?? "")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const el = document.createElement("textarea")
      el.value = orderId ?? ""
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (items.length === 0 || status === "saving" || submittingRef.current) return
    submittingRef.current = true

    const form = e.currentTarget
    const data = new FormData(form)
    const customerName = String(data.get("name") ?? "").trim()
    const phone = String(data.get("phone") ?? "").trim()
    const address = String(data.get("address") ?? "").trim()

    setError(null)
    setStatus("saving")

    let transactionId = ""
    if (payment === "bank") {
      const bankName = String(data.get("bank_name") ?? "").trim()
      const bankTxn = String(data.get("bank_txn") ?? "").trim()
      transactionId = `${bankName} - ${bankTxn}`
    } else {
      transactionId = String(data.get("txn") ?? "").trim()
    }

    const res = await createOrderAction({
      customerName,
      phone,
      address,
      location: deliveryLocation,
      paymentMethod: payment,
      transactionId: transactionId || null,
      items,
      subtotal,
      deliveryCharge,
      total,
    })

    if (!res.ok) {
      setError(res.error ?? "কিছু একটা সমস্যা হয়েছে।")
      setStatus("idle")
      submittingRef.current = false
      return
    }

    setOrderId(res.uid ?? null)
    setStatus("done")
    // Delay cart clear so order summary stays visible behind the modal
    setTimeout(() => clear(), 300)
  }

  return (
    <>
      {/* ── Order Success Modal Popup ── */}
      {status === "done" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ animation: "modal-backdrop-in 0.3s ease forwards" }}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => {}} />

          {/* Modal Card */}
          <div
            className="font-bengali relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            style={{ animation: "modal-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          >
            {/* Close button */}
            <a
              href="/shop"
              className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
              title="বন্ধ করুন"
            >
              ✕
            </a>

            {/* Animated gradient top strip */}
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600">
              {/* Floating particles */}
              <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                  <span
                    key={i}
                    className="absolute block rounded-full bg-white/20"
                    style={{
                      width: `${6 + (i % 4) * 4}px`,
                      height: `${6 + (i % 4) * 4}px`,
                      left: `${8 + (i * 7.5) % 85}%`,
                      top: `${10 + (i * 13) % 70}%`,
                      animation: `float-particle ${3 + (i % 3)}s ease-in-out ${i * 0.3}s infinite alternate`,
                    }}
                  />
                ))}
              </div>

              {/* Success icon */}
              <div className="relative flex h-full flex-col items-center justify-center gap-2.5">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 shadow-lg backdrop-blur-sm"
                  style={{ animation: "success-pop 0.5s 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) both" }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" strokeWidth={1.8} />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-white/90">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium tracking-wide">Order Confirmed</span>
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col items-center gap-5 px-6 pb-7 pt-5 text-center sm:px-8">
              <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                অর্ডার সফলভাবে সম্পন্ন হয়েছে! 🎉
              </h2>

              {/* Order ID with copy */}
              {orderId && (
                <div className="group relative w-full max-w-xs">
                  <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 opacity-60 blur-sm transition group-hover:opacity-100" />
                  <div className="relative flex items-center justify-between gap-3 rounded-xl border border-emerald-200/50 bg-card px-5 py-3.5 dark:border-emerald-800/50">
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">অর্ডার আইডি</span>
                      <span className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">{orderId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyOrderId}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ease-out active:scale-90 ${
                        copied
                          ? "border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-700 dark:bg-emerald-950/50"
                          : "border-border bg-secondary text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30"
                      }`}
                      title="অর্ডার আইডি কপি করুন"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  {copied && (
                    <span
                      className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                      style={{ animation: "fade-in-up 0.3s ease" }}
                    >
                      কপি করা হয়েছে! ✓
                    </span>
                  )}
                </div>
              )}

              {/* Info message */}
              <div className="mt-1 flex items-start gap-3 rounded-xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 text-left dark:border-amber-800/40 dark:bg-amber-950/20">
                <span className="mt-0.5 text-base">📦</span>
                <p className="text-[13px] leading-relaxed text-amber-900 dark:text-amber-200/90">
                  আপনার অর্ডারটি আমরা পেয়েছি। শীঘ্রই আমাদের একজন প্রতিনিধি আপনার সাথে যোগাযোগ করে অর্ডারটি নিশ্চিত করবেন।
                </p>
              </div>

              {/* Steps indicator */}
              <div className="flex w-full max-w-sm items-center justify-between px-2 py-1">
                <StepDot label="অর্ডার প্লেসড" active done />
                <div className="h-px flex-1 bg-emerald-300 dark:bg-emerald-700" />
                <StepDot label="কনফার্মড" active={false} done={false} />
                <div className="h-px flex-1 bg-border" />
                <StepDot label="ডেলিভারি" active={false} done={false} />
              </div>

              {/* Action buttons */}
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                <a
                  href="/track-order"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition-all duration-300 ease-out active:scale-95 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
                >
                  <PackageSearch className="h-4 w-4" />
                  অর্ডার ট্র্যাক করুন
                </a>
                <a
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-all duration-300 ease-out active:scale-95 hover:opacity-90"
                >
                  <ShoppingBag className="h-4 w-4" />
                  আরও কেনাকাটা করুন
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    <form onSubmit={handleSubmit} className={`font-bengali flex flex-col gap-6 transition-opacity duration-300 ${status === "done" ? "pointer-events-none opacity-50" : ""}`}>
      {/* Delivery information */}
      <section className="glass-order-card rounded-lg border border-border p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <Truck className="h-5 w-5 text-foreground" strokeWidth={1.8} />
          <h2 className="text-base font-semibold text-foreground">ডেলিভারি তথ্য</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm text-foreground">
              আপনার নাম <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              placeholder="আপনার পূর্ণ নাম"
              className="h-11 rounded-[10px] border-2 border-border/50 bg-background/50 px-3 text-base text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:!border-black dark:focus:!border-white focus:ring-1 focus:ring-black dark:focus:ring-white focus:shadow-md focus:shadow-emerald-500/15 hover:border-foreground/20"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-sm text-foreground">
              মোবাইল নাম্বার <span className="text-destructive">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              required
              inputMode="numeric"
              pattern="^01[3-9]\d{8}$"
              title="সঠিক বাংলাদেশি মোবাইল নাম্বার দিন (যেমন: 01712345678)"
              placeholder="01XXXXXXXXX"
              className="h-11 rounded-[10px] border-2 border-border/50 bg-background/50 px-3 text-base text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:!border-black dark:focus:!border-white focus:ring-1 focus:ring-black dark:focus:ring-white focus:shadow-md focus:shadow-emerald-500/15 hover:border-foreground/20"
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label htmlFor="address" className="text-sm text-foreground">
              ঠিকানা <span className="text-destructive">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              required
              rows={2}
              placeholder="বাড়ি/রোড, এলাকা, থানা, জেলা"
              className="resize-none rounded-[10px] border-2 border-border/50 bg-background/50 px-3 py-2.5 text-base text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:!border-black dark:focus:!border-white focus:ring-1 focus:ring-black dark:focus:ring-white focus:shadow-md focus:shadow-emerald-500/15 hover:border-foreground/20"
            />
          </div>
        </div>

        {/* Delivery location */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-foreground">ডেলিভারির লোকেশন</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <LocationOption
              active={deliveryLocation === "inside"}
              onClick={() => setDeliveryLocation("inside")}
              title="ঢাকার ভিতরে"
              desc="ডেলিভারি সময়: ১ - ২ কর্মদিবস"
            />
            <LocationOption
              active={deliveryLocation === "outside"}
              onClick={() => setDeliveryLocation("outside")}
              title="ঢাকার বাইরে"
              desc="ডেলিভারি সময়: ২ - ৪ কর্মদিবস"
            />
          </div>
        </div>

      </section>

      {/* Payment method */}
      <section className="glass-order-card rounded-lg border border-border p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-foreground" strokeWidth={1.8} />
          <h2 className="text-base font-semibold text-foreground">পেমেন্ট পদ্ধতি</h2>
        </div>

        <div className="flex flex-col gap-3">
          {availablePaymentOptions.map((opt) => (
            <div key={opt.id} className="flex flex-col gap-2">
              <PaymentOption
                active={payment === opt.id}
                onClick={() => setPayment(opt.id)}
                option={opt}
              />
              
              {/* Dynamic Number & TrxID show for bKash and Nagad */}
              {payment === opt.id && (opt.id === "bkash" || opt.id === "nagad") && (
                <div className="mx-1 mt-1 rounded-md bg-secondary/60 p-4 border border-border/60" style={{ animation: "fade-slide-in 0.25s ease-out" }}>
                  <p className="text-sm font-semibold text-foreground">
                    আমাদের {opt.title} পার্সোনাল নাম্বার: <span className="font-mono text-primary font-bold">{opt.id === "bkash" ? paymentConfig.bkashNumber : paymentConfig.nagadNumber}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    দয়া করে উপরের নাম্বারে <span className="font-semibold text-foreground">সেন্ড মানি (Send Money)</span> করুন এবং নিচের ট্রান্সেকশন আইডি দিন।
                  </p>
                  
                  <div className="mt-3.5 flex flex-col gap-1.5">
                    <label htmlFor="txn" className="text-xs font-semibold text-foreground">
                      ট্রান্সেকশন আইডি (TrxID) <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="txn"
                      name="txn"
                      required={payment === opt.id}
                      placeholder="যেমন: 8N7A6D5C"
                      className="h-10 w-full rounded-[10px] border-2 border-border/50 bg-background/50 px-3 text-base text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:!border-black dark:focus:!border-white focus:ring-1 focus:ring-black dark:focus:ring-white focus:shadow-md focus:shadow-emerald-500/15 hover:border-foreground/20"
                    />
                  </div>
                </div>
              )}

              {/* Dynamic Bank details for Bank Transfer */}
              {payment === opt.id && opt.id === "bank" && (
                <div className="mx-1 mt-1 rounded-md bg-secondary/60 p-4 border border-border/60 flex flex-col gap-4" style={{ animation: "fade-slide-in 0.25s ease-out" }}>
                  <div className="rounded-md border border-border/40 bg-background/50 p-3.5 text-xs leading-relaxed text-foreground">
                    <p className="font-semibold text-sm border-b border-border/40 pb-1.5 mb-2">আমাদের ব্যাংক একাউন্ট তথ্য:</p>
                    <p className="mb-0.5"><strong>ব্যাংক নাম:</strong> {paymentConfig.bankName}</p>
                    <p className="mb-0.5"><strong>একাউন্ট নাম:</strong> {paymentConfig.bankAccountName}</p>
                    <p className="mb-0.5"><strong>একাউন্ট নম্বর:</strong> {paymentConfig.bankAccountNumber}</p>
                    <p className="mb-0.5"><strong>ব্রাঞ্চ:</strong> {paymentConfig.bankBranch}</p>
                    <p><strong>রাউটিং নম্বর:</strong> {paymentConfig.bankRoutingNumber}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    দয়া করে উপরের ব্যাংক একাউন্টে ফান্ড ট্রান্সফার (NPSB, BEFTN, বা RTGS) করুন এবং নিচে আপনার প্রেরক তথ্য দিন।
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="bank_name" className="text-xs font-semibold text-foreground">
                        আপনার ব্যাংকের নাম <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="bank_name"
                        name="bank_name"
                        required={payment === "bank"}
                        placeholder="যেমন: ডাচ-বাংলা ব্যাংক"
                        className="h-10 w-full rounded-[10px] border-2 border-border/50 bg-background/50 px-3 text-base text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:!border-black dark:focus:!border-white focus:ring-1 focus:ring-black dark:focus:ring-white focus:shadow-md focus:shadow-emerald-500/15 hover:border-foreground/20"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="bank_txn" className="text-xs font-semibold text-foreground">
                        ট্রান্সেকশন আইডি / রেফারেন্স <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="bank_txn"
                        name="bank_txn"
                        required={payment === "bank"}
                        placeholder="যেমন: FT2607060001"
                        className="h-10 w-full rounded-[10px] border-2 border-border/50 bg-background/50 px-3 text-base text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:!border-black dark:focus:!border-white focus:ring-1 focus:ring-black dark:focus:ring-white focus:shadow-md focus:shadow-emerald-500/15 hover:border-foreground/20"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Submit */}
      {error && (
        <p className="rounded-md bg-destructive/10 px-4 py-3 text-center text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "saving" || items.length === 0}
        className="btn-checkout-premium flex h-14 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "saving" ? (
          <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.8} />
        ) : (
          <ShieldCheck className="animate-shield-movement h-5 w-5 text-current" strokeWidth={1.8} />
        )}
        {status === "saving" ? "অর্ডার প্রসেস হচ্ছে..." : "অর্ডার নিশ্চিত করুন"}
      </button>

      <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
        আপনার তথ্য ১০০% নিরাপদ
      </p>
    </form>
    </>
  )
}

function LocationOption({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean
  onClick: () => void
  title: string
  desc: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-[10px] border-2 px-4 py-2.5 text-left transition-all duration-300 ease-out active:scale-[0.98] ${
        active ? "!border-black dark:!border-white bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl shadow-md shadow-emerald-500/15" : "border-transparent bg-background/50 hover:border-black/20 hover:bg-background/80"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          active ? "border-foreground" : "border-muted-foreground/50"
        }`}
      >
        {active && <span className="h-2.5 w-2.5 rounded-full bg-foreground" />}
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{desc}</span>
      </span>
    </button>
  )
}

function PaymentOption({
  active,
  onClick,
  option,
}: {
  active: boolean
  onClick: () => void
  option: { id: string; title: string; desc: string; logo: string; badge?: string }
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-[10px] border-2 px-4 py-2.5 text-left transition-all duration-300 ease-out active:scale-[0.98] ${
        active ? "!border-black dark:!border-white bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl shadow-md shadow-emerald-500/15" : "border-transparent bg-background/50 hover:border-black/20 hover:bg-background/80"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          active ? "border-foreground" : "border-muted-foreground/50"
        }`}
      >
        {active && <span className="h-2.5 w-2.5 rounded-full bg-foreground" />}
      </span>
      <img src={option.logo || "/placeholder.svg"} alt={option.title} className="h-8 w-10 shrink-0 object-contain" />
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{option.title}</span>
      </span>
      {option.badge && (
        <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
          {option.badge}
          <ChevronRight className="h-3 w-3" />
        </span>
      )}
    </button>
  )
}

function StepDot({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
          done
            ? "border-emerald-500 bg-emerald-500 text-white"
            : active
              ? "border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
              : "border-border bg-muted text-muted-foreground"
        }`}
      >
        {done ? "✓" : ""}
      </div>
      <span className={`text-[10px] font-semibold ${
        done ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
      }`}>
        {label}
      </span>
    </div>
  )
}
