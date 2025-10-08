import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimized for Vercel deployment - static export disabled
  // output: 'export',
  // trailingSlash: true,
  images: {
    unoptimized: true
  },
  // basePath and assetPrefix removed for Vercel compatibility
  // basePath: process.env.NODE_ENV === 'production' ? '/Trinity-Chili' : '',
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/Trinity-Chili/' : '',
};

export default nextConfig;
