import { NextRequest } from 'next/server'

/** Only allow favicon proxying from trusted image hosts */
const ALLOWED_HOSTS = new Set([
  'www.irfeel.info',
  'irfeel.info',
  'i.imgur.com',
  'lh3.googleusercontent.com',
])

function isAllowedUrl(raw: string): boolean {
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:') return false
    // Check exact host or *.fbcdn.net pattern
    if (ALLOWED_HOSTS.has(url.hostname)) return true
    if (url.hostname.endsWith('.fbcdn.net')) return true
    if (url.hostname.endsWith('.googleusercontent.com')) return true
    return false
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return new Response('Not found', { status: 404 })
  }

  // Fix #3: SSRF protection — only allow trusted domains
  if (!isAllowedUrl(imageUrl)) {
    return new Response('Forbidden: URL not in allowlist', { status: 403 })
  }

  try {
    const res = await fetch(imageUrl)
    if (!res.ok) {
      return new Response('Failed to fetch image', { status: res.status })
    }
    
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const contentType = res.headers.get('content-type') || 'image/jpeg'

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs>
    <clipPath id="circleView">
      <circle cx="32" cy="32" r="32" />
    </clipPath>
  </defs>
  <image width="64" height="64" href="data:${contentType};base64,${base64}" clip-path="url(#circleView)" preserveAspectRatio="xMidYMid slice" />
</svg>
    `

    return new Response(svg.trim(), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
      },
    })
  } catch (err) {
    console.error('Favicon SVG generation error:', err)
    return new Response('Internal Server Error', { status: 500 })
  }
}
