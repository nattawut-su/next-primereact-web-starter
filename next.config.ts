import type { NextConfig } from 'next';
const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',

  typedRoutes: true,
  experimental: {
    optimizePackageImports: ['date-fns', 'lodash-es'],
  },

  compiler: {
    removeConsole: isProd ? { exclude: ['error', 'warn'] } : false,
  },

  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
