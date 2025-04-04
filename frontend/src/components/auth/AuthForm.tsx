// src/components/auth/AuthForm.tsx
import React, { useState, FormEvent } from 'react';
import styles from '../../styles/Auth.module.css'; // Import CSS Module
import Link from 'next/link'; // Dùng để tạo link chuyển trang

interface AuthFormProps {
  formType: 'login' | 'register';
  onSubmit: (formData: any) => Promise<void>; // Hàm xử lý khi submit form
  isLoading: boolean; // Trạng thái đang loading
  error: string | null; // Thông báo lỗi từ API
}

const AuthForm: React.FC<AuthFormProps> = ({ formType, onSubmit, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Có thể thêm state cho các trường khác nếu cần cho register (ví dụ: name, confirmPassword)
  // const [name, setName] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Ngăn trình duyệt submit mặc định
    // Tạo object dữ liệu dựa trên formType
    // Lưu ý: Backend register của bạn hiện chỉ cần email/password theo code Flask bạn cung cấp
    // Nếu UserCreate cần nhiều hơn, hãy thêm các trường đó vào đây
    const formData = { email, password };
    await onSubmit(formData);
  };

  const isLogin = formType === 'login';
  // --- Thay đổi tiếng Việt sang tiếng Anh ---
  const pageTitle = isLogin ? 'Login' : 'Register';
  const submitButtonText = isLogin ? 'Login' : 'Create Account';
  const switchLinkHref = isLogin ? '/register' : '/login';
  const switchLinkText = isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login';
  // -----------------------------------------

  return (
    <div className={styles.authContainer}>
      <h1 className={styles.title}>{pageTitle}</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Thêm input 'name' nếu form là register và backend cần */}
        {/* {!isLogin && (
          <div className={styles.inputGroup}>
            // --- Thay đổi tiếng Việt sang tiếng Anh ---
            <label htmlFor="name" className={styles.label}>Name</label>
            // -----------------------------------------
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={styles.input}
              disabled={isLoading}
            />
          </div>
        )} */}

        <div className={styles.inputGroup}>
          {/* --- Thay đổi tiếng Việt sang tiếng Anh --- */}
          <label htmlFor="email" className={styles.label}>Email</label>
          {/* ----------------------------------------- */}
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
            disabled={isLoading}
            placeholder="you@example.com" // Placeholder giữ nguyên hoặc đổi nếu cần
          />
        </div>

        <div className={styles.inputGroup}>
          {/* --- Thay đổi tiếng Việt sang tiếng Anh --- */}
          <label htmlFor="password" className={styles.label}>Password</label>
          {/* ----------------------------------------- */}
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6} // Thêm validation cơ bản nếu muốn
            className={styles.input}
            disabled={isLoading}
            placeholder="••••••••" // Placeholder giữ nguyên
          />
        </div>

         {/* Thêm input 'confirmPassword' nếu form là register và backend cần */}

        {error && <p className={styles.errorMessage}>{error}</p>}

        <button type="submit" disabled={isLoading} className={styles.submitButton}>
          {/* --- Thay đổi tiếng Việt sang tiếng Anh --- */}
          {isLoading ? 'Processing...' : submitButtonText}
          {/* ----------------------------------------- */}
        </button>
      </form>

      <div className={styles.switchLink}>
        <Link href={switchLinkHref}>
          {switchLinkText}
        </Link>
      </div>
    </div>
  );
};

export default AuthForm;