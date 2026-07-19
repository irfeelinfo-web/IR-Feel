"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Script from "next/script"
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Loader2,
  AlertCircle,
  LogOut,
  Edit3,
  Save,
  X,
  ShoppingBag,
  Sparkles,
  Shield,
  Clock,
  Plus,
  ArrowRightLeft,
  Send,
  CheckCircle2,
} from "lucide-react"
import { useCustomer } from "@/lib/customer-context"
import {
  registerCustomerAction,
  customerLoginAction,
  updateCustomerProfileAction,
  logoutCustomerAction,
  submitChangeRequestAction,
} from "@/app/admin/actions"

import type { OrderRow } from "@/lib/order-types"
import type { SiteSettings } from "@/lib/site-config"

/* ─── Google global type ─── */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void
          renderButton: (el: HTMLElement, config: Record<string, unknown>) => void
        }
      }
    }
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

/* ═══════════════════════════════════════════════════════════════════════
   Main Account Page Client
   ═══════════════════════════════════════════════════════════════════════ */
export function AccountPageClient({ accountPromo, recentOrders, nextUrl = "/account" }: { accountPromo?: SiteSettings["accountPromo"], recentOrders?: OrderRow[], nextUrl?: string }) {
  const { customer } = useCustomer()

  if (customer) {
    return <ProfileView accountPromo={accountPromo} recentOrders={recentOrders} />
  }

  return <AuthView accountPromo={accountPromo} nextUrl={nextUrl} />
}

/* ═══════════════════════════════════════════════════════════════════════
   Auth View — Login + Register + Google
   ═══════════════════════════════════════════════════════════════════════ */
function AuthView({ accountPromo, nextUrl }: { accountPromo?: SiteSettings["accountPromo"], nextUrl: string }) {
  const router = useRouter()
  const { setCustomer, refresh } = useCustomer()
  const [tab, setTab] = useState<"login" | "register">("login")
  const [loginCredential, setLoginCredential] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [googleLoaded, setGoogleLoaded] = useState(false)
  const googleBtnRef = useRef<HTMLDivElement>(null)



  // Register form
  const [reg, setReg] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  })

  /* ── Google Sign-In ── */
  const handleGoogleResponse = useCallback(
    async (response: { credential: string }) => {
      setBusy(true)
      setError("")
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        })
        const data = await res.json()
        if (data.ok) {
          setCustomer(data.customer)
          router.replace(nextUrl)
        } else {
          setError(data.error || "Google সাইন-ইন ব্যর্থ হয়েছে।")
        }
      } catch {
        setError("সার্ভারের সাথে যোগাযোগ ব্যর্থ হয়েছে।")
      } finally {
        setBusy(false)
      }
    },
    [setCustomer, router],
  )

  useEffect(() => {
    if (googleLoaded && GOOGLE_CLIENT_ID && window.google && googleBtnRef.current) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        locale: "en",
      })
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: googleBtnRef.current.offsetWidth,
        text: "continue_with",
        shape: "pill",
        logo_alignment: "center",
      })
    }
  }, [googleLoaded, handleGoogleResponse])

  /* ── Phone Login ── */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      const res = await customerLoginAction(loginCredential, loginPassword)
      if (res.ok) {
        if (res.customer) setCustomer(res.customer)
        router.replace(nextUrl)
      } else {
        setError(res.error || "লগইন ব্যর্থ হয়েছে।")
      }
    } catch {
      setError("সার্ভারের সাথে যোগাযোগ হয়নি।")
    } finally {
      setBusy(false)
    }
  }

  /* ── Register ── */
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      const res = await registerCustomerAction(reg)
      if (res.ok) {
        if (res.customer) setCustomer(res.customer)
        router.replace(nextUrl)
      } else {
        setError(res.error || "রেজিস্ট্রেশন ব্যর্থ হয়েছে।")
      }
    } catch {
      setError("সার্ভারের সাথে যোগাযোগ হয়নি।")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-[75vh] items-center justify-center overflow-hidden px-4 py-8 sm:py-12">
      {/* Premium ambient background effects */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-foreground/10 to-transparent blur-[120px] opacity-70" />
      <div className="pointer-events-none absolute right-0 top-1/4 -z-10 h-[400px] w-[400px] translate-x-1/3 -translate-y-1/3 rounded-full bg-blue-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] -translate-x-1/4 translate-y-1/3 rounded-full bg-purple-500/10 blur-[120px]" />
      
      {/* Google Identity Services script */}
      {GOOGLE_CLIENT_ID && (
        <Script
          src="https://accounts.google.com/gsi/client?hl=en"
          strategy="afterInteractive"
          onLoad={() => setGoogleLoaded(true)}
        />
      )}

      <div className="mx-auto w-full max-w-[28rem] relative z-10">
        {/* Header */}
        <div className="mb-6 text-center relative z-10">
          <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
            {/* Animated background rings */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 opacity-20 blur-lg animate-pulse" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500 via-purple-500 to-emerald-400 opacity-40 blur-md" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-tr from-foreground to-foreground/80 shadow-xl shadow-foreground/20 overflow-hidden group transition-all duration-500 hover:scale-105 hover:rotate-3">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <User className="h-6 w-6 text-background transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
              <Sparkles className="absolute right-2 top-2 h-3 w-3 text-yellow-300 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:rotate-12" />
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-background shadow-lg ring-1 ring-border/50 animate-bounce" style={{ animationDuration: '3s' }}>
              <Shield className="h-3 w-3 text-emerald-500" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground/50 bg-clip-text text-transparent">স্বাগতম</span>
          </h1>
          <p className="mt-2 text-[13px] font-medium text-muted-foreground max-w-sm mx-auto leading-relaxed">
            আপনার অ্যাকাউন্টে লগইন করুন অথবা নতুন অ্যাকাউন্ট খুলুন
          </p>
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/80 backdrop-blur-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-20 pointer-events-none" />
          
          {/* Google Sign-In */}
          <div className="border-b border-border/50 p-6 sm:p-8">
            {GOOGLE_CLIENT_ID ? (
              <>
                <div ref={googleBtnRef} className="flex items-center justify-center" />
                {!googleLoaded && (
                  <div className="flex h-12 items-center justify-center rounded-full border border-border bg-background/50 text-sm font-medium text-muted-foreground backdrop-blur-sm">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Google লোড হচ্ছে...
                  </div>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => setError("Google Login এর জন্য .env ফাইলে NEXT_PUBLIC_GOOGLE_CLIENT_ID সেটআপ করতে হবে।")}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-background text-sm font-bold text-foreground shadow-sm transition-all hover:bg-muted hover:shadow"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            )}

            <div className="mt-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-border/60" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">অথবা</span>
              <div className="h-px flex-1 bg-border/60" />
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex border-b border-border/50 bg-muted/10">
            <button
              type="button"
              onClick={() => { setTab("login"); setError("") }}
              className={`relative flex-1 py-4 text-center text-sm font-bold tracking-wide transition-colors ${
                tab === "login"
                  ? "text-foreground bg-background"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              লগইন
              {tab === "login" && (
                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-foreground shadow-[0_-2px_10px_rgba(0,0,0,0.1)]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => { setTab("register"); setError("") }}
              className={`relative flex-1 py-4 text-center text-sm font-bold tracking-wide transition-colors ${
                tab === "register"
                  ? "text-foreground bg-background"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              রেজিস্টার
              {tab === "register" && (
                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-foreground shadow-[0_-2px_10px_rgba(0,0,0,0.1)]" />
              )}
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* Error */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200/50 bg-red-50/50 p-4 text-sm font-medium text-red-800 backdrop-blur-sm dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Tab */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <div>
                  <label htmlFor="login-credential" className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    ইমেইল বা মোবাইল নম্বর
                  </label>
                  <div className="relative group">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-500 transition-all duration-300 group-focus-within:scale-110" />
                    <input
                      id="login-credential"
                      type="text"
                      required
                      value={loginCredential}
                      onChange={(e) => setLoginCredential(e.target.value)}
                      placeholder="Email or 01XXXXXXXXX"
                      className="h-14 w-full rounded-2xl border border-border/50 bg-background/50 pl-12 pr-4 text-sm font-medium text-foreground outline-none backdrop-blur-sm transition-all focus:border-foreground focus:bg-background focus:ring-4 focus:ring-foreground/5"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    পাসওয়ার্ড
                  </label>
                  <div className="relative group">
                    <Shield className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500 transition-all duration-300 group-focus-within:scale-110" />
                    <input
                      id="login-password"
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="পাসওয়ার্ড লিখুন"
                      className="h-14 w-full rounded-2xl border border-border/50 bg-background/50 pl-12 pr-4 text-sm font-medium text-foreground outline-none backdrop-blur-sm transition-all focus:border-foreground focus:bg-background focus:ring-4 focus:ring-foreground/5"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="group relative mt-2 flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-foreground text-sm font-bold uppercase tracking-widest text-background transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-foreground/20 active:scale-95 disabled:pointer-events-none disabled:opacity-60"
                >
                  <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                    <div className="relative h-full w-8 bg-white/20" />
                  </div>
                  {busy ? <Loader2 className="h-5 w-5 animate-spin relative z-10" /> : <span className="relative z-10">লগইন করুন</span>}
                </button>

                <p className="mt-2 text-center text-sm text-muted-foreground">
                  অ্যাকাউন্ট নেই?{" "}
                  <button type="button" onClick={() => setTab("register")} className="font-bold text-foreground underline decoration-2 underline-offset-4 hover:text-foreground/80 transition-colors">
                    রেজিস্টার করুন
                  </button>
                </p>
              </form>
            )}

            {/* Register Tab */}
            {tab === "register" && (
              <form onSubmit={handleRegister} className="flex flex-col gap-5">
                <FormField id="reg-name" label="আপনার নাম" required icon={User} iconColor="text-blue-500">
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={reg.name}
                    onChange={(e) => setReg((p) => ({ ...p, name: e.target.value }))}
                    placeholder="আপনার পুরো নাম"
                    className="h-14 w-full rounded-2xl border border-border/50 bg-background/50 pl-12 pr-4 text-sm font-medium text-foreground outline-none backdrop-blur-sm transition-all focus:border-foreground focus:bg-background focus:ring-4 focus:ring-foreground/5"
                  />
                </FormField>

                <FormField id="reg-phone" label="মোবাইল নম্বর" required icon={Phone} iconColor="text-emerald-500">
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    value={reg.phone}
                    onChange={(e) => setReg((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="01XXXXXXXXX"
                    className="h-14 w-full rounded-2xl border border-border/50 bg-background/50 pl-12 pr-4 text-sm font-medium text-foreground outline-none backdrop-blur-sm transition-all focus:border-foreground focus:bg-background focus:ring-4 focus:ring-foreground/5"
                  />
                </FormField>

                <FormField id="reg-email" label="ইমেইল" icon={Mail} iconColor="text-amber-500">
                  <input
                    id="reg-email"
                    type="email"
                    value={reg.email}
                    onChange={(e) => setReg((p) => ({ ...p, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="h-14 w-full rounded-2xl border border-border/50 bg-background/50 pl-12 pr-4 text-sm font-medium text-foreground outline-none backdrop-blur-sm transition-all focus:border-foreground focus:bg-background focus:ring-4 focus:ring-foreground/5"
                  />
                </FormField>

                <FormField id="reg-password" label="পাসওয়ার্ড" required icon={Shield} iconColor="text-purple-500">
                  <input
                    id="reg-password"
                    type="password"
                    required
                    value={reg.password}
                    onChange={(e) => setReg((p) => ({ ...p, password: e.target.value }))}
                    placeholder="পাসওয়ার্ড লিখুন (কমপক্ষে ৬ অক্ষর)"
                    className="h-14 w-full rounded-2xl border border-border/50 bg-background/50 pl-12 pr-4 text-sm font-medium text-foreground outline-none backdrop-blur-sm transition-all focus:border-foreground focus:bg-background focus:ring-4 focus:ring-foreground/5"
                  />
                </FormField>

                <button
                  type="submit"
                  disabled={busy}
                  className="group relative mt-2 flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-foreground text-sm font-bold uppercase tracking-widest text-background transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-foreground/20 active:scale-95 disabled:pointer-events-none disabled:opacity-60"
                >
                  <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                    <div className="relative h-full w-8 bg-white/20" />
                  </div>
                  {busy ? <Loader2 className="h-5 w-5 animate-spin relative z-10" /> : <span className="relative z-10">অ্যাকাউন্ট তৈরি করুন</span>}
                </button>

                <p className="mt-2 text-center text-sm text-muted-foreground">
                  অ্যাকাউন্ট আছে?{" "}
                  <button type="button" onClick={() => setTab("login")} className="font-bold text-foreground underline decoration-2 underline-offset-4 hover:text-foreground/80 transition-colors">
                    লগইন করুন
                  </button>
                </p>
              </form>
            )}
          </div>

          {/* Benefits */}
          <div className="border-t border-border/50 bg-foreground/[0.01] p-4 sm:p-5">
            <p className="mb-3 text-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              অ্যাকাউন্টের এক্সক্লুসিভ সুবিধা
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {[
                { icon: Sparkles, text: "এক্সক্লুসিভ ডিসকাউন্ট", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                { icon: ShoppingBag, text: "দ্রুত চেকআউট", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                { icon: Clock, text: "অর্ডার ট্র্যাকিং", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
                { icon: Shield, text: "নিরাপদ প্রোফাইল", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
              ].map((b) => (
                <div key={b.text} className="flex flex-col items-center gap-1.5 text-center rounded-xl border border-border/60 bg-background/60 p-2 sm:p-3 shadow-sm transition-all hover:bg-background hover:shadow-md">
                  <div className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg ${b.bg} border ${b.border}`}>
                    <b.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${b.color}`} />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-foreground">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   Profile View — Logged in
   ═══════════════════════════════════════════════════════════════════════ */
function ProfileView({ accountPromo, recentOrders = [] }: { accountPromo?: SiteSettings["accountPromo"], recentOrders?: OrderRow[] }) {
  const router = useRouter()
  const { customer, refresh, logout } = useCustomer()
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "settings">("dashboard")
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showAddressForm, setShowAddressForm] = useState(false)
  // Change request modal state
  const [changeReqModal, setChangeReqModal] = useState<{ open: boolean; field: "phone" | "email" }>({ open: false, field: "phone" })
  const [changeReqValue, setChangeReqValue] = useState("")
  const [changeReqBusy, setChangeReqBusy] = useState(false)
  const [changeReqError, setChangeReqError] = useState("")
  const [changeReqSuccess, setChangeReqSuccess] = useState("")
  const [form, setForm] = useState({
    name: customer?.name || "",
    phone: customer?.phone?.startsWith("google_") ? "" : (customer?.phone || ""),
    email: customer?.email || "",
    address: customer?.address || "",
    city: customer?.city || "inside",
  })

  // Update form when customer data changes
  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name,
        phone: customer.phone?.startsWith("google_") ? "" : (customer.phone || ""),
        email: customer.email,
        address: customer.address || "",
        city: customer.city || "inside",
      })
    }
  }, [customer])

  if (!customer) return null

  const initials = customer.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError("")
    setSuccess("")
    try {
      const res = await updateCustomerProfileAction(customer!.id, form)
      if (res.ok) {
        setSuccess("প্রোফাইল সফলভাবে আপডেট হয়েছে!")
        setEditing(false)
        await refresh()
        router.refresh()
      } else {
        setError(res.error || "আপডেট ব্যর্থ হয়েছে।")
      }
    } catch {
      setError("সার্ভারের সাথে যোগাযোগ হয়নি।")
    } finally {
      setBusy(false)
    }
  }

  async function handleLogout() {
    setBusy(true)
    try {
      await logoutCustomerAction()
      await logout()
      router.push("/")
      router.refresh()
    } catch {
      // Fallback
      await logout()
      router.push("/")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const profileContent = (
    <div className="relative min-h-[85vh] px-4 py-12 sm:py-20 overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute left-0 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/5 blur-[120px] opacity-70" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-[500px] w-[500px] translate-x-1/3 translate-y-1/4 rounded-full bg-blue-500/5 blur-[100px] opacity-60" />

      <div className="mx-auto w-full max-w-5xl relative z-10">
        {/* Profile banner */}
        <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/40 backdrop-blur-3xl shadow-xl ring-1 ring-black/5 dark:ring-white/5">
          {/* Decorative glass elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.04] via-transparent to-background/10 pointer-events-none" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl opacity-60 mix-blend-screen dark:mix-blend-lighten" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 blur-3xl opacity-60 mix-blend-screen dark:mix-blend-lighten" />
          
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent opacity-50" />

          <div className="relative flex flex-col items-center gap-5 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
            {/* Avatar */}
            <div className="group relative">
              <div className="absolute -inset-1 rounded-[1.75rem] bg-gradient-to-br from-foreground/20 to-foreground/0 blur-md transition-all duration-500 group-hover:blur-lg opacity-60" />
              {customer.avatar ? (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/20 shadow-lg ring-2 ring-background/50 sm:h-24 sm:w-24 bg-background">
                  <Image
                    src={customer.avatar}
                    alt={customer.name}
                    fill
                    sizes="(max-width: 640px) 80px, 96px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              ) : (
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-foreground to-foreground/80 text-3xl font-extrabold text-background shadow-lg ring-2 ring-background/50 sm:h-24 sm:w-24 sm:text-4xl">
                  {initials}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left w-full">
              <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground drop-shadow-sm truncate">
                {customer.name}
              </h1>
              <div className="mt-2.5 flex flex-col items-center gap-2 text-sm font-medium text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-3">
                {!customer.phone?.startsWith("google_") && (
                  <span className="flex items-center gap-1.5 bg-foreground/5 px-2.5 py-1 rounded-md border border-border/40 shadow-sm backdrop-blur-md">
                    <Phone className="h-3.5 w-3.5 text-foreground/70" /> {customer.phone}
                  </span>
                )}
                {customer.email && (
                  <span className="flex items-center gap-1.5 bg-foreground/5 px-2.5 py-1 rounded-md border border-border/40 shadow-sm backdrop-blur-md">
                    <Mail className="h-3.5 w-3.5 text-foreground/70" /> {customer.email}
                  </span>
                )}
              </div>
              {customer.google_id && (
                <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-md bg-blue-50/80 px-3 py-1.5 text-[11px] font-bold tracking-wide text-blue-700 backdrop-blur-sm border border-blue-200/50 shadow-sm dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google সংযুক্ত
                </div>
              )}
            </div>

            <div className="flex w-full sm:w-auto gap-2 mt-4 sm:mt-0">
              <button
                type="button"
                onClick={() => setEditing(!editing)}
                className="flex-1 sm:flex-none flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-background/80 px-4 text-xs font-bold tracking-wide text-foreground shadow-sm backdrop-blur-xl transition-all hover:bg-background hover:shadow-md active:scale-95"
              >
                {editing ? <X className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
                {editing ? "বাতিল" : "এডিট প্রোফাইল"}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={busy}
                className="flex-1 sm:flex-none flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200/60 bg-red-50/80 px-4 text-xs font-bold tracking-wide text-red-600 shadow-sm backdrop-blur-xl transition-all hover:bg-red-100/80 hover:shadow-md active:scale-95 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400"
              >
                <LogOut className="h-3.5 w-3.5" /> লগআউট
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error messages */}
        {success && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200/50 bg-emerald-50/80 p-4 text-sm font-medium text-emerald-800 backdrop-blur-sm shadow-sm dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-400">
            <Sparkles className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-500" />
            {success}
          </div>
        )}
        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200/50 bg-red-50/80 p-4 text-sm font-medium text-red-800 backdrop-blur-sm shadow-sm dark:border-red-900/30 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-500" />
            {error}
          </div>
        )}

        {/* Content Area */}
        <div className="mt-8 flex flex-col gap-6">
          {/* Tabs Menu */}
          <div className="flex w-full gap-2 overflow-x-auto pb-1 scrollbar-hide border-b border-border/40 snap-x">
            <button 
              type="button"
              onClick={() => setActiveTab('dashboard')} 
              className={`flex-shrink-0 snap-start px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'dashboard' ? 'border-b-2 border-foreground text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              ওভারভিউ
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('orders')} 
              className={`flex-shrink-0 snap-start px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'orders' ? 'border-b-2 border-foreground text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              আমার অর্ডার {recentOrders && recentOrders.length > 0 && `(${recentOrders.length})`}
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('settings')} 
              className={`flex-shrink-0 snap-start px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'settings' ? 'border-b-2 border-foreground text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              প্রোফাইল সেটিংস
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="relative overflow-hidden rounded-3xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-orange-50/50 p-6 shadow-xl dark:border-amber-900/30 dark:from-amber-950/20 dark:to-orange-950/10">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
                    <div className="relative flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-600/80 dark:text-amber-500/80 mb-1 truncate">
                          আপনার রিওয়ার্ড পয়েন্ট
                        </p>
                        <h3 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-amber-700 dark:text-amber-500 drop-shadow-sm">
                          {customer.reward_points || 0}
                        </h3>
                        <p className="text-[10px] sm:text-xs font-medium text-amber-700/70 dark:text-amber-400/70 mt-1 truncate">
                          নেক্সট কেনাকাটায় পয়েন্ট ব্যবহার করুন
                        </p>
                      </div>
                      <div className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30">
                        <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-xl overflow-hidden p-6">
                    <h3 className="text-sm font-bold tracking-tight text-foreground mb-4">সাম্প্রতিক অর্ডার সমূহ</h3>
                    {recentOrders && recentOrders.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {recentOrders.slice(0, 3).map((order: OrderRow) => (
                          <div key={order.id} className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/50 p-4 transition-all hover:bg-muted/30">
                            <div>
                              <p className="text-sm font-bold text-foreground">#{order.order_uid}</p>
                              <p className="text-xs font-medium text-muted-foreground mt-0.5">
                                {new Date(order.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-foreground">৳{order.total}</p>
                              <span className="mt-1 inline-block rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                        {recentOrders.length > 3 && (
                          <button type="button" onClick={() => setActiveTab('orders')} className="mt-2 text-center text-xs font-bold text-blue-600 hover:underline dark:text-blue-400">
                            সব অর্ডার দেখুন
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center opacity-60">
                        <ShoppingBag className="mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">আপনি এখনও কোনো অর্ডার করেননি।</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {recentOrders && recentOrders.length > 0 ? (
                    recentOrders.map((order: OrderRow) => (
                      <div key={order.id} className="overflow-hidden rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-xl">
                        <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-5 py-4">
                          <div>
                            <p className="text-sm font-bold text-foreground">অর্ডার #{order.order_uid}</p>
                            <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                              {new Date(order.created_at).toLocaleString('bn-BD')}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-block rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex flex-col gap-3">
                            {order.items.map((item: OrderRow["items"][0], idx: number) => (
                              <div key={idx} className="flex items-center gap-3 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.qty} x ৳{item.price} {item.size && `| সাইজ: ${item.size}`}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-foreground">৳{item.price * item.qty}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/30 p-4">
                            <span className="text-sm font-bold text-muted-foreground">সর্বমোট</span>
                            <span className="text-lg font-extrabold text-foreground">৳{order.total}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/50 bg-card/40 py-16 text-center">
                      <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground/50" />
                      <h3 className="text-lg font-bold text-foreground">কোনো অর্ডার নেই</h3>
                      <p className="mt-1 text-sm text-muted-foreground">আপনার করা সব অর্ডার এখানে দেখা যাবে।</p>
                      <a href="/shop" className="mt-6 rounded-xl bg-foreground px-6 py-2.5 text-sm font-bold text-background transition-transform hover:scale-105">
                        শপিং করুন
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-5 py-3">
                <h2 className="text-sm font-bold tracking-tight text-foreground">
                  {editing ? "প্রোফাইল এডিট করুন" : "প্রোফাইল তথ্য"}
                </h2>
              </div>

              {editing ? (
                <form onSubmit={handleSave} className="flex flex-col gap-6 p-8">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <FormField id="edit-name" label="নাম" required icon={User} iconColor="text-blue-500">
                        <input
                          id="edit-name"
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          className="h-14 w-full rounded-2xl border border-border/50 bg-background/50 pl-12 pr-4 text-sm font-medium text-foreground outline-none backdrop-blur-sm transition-all focus:border-foreground focus:bg-background focus:ring-4 focus:ring-foreground/5"
                        />
                      </FormField>
                    </div>
                    <div>
                      <FormField id="edit-phone" label={customer.phone?.startsWith("google_") ? "মোবাইল" : "মোবাইল (পরিবর্তনযোগ্য নয়)"} icon={Phone} iconColor="text-emerald-500">
                        <input
                          id="edit-phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                          disabled={!customer.phone?.startsWith("google_")}
                          placeholder={customer.phone?.startsWith("google_") ? "01XXXXXXXXX" : ""}
                          className={`h-14 w-full rounded-2xl border border-border/30 pl-12 pr-4 text-sm font-medium outline-none ${
                            !customer.phone?.startsWith("google_")
                              ? "cursor-not-allowed bg-muted/30 text-muted-foreground"
                              : "bg-background/50 text-foreground backdrop-blur-sm transition-all focus:border-foreground focus:bg-background focus:ring-4 focus:ring-foreground/5"
                          }`}
                        />
                      </FormField>
                      {!customer.phone?.startsWith("google_") && customer.phone && (
                        <button type="button" onClick={() => { setChangeReqModal({ open: true, field: "phone" }); setChangeReqValue(""); setChangeReqError(""); setChangeReqSuccess(""); }} className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors dark:text-blue-400">
                          <ArrowRightLeft className="h-3 w-3" /> পরিবর্তন রিকোয়েস্ট করুন
                        </button>
                      )}
                    </div>

                    <div>
                      <FormField id="edit-email" label={customer.email ? "ইমেইল (পরিবর্তনযোগ্য নয়)" : "ইমেইল"} icon={Mail} iconColor="text-amber-500">
                        <input
                          id="edit-email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                          disabled={!!customer.email}
                          className={`h-14 w-full rounded-2xl border border-border/30 pl-12 pr-4 text-sm font-medium outline-none ${
                            customer.email
                              ? "cursor-not-allowed bg-muted/30 text-muted-foreground"
                              : "bg-background/50 text-foreground backdrop-blur-sm transition-all focus:border-foreground focus:bg-background focus:ring-4 focus:ring-foreground/5"
                          }`}
                        />
                      </FormField>
                      {customer.email && (
                        <button type="button" onClick={() => { setChangeReqModal({ open: true, field: "email" }); setChangeReqValue(""); setChangeReqError(""); setChangeReqSuccess(""); }} className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors dark:text-blue-400">
                          <ArrowRightLeft className="h-3 w-3" /> পরিবর্তন রিকোয়েস্ট করুন
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="address" className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        ঠিকানা
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        value={form.address}
                        onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
                        rows={2}
                        placeholder="বাড়ি/রোড, এলাকা, থানা, জেলা"
                        className="resize-none rounded-2xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-medium text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-foreground focus:bg-background focus:ring-4 focus:ring-foreground/5"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        ডেলিভারির লোকেশন
                      </label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <LocationOption
                          active={form.city === "inside"}
                          onClick={() => setForm(p => ({ ...p, city: "inside" }))}
                          title="ঢাকার ভিতরে"
                          desc="ডেলিভারি সময়: ১ - ২ কর্মদিবস"
                        />
                        <LocationOption
                          active={form.city === "outside"}
                          onClick={() => setForm(p => ({ ...p, city: "outside" }))}
                          title="ঢাকার বাইরে"
                          desc="ডেলিভারি সময়: ২ - ৪ কর্মদিবস"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="group relative mt-2 flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-foreground text-sm font-bold uppercase tracking-widest text-background transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-foreground/20 active:scale-95 disabled:pointer-events-none disabled:opacity-60"
                  >
                    <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                      <div className="relative h-full w-8 bg-white/20" />
                    </div>
                    {busy ? <Loader2 className="h-5 w-5 animate-spin relative z-10" /> : <span className="relative z-10 flex items-center gap-2"><Save className="h-5 w-5" /> পরিবর্তন সংরক্ষণ করুন</span>}
                  </button>
                </form>
              ) : (
                <div className="divide-y divide-border/50">
                  <InfoRow 
                    icon={User} 
                    label="নাম" 
                    value={customer.name} 
                    iconColor="text-blue-500 dark:text-blue-400" 
                    bgClassName="bg-blue-50 dark:bg-blue-950/30" 
                  />
                  {/* Render InfoRows for provided fields */}
                  {!customer.phone?.startsWith("google_") && (
                    <InfoRow 
                      icon={Phone} 
                      label="মোবাইল" 
                      value={customer.phone || ""} 
                      iconColor="text-emerald-500 dark:text-emerald-400" 
                      bgClassName="bg-emerald-50 dark:bg-emerald-950/30" 
                      rightAction={
                        <button type="button" onClick={() => { setChangeReqModal({ open: true, field: "phone" }); setChangeReqValue(""); setChangeReqError(""); setChangeReqSuccess(""); }} className="flex items-center gap-1 rounded-full bg-blue-100/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50">
                          <ArrowRightLeft className="h-3 w-3" /> পরিবর্তন
                        </button>
                      }
                    />
                  )}
                  
                  <InfoRow 
                    icon={Mail} 
                    label="ইমেইল" 
                    value={customer.email || "—"} 
                    iconColor="text-purple-500 dark:text-purple-400" 
                    bgClassName="bg-purple-50 dark:bg-purple-950/30" 
                    rightAction={customer.email ? (
                      <button type="button" onClick={() => { setChangeReqModal({ open: true, field: "email" }); setChangeReqValue(""); setChangeReqError(""); setChangeReqSuccess(""); }} className="flex items-center gap-1 rounded-full bg-blue-100/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50">
                        <ArrowRightLeft className="h-3 w-3" /> পরিবর্তন
                      </button>
                    ) : undefined}
                  />

                  {customer.address && (
                    <>
                      <InfoRow 
                        icon={MapPin} 
                        label="ঠিকানা" 
                        value={customer.address} 
                        iconColor="text-rose-500 dark:text-rose-400" 
                        bgClassName="bg-rose-50 dark:bg-rose-950/30" 
                      />
                      <InfoRow 
                        icon={Building2} 
                        label="লোকেশন" 
                        value={customer.city === 'outside' ? 'ঢাকার বাইরে' : 'ঢাকার ভিতরে'} 
                        iconColor="text-amber-500 dark:text-amber-400" 
                        bgClassName="bg-amber-50 dark:bg-amber-950/30" 
                      />
                    </>
                  )}

                  {/* Form for missing fields */}
                  {(customer.phone?.startsWith("google_") || (!customer.address && showAddressForm)) && (
                    <div className="flex flex-col gap-4 px-5 py-5 bg-emerald-50/20 dark:bg-emerald-950/10">
                      <div className="flex flex-col gap-1.5 mb-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">
                          প্রোফাইল সম্পূর্ণ করুন
                        </label>
                        <p className="text-xs font-medium text-muted-foreground">
                          অর্ডার করতে আপনার প্রয়োজনীয় তথ্যগুলো যুক্ত করুন
                        </p>
                      </div>
                      
                      {customer.phone?.startsWith("google_") && (
                        <form 
                          onSubmit={async (e) => {
                            e.preventDefault();
                            setBusy(true);
                            setError("");
                            setSuccess("");
                            try {
                              const res = await updateCustomerProfileAction(customer.id, {
                                name: customer.name,
                                email: customer.email,
                                phone: form.phone,
                                address: form.address,
                                city: form.city,
                              });
                              if (res.ok) {
                                setSuccess("মোবাইল নম্বর সফলভাবে যুক্ত হয়েছে!");
                                await refresh();
                                router.refresh();
                              } else {
                                setError(res.error || "আপডেট ব্যর্থ হয়েছে।");
                              }
                            } catch {
                              setError("সার্ভারের সাথে যোগাযোগ হয়নি।");
                            } finally {
                              setBusy(false);
                            }
                          }} 
                          className="flex flex-col gap-2 mb-4"
                        >
                          <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">মোবাইল নম্বর <span className="text-red-500">*</span></label>
                          <div className="flex items-center gap-3">
                            <div className="relative flex-1 group">
                              <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-500 transition-all duration-300 group-focus-within:scale-110" />
                              <input
                                type="tel"
                                required
                                value={form.phone}
                                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                                placeholder="01XXXXXXXXX"
                                className="h-12 w-full rounded-xl border border-emerald-200/50 bg-background pl-11 pr-4 text-sm font-medium text-foreground outline-none shadow-sm transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-emerald-900/30"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={busy || !form.phone}
                              className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold tracking-wide text-white shadow-sm transition-all hover:bg-emerald-700 hover:-translate-y-0.5 active:scale-95 disabled:pointer-events-none disabled:opacity-60"
                            >
                              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                              সেভ করুন
                            </button>
                          </div>
                        </form>
                      )}

                      {(!customer.address && showAddressForm) && (
                        <form 
                          onSubmit={async (e) => {
                            e.preventDefault();
                            setBusy(true);
                            setError("");
                            setSuccess("");
                            try {
                              const res = await updateCustomerProfileAction(customer.id, {
                                name: customer.name,
                                email: customer.email,
                                phone: form.phone,
                                address: form.address,
                                city: form.city,
                              });
                              if (res.ok) {
                                setSuccess("ঠিকানা সফলভাবে যুক্ত হয়েছে!");
                                await refresh();
                                router.refresh();
                              } else {
                                setError(res.error || "আপডেট ব্যর্থ হয়েছে।");
                              }
                            } catch {
                              setError("সার্ভারের সাথে যোগাযোগ হয়নি।");
                            } finally {
                              setBusy(false);
                            }
                          }} 
                          className="flex flex-col gap-4"
                        >
                          <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">ঠিকানা <span className="text-red-500">*</span></label>
                            <textarea
                              required
                              value={form.address}
                              onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
                              rows={2}
                              placeholder="বাড়ি/রোড, এলাকা, থানা, জেলা"
                              className="resize-none rounded-xl border border-emerald-200/50 bg-background px-4 py-3 text-sm font-medium text-foreground outline-none shadow-sm transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-emerald-900/30"
                            />
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">ডেলিভারির লোকেশন</label>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <LocationOption
                                active={form.city === "inside"}
                                onClick={() => setForm(p => ({ ...p, city: "inside" }))}
                                title="ঢাকার ভিতরে"
                                desc="১-২ কর্মদিবস"
                              />
                              <LocationOption
                                active={form.city === "outside"}
                                onClick={() => setForm(p => ({ ...p, city: "outside" }))}
                                title="ঢাকার বাইরে"
                                desc="২-৪ কর্মদিবস"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={busy || !form.address}
                            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold tracking-wide text-white shadow-sm transition-all hover:bg-emerald-700 hover:-translate-y-0.5 active:scale-95 disabled:pointer-events-none disabled:opacity-60"
                          >
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            সেভ করুন
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Missing Address Trigger at the bottom */}
                  {(!customer.address && !showAddressForm) && (
                    <div 
                      className="cursor-pointer group"
                      onClick={() => setShowAddressForm(true)}
                      title="ঠিকানা যুক্ত করতে ক্লিক করুন"
                    >
                      <InfoRow 
                        icon={MapPin} 
                        label="ঠিকানা" 
                        value="যুক্ত করা হয়নি" 
                        iconColor="text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform" 
                        bgClassName="bg-rose-50 dark:bg-rose-950/30 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50" 
                        rightAction={
                          <div className="flex items-center gap-1 rounded-full bg-rose-100/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-600 transition-colors group-hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:group-hover:bg-rose-900/50">
                            <Plus className="h-3 w-3" /> যুক্ত করুন
                          </div>
                        }
                      />
                      <InfoRow 
                        icon={Building2} 
                        label="লোকেশন" 
                        value="যুক্ত করা হয়নি" 
                        iconColor="text-amber-500 dark:text-amber-400" 
                        bgClassName="bg-amber-50 dark:bg-amber-950/30" 
                        rightAction={
                          <div className="flex items-center gap-1 rounded-full bg-amber-100/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 transition-colors group-hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:group-hover:bg-amber-900/50">
                            <Plus className="h-3 w-3" /> যুক্ত করুন
                          </div>
                        }
                      />
                    </div>
                  )}
                </div>
              )}
                </div>
              )}
            </div>
          </div>

          {/* Quick links & Sidebar info */}
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/40 backdrop-blur-3xl shadow-xl p-6 sm:p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-background/50 pointer-events-none" />
              <div className="relative z-10">
                <h3 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" /> কুইক লিংকস
                </h3>
                <div className="flex flex-col gap-4">
                  <a
                    href="/shop"
                    className="group relative flex items-center gap-4 rounded-2xl border border-border/40 bg-background/40 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-background hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 shadow-inner ring-1 ring-blue-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="relative flex-1">
                      <p className="text-sm font-bold text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">শপিং করুন</p>
                      <p className="text-[11px] font-medium text-muted-foreground mt-0.5">নতুন কালেকশন দেখুন</p>
                    </div>
                    <div className="relative opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                       <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                  </a>
                  <a
                    href="/track-order"
                    className="group relative flex items-center gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(168,85,247,0.35)] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-colors" />
                    
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-inner ring-1 ring-white/30 backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div className="relative flex-1 text-white">
                      <p className="text-sm font-bold tracking-wide">অর্ডার ট্র্যাক</p>
                      <p className="text-[11px] font-medium text-white/80 mt-0.5">আপনার অর্ডারের অবস্থা</p>
                    </div>
                    <div className="relative opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                       <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Promo / Banner in Sidebar */}
            {accountPromo?.enabled && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-foreground to-foreground/80 p-8 shadow-xl text-background">
                 <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                 <Sparkles className="mb-4 h-8 w-8 text-yellow-400" />
                 <h4 className="text-lg font-bold mb-2">{accountPromo.title}</h4>
                 <p className="text-sm text-background/80 mb-6">
                   {accountPromo.text}
                 </p>
                 <a href={accountPromo.buttonHref} className="inline-block rounded-xl bg-background px-5 py-2.5 text-sm font-bold text-foreground transition-transform hover:scale-105">
                   {accountPromo.buttonText}
                 </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  async function handleChangeRequest() {
    if (!customer) return
    setChangeReqBusy(true)
    setChangeReqError("")
    setChangeReqSuccess("")
    try {
      const res = await submitChangeRequestAction(customer.id, changeReqModal.field, changeReqValue)
      if (res.ok) {
        setChangeReqSuccess("রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে! অ্যাডমিন অনুমোদনের পর পরিবর্তন হবে।")
        setChangeReqValue("")
      } else {
        setChangeReqError(res.error || "রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে।")
      }
    } catch {
      setChangeReqError("সার্ভারের সাথে যোগাযোগ হয়নি।")
    } finally {
      setChangeReqBusy(false)
    }
  }

  // Change Request Modal
  const changeRequestModalUI = changeReqModal.open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setChangeReqModal({ ...changeReqModal, open: false })}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/50 bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-blue-500/5 to-purple-500/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              {changeReqModal.field === "phone" ? <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" /> : <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{changeReqModal.field === "phone" ? "মোবাইল নম্বর" : "ইমেইল"} পরিবর্তন</h3>
              <p className="text-[11px] text-muted-foreground">অ্যাডমিন অনুমোদনের পর পরিবর্তন হবে</p>
            </div>
          </div>
          <button type="button" onClick={() => setChangeReqModal({ ...changeReqModal, open: false })} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Current value */}
          <div className="mb-4 rounded-xl bg-muted/30 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">বর্তমান {changeReqModal.field === "phone" ? "মোবাইল" : "ইমেইল"}</p>
            <p className="text-sm font-semibold text-foreground">{changeReqModal.field === "phone" ? customer.phone : customer.email}</p>
          </div>

          {changeReqSuccess ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{changeReqSuccess}</p>
              <button type="button" onClick={() => setChangeReqModal({ ...changeReqModal, open: false })} className="mt-2 flex h-10 items-center justify-center rounded-xl bg-foreground px-6 text-sm font-bold text-background transition-all hover:opacity-90">
                বন্ধ করুন
              </button>
            </div>
          ) : (
            <>
              {changeReqError && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200/50 bg-red-50/50 p-3 text-xs font-medium text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {changeReqError}
                </div>
              )}

              <div className="mb-4">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  নতুন {changeReqModal.field === "phone" ? "মোবাইল নম্বর" : "ইমেইল"}
                </label>
                <div className="relative group">
                  {changeReqModal.field === "phone" ? (
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-500 transition-all duration-300 group-focus-within:scale-110" />
                  ) : (
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500 transition-all duration-300 group-focus-within:scale-110" />
                  )}
                  <input
                    type={changeReqModal.field === "phone" ? "tel" : "email"}
                    value={changeReqValue}
                    onChange={(e) => setChangeReqValue(e.target.value)}
                    placeholder={changeReqModal.field === "phone" ? "01XXXXXXXXX" : "newemail@example.com"}
                    className="h-14 w-full rounded-2xl border border-border/50 bg-background/50 pl-12 pr-4 text-sm font-medium text-foreground outline-none backdrop-blur-sm transition-all focus:border-foreground focus:bg-background focus:ring-4 focus:ring-foreground/5"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleChangeRequest}
                disabled={changeReqBusy || !changeReqValue.trim()}
                className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-foreground text-sm font-bold uppercase tracking-widest text-background transition-all hover:scale-[1.01] hover:shadow-xl active:scale-95 disabled:pointer-events-none disabled:opacity-60"
              >
                <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                  <div className="relative h-full w-8 bg-white/20" />
                </div>
                {changeReqBusy ? <Loader2 className="h-5 w-5 animate-spin relative z-10" /> : <><Send className="h-4 w-4 relative z-10" /><span className="relative z-10">রিকোয়েস্ট পাঠান</span></>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  ) : null

  return (
    <>{profileContent}{changeRequestModalUI}</>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   Shared UI pieces
   ═══════════════════════════════════════════════════════════════════════ */
function FormField({
  id,
  label,
  required,
  icon: Icon,
  iconColor = "text-muted-foreground",
  children,
}: {
  id: string
  label: string
  required?: boolean
  icon: React.ElementType
  iconColor?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative group">
        <Icon className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${iconColor} transition-all duration-300 group-focus-within:scale-110`} />
        {children}
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
  iconColor = "text-foreground/70",
  bgClassName = "bg-background",
  rightAction,
}: {
  icon: React.ElementType
  label: string
  value: string
  iconColor?: string
  bgClassName?: string
  rightAction?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm border border-border/50 ${bgClassName}`}>
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
        <p className="truncate text-xs font-semibold text-foreground">{value}</p>
      </div>
      {rightAction && (
        <div className="shrink-0 flex items-center justify-center">
          {rightAction}
        </div>
      )}
    </div>
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
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-300 ease-out active:scale-[0.98] ${
        active ? "border-foreground bg-foreground/5 backdrop-blur-xl shadow-sm" : "border-border/50 bg-background/50 hover:border-foreground/30 hover:bg-background/80"
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
