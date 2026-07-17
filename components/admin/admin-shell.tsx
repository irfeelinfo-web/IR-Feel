"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ToastProvider } from "@/components/admin/toast-context"
import {
  LayoutDashboard,
  Settings,
  PanelTop,
  PanelBottom,
  Home,
  Package,
  FileText,
  ShoppingCart,
  Wallet,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Mail,
  MessageCircle,
  Users,
  ShieldAlert,
} from "lucide-react"
import { logoutAction } from "@/app/admin/actions"

type NavItem = {
  href: string
  label: string
  icon: React.ElementType
}

type NavGroup = {
  groupLabel: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    groupLabel: "ওভারভিউ",
    items: [
      { href: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
    ],
  },
  {
    groupLabel: "স্টোর",
    items: [
      { href: "/admin/products", label: "প্রোডাক্ট", icon: Package },
      { href: "/admin/orders", label: "অর্ডার", icon: ShoppingCart },
      { href: "/admin/customers", label: "কাস্টমার", icon: Users },
      { href: "/admin/change-requests", label: "পরিবর্তন রিকোয়েস্ট", icon: ShieldAlert },
    ],
  },
  {
    groupLabel: "সেটিংস",
    items: [
      { href: "/admin/settings", label: "সাইট সেটিংস", icon: Settings },
      { href: "/admin/payment", label: "পেমেন্ট ও ডেলিভারি", icon: Wallet },
      { href: "/admin/header", label: "হেডার", icon: PanelTop },
      { href: "/admin/footer", label: "ফুটার", icon: PanelBottom },
    ],
  },
  {
    groupLabel: "কনটেন্ট",
    items: [
      { href: "/admin/homepage", label: "হোমপেজ", icon: Home },
      { href: "/admin/pages", label: "পেজ কনটেন্ট", icon: FileText },
    ],
  },
  {
    groupLabel: "যোগাযোগ",
    items: [
      { href: "/admin/contacts", label: "বার্তা", icon: Mail },
      { href: "/admin/messages", label: "লাইভ চ্যাট", icon: MessageCircle },
    ],
  },
]

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)

  return (
    <ToastProvider>
    <div className="flex min-h-screen bg-muted">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-card transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
            Admin<span className="text-gold">.</span>
          </span>
          <button
            className="lg:hidden"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Grouped Nav */}
        <nav className="flex flex-col gap-0.5 overflow-y-auto p-3 pb-4">
          {navGroups.map((group) => (
            <div key={group.groupLabel} className="mb-1">
              {/* Group label */}
              <p className="mb-1 mt-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 first:mt-1">
                {group.groupLabel}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto border-t border-border p-3">
          <Link
            href="/"
            target="_blank"
            className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            সাইট দেখুন
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              লগআউট
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-border bg-card px-4 lg:hidden">
          <button aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-display text-lg font-extrabold text-foreground">
            Admin<span className="text-gold">.</span>
          </span>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
    </ToastProvider>
  )
}
