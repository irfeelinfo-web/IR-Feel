/**
 * Renders a JSON-LD structured data <script> tag.
 * Safe for server components — output is a plain script element.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify is safe here; we control the shape of `data`.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
