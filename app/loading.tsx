import { Loader2 } from "lucide-react"

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-foreground/50" />
      <p className="text-sm font-medium tracking-wide text-muted-foreground animate-pulse">
        অপেক্ষা করুন...
      </p>
    </div>
  )
}
