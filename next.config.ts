import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ✅ Untuk API Routes (seperti /api/upload-to-oss)
  api: {
    bodyParser: {
      sizeLimit: '10mb', // ✅ Ini yang berlaku untuk API Routes!
    },
  },
  
  // ✅ Untuk Server Actions (fungsi dengan 'use server')
  serverActions: {
    bodySizeLimit: '10mb',
  },
  
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