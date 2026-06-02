/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  webpack(config) {
    // Suppress webpack PackFileCacheStrategy big-string serialization warnings
    // caused by large page components (clients/[id]/page.tsx ~1600 lines).
    // Long-term fix: code-split that file (CLAUDE.md improvement #2).
    config.infrastructureLogging = {
      ...config.infrastructureLogging,
      level: 'error',
    }
    return config
  },
}

export default nextConfig
