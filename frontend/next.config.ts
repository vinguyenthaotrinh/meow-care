import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Thêm phần này vào
  async rewrites() {
    return [
      {
        source: '/home', // URL người dùng thấy và truy cập
        destination: '/dashboard', // File thực tế trong thư mục /pages mà Next.js sẽ render
      },
      // Thêm các rewrite khác nếu cần, ví dụ cho /habits
      {
         source: '/habits',
         destination: '/dashboard/habits', // Giả sử file của bạn là pages/dashboard/habits.tsx
      },
      // ... Thêm các rewrite cho /focus, /profile, /settings nếu bạn cũng muốn đổi URL của chúng
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
