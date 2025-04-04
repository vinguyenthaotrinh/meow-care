// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export const useAuth = (redirectTo = '/login') => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = checking, false = not auth, true = auth
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsAuthenticated(false);
      router.push(redirectTo); // Chuyển hướng nếu không có token
    } else {
      // Optional: Thêm bước gọi API kiểm tra token có hợp lệ không ở đây
      // Ví dụ: fetchApi('/auth/verify-token', { isProtected: true }).then(...)
      // Nếu không cần verify, cứ coi như có token là đã đăng nhập
      setIsAuthenticated(true);
    }
  }, [router, redirectTo]);

  return { isAuthenticated };
};