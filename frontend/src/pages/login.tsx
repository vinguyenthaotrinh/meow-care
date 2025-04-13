// src/pages/login.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Để điều hướng sau khi login thành công
import AuthForm from '../components/auth/AuthForm';
import { fetchApi } from '../lib/api'; // Import hàm gọi API
import styles from '../styles/Auth.module.css';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingToken, setIsCheckingToken] = useState(true); // State để kiểm tra token
  const router = useRouter();

  // Kiểm tra token khi trang login được load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/home');
    } else {
      setIsCheckingToken(false); // Xong kiểm tra token, có thể hiển thị form login
    }
  }, [router]);

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
      // 1. Lưu token (ví dụ: vào localStorage)
      localStorage.setItem('authToken', response.data.token);

      // 2. Điều hướng người dùng đến trang chính hoặc /home
      router.push('/home');
      // Hoặc có thể là router.push('/'); nếu muốn về trang chủ
    } else {
      // Trường hợp không có lỗi nhưng cũng không có token (bất thường)
       setError('Login failed: Unexpected response from server.');
    }
  };

  if (isCheckingToken) {
    return (
      <div></div> // có thể thay bằng một spinner hoặc loading animation ở đây
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <AuthForm
        formType="login"
        onSubmit={handleLogin}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default LoginPage;