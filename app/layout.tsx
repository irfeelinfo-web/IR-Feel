import type { Metadata, Viewport } from 'next'
import { Inter, Archivo, Anek_Bangla } from 'next/font/google'
import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'
import { CustomerProvider } from '@/lib/customer-context'
import { CartDrawer } from '@/components/cart-drawer'
import { ChatWidget } from '@/components/chat-widget'
import { JsonLd } from '@/components/json-ld'
import { getSettings } from '@/lib/content'
import { getLoggedInCustomer } from '@/lib/customer-auth'
import { buildMetadata, SITE_URL, absoluteUrl, BRAND_EMAIL } from '@/lib/seo'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const anekBangla = Anek_Bangla({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind',
  display: 'swap',
})

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const base = await buildMetadata({
    title: settings.metaTitle || `${settings.brandName} — Premium Fashion & Streetwear`,
    description: settings.metaDescription,
    path: '/',
  })
  return {
    ...base,
    title: {
      default: settings.metaTitle || `${settings.brandName} — Premium Fashion & Streetwear`,
      template: `%s | ${settings.brandName}`,
    },

    icons: {
      icon: settings.faviconImage
        ? [{ url: `/api/favicon?url=${encodeURIComponent(settings.faviconImage)}` }]
        : [
            { url: '/icon.svg', type: 'image/svg+xml' },
            { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' },
          ],
      apple: settings.faviconImage
        ? [{ url: `/api/favicon?url=${encodeURIComponent(settings.faviconImage)}` }]
        : [{ url: '/apple-icon.png' }],
    },
    manifest: '/manifest.webmanifest',
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111111' },
  ],
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSettings()
  const brand = settings.brandName || 'IR Feel'
  const socials = Object.values(settings.socials || {}).filter(
    (u) => typeof u === 'string' && u && u !== '#',
  )

  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: brand,
    url: SITE_URL,
    email: settings.email || BRAND_EMAIL,
    logo: absoluteUrl('/icon-light-32x32.png'),
    description: settings.metaDescription,
    ...(socials.length ? { sameAs: socials } : {}),
    contactPoint: {
      '@type': 'ContactPoint',
      email: settings.email || BRAND_EMAIL,
      contactType: 'customer service',
      areaServed: 'BD',
      availableLanguage: ['en', 'bn'],
    },
  }

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: brand,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: ['en', 'bn'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const customer = await getLoggedInCustomer()

  return (
    <html
      lang="bn"
      className={`${inter.variable} ${archivo.variable} ${anekBangla.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <JsonLd data={[organizationLd, websiteLd]} />
        <CustomerProvider initial={customer}>
          <WishlistProvider>
            <CartProvider>
              {children}
              <CartDrawer />
              <ChatWidget />
            </CartProvider>
          </WishlistProvider>
        </CustomerProvider>
      </body>
    </html>
  )
}