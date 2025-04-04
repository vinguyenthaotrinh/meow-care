// src/pages/login.tsx
import { useState } from 'react';
import { useRouter } from 'next/router'; // Để điều hướng sau khi login thành công
import AuthForm from '../components/auth/AuthForm';
import { fetchApi } from '../lib/api'; // Import hàm gọi API

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (formData: any) => {
    setIsLoading(true);
    setError(null); // Reset lỗi trước khi gọi API

    const response = await fetchApi<{ token: string }>('/auth/login', {
      method: 'POST',
      body: formData,
    });

    setIsLoading(false);

    if (response.error) {
      setError(response.error); // Hiển thị lỗi từ API
    } else if (response.data?.token) {
      // Thành công!
      console.log('Login successful, token:', response.data.token);
      // --- Xử lý token ---
      // 1. Lưu token (ví dụ: vào localStorage)
      localStorage.setItem('authToken', response.data.token);

      // 2. Điều hướng người dùng đến trang chính hoặc dashboard
      // Thay '/dashboard' bằng trang bạn muốn người dùng đến sau khi đăng nhập
      router.push('/dashboard'); // Ví dụ: chuyển đến trang dashboard
      // Hoặc có thể là router.push('/'); nếu muốn về trang chủ
    } else {
      // Trường hợp không có lỗi nhưng cũng không có token (bất thường)
       // --- Thay đổi tiếng Việt sang tiếng Anh ---
       setError('Login failed: Unexpected response from server.');
       // -----------------------------------------
    }
  };

  return (
    <main> {/* Sử dụng thẻ main đã style trong globals.css */}
      <AuthForm
        formType="login"
        onSubmit={handleLogin}
        isLoading={isLoading}
        error={error}
      />
    </main>
  );
};

export default LoginPage;