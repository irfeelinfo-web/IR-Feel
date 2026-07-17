export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center select-none">
      <div className="rounded-full px-8 py-2.5 bg-white/45 dark:bg-black/30 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
        <h2 className="font-display text-lg sm:text-xl font-bold tracking-widest text-foreground uppercase">{children}</h2>
      </div>
      <span className="mt-3 h-0.5 w-10 bg-gold" />
    </div>
  )
}
