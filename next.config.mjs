/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.irfeel.info',
      },
      {
        protocol: 'https',
        hostname: 'irfeel.info',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
    ],
  },
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: ['localhost'],
  }),
  // Prevent Turbopack/Webpack from bundling native Node.js packages
  serverExternalPackages: [
    "@libsql/client",
    "@libsql/client/web",
    "@libsql/client/node",
    "better-sqlite3",
    "libsql",
  ],
}

export default nextConfig
