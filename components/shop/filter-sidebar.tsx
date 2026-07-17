"use client"

import { shopCategories, shopColors, shopSizes, type ShopCategory } from "@/lib/products"

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border pb-6">
      <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-foreground">
        {title}
      </h3>
      {children}
    </div>
  )
}

export type ShopFilters = {
  categories: ShopCategory[]
  colors: string[]
  sizes: string[]
  maxPrice: number
}

export function FilterSidebar({
  filters,
  onChange,
  onReset,
  priceCeiling,
  hideCategory = false,
}: {
  filters: ShopFilters
  onChange: (next: ShopFilters) => void
  onReset: () => void
  priceCeiling: number
  hideCategory?: boolean
}) {
  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
  }

  return (
    <aside className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">Filters</h2>
        <button
          onClick={onReset}
          className="text-xs font-medium tracking-wide text-muted-foreground transition-colors hover:text-gold"
        >
          Clear All
        </button>
      </div>

      {!hideCategory && (
        <FilterGroup title="Category">
          <ul className="flex flex-col gap-3">
            {shopCategories.map((cat) => (
              <li key={cat}>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(cat)}
                    onChange={() => onChange({ ...filters, categories: toggle(filters.categories, cat) })}
                    className="h-4 w-4 accent-foreground"
                  />
                  {cat}
                </label>
              </li>
            ))}
          </ul>
        </FilterGroup>
      )}

      <FilterGroup title="Price">
        <input
          type="range"
          min={0}
          max={priceCeiling}
          step={50}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-foreground"
          aria-label="Maximum price"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>৳ 0</span>
          <span className="font-semibold text-foreground">Up to ৳ {filters.maxPrice.toLocaleString("en-US")}</span>
        </div>
      </FilterGroup>

      <FilterGroup title="Color">
        <div className="flex flex-wrap gap-3">
          {shopColors.map((color) => {
            const active = filters.colors.includes(color.name)
            return (
              <button
                key={color.name}
                onClick={() => onChange({ ...filters, colors: toggle(filters.colors, color.name) })}
                aria-label={color.name}
                aria-pressed={active}
                className={`h-8 w-8 rounded-full border-2 transition-all ${
                  active ? "border-foreground ring-2 ring-foreground ring-offset-2" : "border-border"
                }`}
                style={{ backgroundColor: color.value }}
              />
            )
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {shopSizes.map((size) => {
            const active = filters.sizes.includes(size)
            return (
              <button
                key={size}
                onClick={() => onChange({ ...filters, sizes: toggle(filters.sizes, size) })}
                className={`flex h-10 w-10 items-center justify-center border text-xs font-semibold transition-colors ${
                  active
                    ? "border-foreground bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:border-foreground"
                }`}
              >
                {size}
              </button>
            )
          })}
        </div>
      </FilterGroup>
    </aside>
  )
}
