import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export for Vercel deployment
  // output: 'export',
  // trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Remove basePath for Vercel deployment
  // basePath: process.env.NODE_ENV === 'production' ? '/Trinity-Chili' : '',
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/Trinity-Chili/' : '',
};

export default nextConfig;
