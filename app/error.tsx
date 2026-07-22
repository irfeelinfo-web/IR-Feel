"use client" // Error boundaries must be Client Components

import { useEffect } from "react"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-500" />
      </div>
      <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
        দুঃখিত, একটি সমস্যা হয়েছে!
      </h2>
      <p className="mb-8 max-w-md text-sm text-muted-foreground">
        অনাকাঙ্ক্ষিত সমস্যার জন্য আমরা আন্তরিকভাবে দুঃখিত। আপনি পেজটি রিলোড করতে পারেন অথবা হোমপেজে ফিরে যেতে পারেন।
        {process.env.NODE_ENV !== 'production' && (
          <>
            <br/><br/>
            <strong className="text-red-500 font-mono text-xs text-left block p-2 bg-red-500/10 rounded overflow-x-auto">
              DEBUG: {error?.message || "Unknown error"}
              <br/>
              DIGEST: {error?.digest || "none"}
            </strong>
          </>
        )}
      </p>
      
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => reset()}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-sm font-bold text-background transition-all hover:bg-foreground/90 active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          আবার চেষ্টা করুন
        </button>
        <Link
          href="/"
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border/50 bg-background/50 px-6 text-sm font-bold text-foreground transition-all hover:bg-muted active:scale-95"
        >
          <Home className="h-4 w-4" />
          হোমপেজে ফিরে যান
        </Link>
      </div>
    </div>
  )
}
