// src/pages/register.tsx
import { useState } from 'react';
import { useRouter } from 'next/router'; // Để điều hướng sau khi đăng ký
import AuthForm from '../components/auth/AuthForm';
import { fetchApi } from '../lib/api';

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Thêm state cho thông báo thành công
  const router = useRouter();

  const handleRegister = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null); // Reset thông báo

    // Lưu ý quan trọng: Đảm bảo formData chứa đủ các trường mà
    // model `UserCreate` trong backend Flask của bạn yêu cầu.
    // Hiện tại code AuthForm chỉ gửi { email, password }.
    // Nếu backend cần thêm 'name', 'confirmPassword', v.v.
    // bạn cần cập nhật state và JSX trong AuthForm.tsx
    console.log('Registering with data:', formData); // Check data gửi đi

    const response = await fetchApi('/auth/register', {
      method: 'POST',
      body: formData,
    });

    setIsLoading(false);

    if (response.error) {
      setError(response.error);
    } else if (response.status === 201) { // Kiểm tra status code 201 Created
      // Đăng ký thành công!
      // --- Thay đổi tiếng Việt sang tiếng Anh ---
      setSuccessMessage('Registration successful! Redirecting to login...');
      // -----------------------------------------
      // Chờ vài giây rồi chuyển hướng
      setTimeout(() => {
        router.push('/login'); // Chuyển hướng đến trang đăng nhập
      }, 2000); // Chờ 2 giây
    } else {
       // --- Thay đổi tiếng Việt sang tiếng Anh ---
       setError('Registration failed: Unexpected response from server.');
       // -----------------------------------------
    }
  };

  return (
    <main>
      {/* Đoạn này hiển thị thông báo thành công, đã đổi sang tiếng Anh */}
      {successMessage && <p style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{successMessage}</p>}
      <AuthForm
        formType="register"
        onSubmit={handleRegister}
        isLoading={isLoading}
        error={error}
      />
    </main>
  );
};

export default RegisterPage;