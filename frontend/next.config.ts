import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  eslint: {
    // Tắt ESLint trong quá trình build
    ignoreDuringBuilds: true,
  },

  async rewrites() {
    return [
      {
        source: '/home', // URL người dùng thấy và truy cập
        destination: '/dashboard', // File thực tế trong thư mục /pages mà Next.js sẽ render
      },
      {
         source: '/rewards',
         destination: '/dashboard/rewards', 
      },
      {
         source: '/focus',
         destination: '/dashboard/focus',
      },
      {
         source: '/settings',
         destination: '/dashboard/settings',
      },
    ];
  },
};

export default nextConfig;
