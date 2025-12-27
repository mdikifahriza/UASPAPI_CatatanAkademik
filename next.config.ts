import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  poweredByHeader: false,
  compress: true,
}

export default nextConfig