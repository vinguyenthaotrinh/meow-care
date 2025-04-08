import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  async rewrites() {
    return [
      {
        source: '/home', // URL người dùng thấy và truy cập
        destination: '/dashboard', // File thực tế trong thư mục /pages mà Next.js sẽ render
      },
      {
         source: '/habits',
         destination: '/dashboard/habits', 
      },
      {
         source: '/focus',
         destination: '/dashboard/focus',
      },
      {
         source: '/profile',
         destination: '/dashboard/profile',
      },
      {
         source: '/settings',
         destination: '/dashboard/settings',
      },
    ];
  },
};

export default nextConfig;
