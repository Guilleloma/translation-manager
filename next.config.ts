import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@chakra-ui/react'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
