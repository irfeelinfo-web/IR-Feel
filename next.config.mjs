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
    // If you want to test on mobile, add your local IP here (e.g. '192.168.0.x')
    allowedDevOrigins: ['localhost'],
  }),
  serverExternalPackages: ['better-sqlite3'],
}

export default nextConfig

