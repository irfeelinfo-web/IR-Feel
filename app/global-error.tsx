"use client"

import { Anek_Bangla, Archivo, Inter } from "next/font/google"
import { AlertCircle, RefreshCw } from "lucide-react"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const anekBangla = Anek_Bangla({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-bengali", display: "swap" })
const archivo = Archivo({ subsets: ["latin"], weight: ["500", "600", "700", "800", "900"], variable: "--font-archivo", display: "swap" })

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="bn" className={`${inter.variable} ${anekBangla.variable} ${archivo.variable}`}>
      <body className="antialiased min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-500" />
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground font-display">
            গুরুতর সমস্যা হয়েছে!
          </h1>
          <p className="mb-8 max-w-md text-sm text-muted-foreground">
            অ্যাপ্লিকেশনের রুট লেভেলে একটি সমস্যা দেখা দিয়েছে। অনুগ্রহ করে পেজটি রিলোড করুন।
          </p>
          
          <button
            onClick={() => reset()}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-8 text-sm font-bold text-background transition-all hover:bg-foreground/90 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            রিলোড করুন
          </button>
        </div>
      </body>
    </html>
  )
}
