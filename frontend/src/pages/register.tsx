// src/pages/register.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Để điều hướng sau khi đăng ký
import AuthForm from '../components/auth/AuthForm';
import { fetchApi } from '../lib/api';
import styles from '../styles/Auth.module.css';

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCheckingToken, setIsCheckingToken] = useState(true); // Kiểm tra token
  const router = useRouter();

  // Kiểm tra token khi trang đăng ký được load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Nếu có token, điều hướng người dùng tới trang dashboard
      router.push('/home');
    } else {
      setIsCheckingToken(false); // Kiểm tra xong, hiển thị form đăng ký
    }
  }, [router]);

  const handleRegister = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null); // Reset thông báo

    const response = await fetchApi('/auth/register', {
      method: 'POST',
      body: formData,
    });

    setIsLoading(false);

    if (response.error) {
      setError(response.error);
    } else if (response.status === 201) { // Kiểm tra status code 201 Created
      setSuccessMessage('Registration successful! Redirecting to login...');
      // Chờ vài giây rồi chuyển hướng
      setTimeout(() => {
        router.push('/login'); // Chuyển hướng đến trang đăng nhập
      }, 2000); // Chờ 2 giây
    } else {
      setError('Registration failed: Unexpected response from server.');
    }
  };

  if (isCheckingToken) {
    return (
      <div></div> // Thay bằng spinner nếu muốn
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {successMessage && <p style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{successMessage}</p>}
      <AuthForm
        formType="register"
        onSubmit={handleRegister}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default RegisterPage;
