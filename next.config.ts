import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ✅ Image optimization
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'karyastudio-assets-2026.oss-ap-southeast-1.aliyuncs.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;