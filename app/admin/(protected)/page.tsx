import Link from "next/link"
import {
  Package,
  ShoppingCart,
  Settings,
  Home,
  PanelTop,
  FileText,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowRight,
  Wallet,
  Mail,
  MessageCircle,
  Users,
} from "lucide-react"
import { bdt } from "@/lib/products"
import { statusLabels, type OrderStatus } from "@/lib/order-types"
import { PageTitle } from "@/components/admin/ui"
import { getAllProducts } from "@/lib/products-db"
import { getAllOrders } from "@/lib/orders"
import { getAllContacts } from "@/lib/contacts"
import { getUnreadChatCount } from "@/lib/chat"
import { getCustomerCount } from "@/lib/customers"

export const dynamic = "force-dynamic"

type RecentOrder = {
  id: number
  customer_name: string
  total: number
  status: OrderStatus
  created_at: string
}

type LowStockProduct = { id: string; name: string; image: string }

async function getStats() {
  try {
    const allProducts = await getAllProducts()
    const allOrders = await getAllOrders()
    const allContacts = await getAllContacts()
    const chatUnread = await getUnreadChatCount()
    const customerCount = await getCustomerCount()

    const pendingOrders = allOrders.filter((o) => o.status === "pending")
    const totalRevenue = allOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0)

    const recent = allOrders.slice(0, 5).map((o) => ({
      id: o.id,
      customer_name: o.customer_name,
      total: o.total,
      status: o.status,
      created_at: o.created_at,
    }))

    const lowStock = allProducts
      .filter((p) => !p.inStock)
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        name: p.name,
        image: p.image,
      }))

    return {
      products: String(allProducts.length),
      orders: String(allOrders.length),
      pending: String(pendingOrders.length),
      revenue: totalRevenue,
      recent,
      lowStock,
      contacts: String(allContacts.length),
      chatUnread,
      customers: String(customerCount),
    }
  } catch (e) {
    console.error("[dashboard] getStats error, returning empty stats:", (e as Error).message)
    return { products: "0", orders: "0", pending: "0", revenue: 0, recent: [], lowStock: [], contacts: "0", chatUnread: 0, customers: "0" }
  }
}

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-700",
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

const shortcuts = [
  { href: "/admin/settings", label: "সাইট সেটিংস", desc: "ব্র্যান্ড, ফোন, ইমেইল, সোশ্যাল", icon: Settings },
  { href: "/admin/homepage", label: "হোমপেজ", desc: "হিরো, ব্যানার, রিভিউ", icon: Home },
  { href: "/admin/header", label: "হেডার ও ফুটার", desc: "মেনু ও লিংক", icon: PanelTop },
  { href: "/admin/products", label: "প্রোডাক্ট", desc: "অ্যাড, এডিট, ডিলিট", icon: Package },
  { href: "/admin/pages", label: "পেজ কনটেন্ট", desc: "FAQ, শিপিং, কন্টাক্ট", icon: FileText },
  { href: "/admin/orders", label: "অর্ডার", desc: "অর্ডার দেখুন", icon: ShoppingCart },
  { href: "/admin/payment", label: "পেমেন্ট সেটিংস", desc: "বিকাশ, নগদ, ব্যাংক", icon: Wallet },
  { href: "/admin/contacts", label: "যোগাযোগ বার্তা", desc: "কাস্টমারদের পাঠানো মেসেজ দেখুন", icon: Mail },
  { href: "/admin/messages", label: "লাইভ চ্যাট", desc: "ভিজিটরদের সাথে রিয়েলটাইম চ্যাট", icon: MessageCircle },
  { href: "/admin/customers", label: "কাস্টমার", desc: "রেজিস্টার্ড কাস্টমার ও এক্সেল ডাউনলোড", icon: Users },
]

export default async function AdminDashboard() {
  const c = await getStats()
  const stats = [
    { label: "মোট রেভিনিউ", value: bdt(c.revenue), icon: TrendingUp, href: "/admin/orders" },
    { label: "মোট অর্ডার", value: c.orders, icon: ShoppingCart, href: "/admin/orders" },
    { label: "পেন্ডিং অর্ডার", value: c.pending, icon: Clock, href: "/admin/orders" },
    { label: "মোট প্রোডাক্ট", value: c.products, icon: Package, href: "/admin/products" },
    { label: "মোট কাস্টমার", value: c.customers, icon: Users, href: "/admin/customers" },
  ]

  return (
    <div>
      <PageTitle title="ড্যাশবোর্ড" description="আপনার স্টোরের সবকিছু এখান থেকে নিয়ন্ত্রণ করুন।" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Link
              key={s.label}
              href={s.href}
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">{s.value}</p>
            </Link>
          )
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="text-sm font-semibold tracking-wide text-foreground">সাম্প্রতিক অর্ডার</h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              সব দেখুন <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {c.recent.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">এখনো কোনো অর্ডার আসেনি।</p>
          ) : (
            <ul className="divide-y divide-border">
              {c.recent.map((o) => (
                <li key={o.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      #{o.id} — {o.customer_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{bdt(o.total)}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[o.status] ?? statusStyles.pending}`}
                  >
                    {statusLabels[o.status] ?? o.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border p-5">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-semibold tracking-wide text-foreground">স্টক আউট প্রোডাক্ট</h2>
          </div>
          {c.lowStock.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">সব প্রোডাক্ট স্টকে আছে।</p>
          ) : (
            <ul className="divide-y divide-border">
              {c.lowStock.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 p-3 hover:bg-muted">
                    <div className="h-11 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image || "/placeholder.svg"} alt={p.name} className="h-full w-full object-cover object-top" />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">{p.name}</span>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">স্টক আউট</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold tracking-wide text-foreground">দ্রুত অ্যাক্সেস</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((s) => {
          const Icon = s.icon
          const desc = s.href === "/admin/contacts"
            ? `${s.desc} (মোট ${c.contacts} টি)`
            : s.href === "/admin/messages" && c.chatUnread > 0
              ? `${s.desc} (${c.chatUnread} টি অপঠিত)`
              : s.desc
          return (
            <Link
              key={s.href}
              href={s.href}
              className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground"
            >
              <Icon className="h-6 w-6 text-foreground" strokeWidth={1.5} />
              <p className="mt-3 font-medium text-foreground">{s.label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
