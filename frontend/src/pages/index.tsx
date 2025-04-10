// src/pages/index.tsx
import Link from 'next/link';
import styles from '../styles/Landing.module.css'; // Bạn có thể tạo file CSS riêng cho trang chủ

const HomePage = () => {
  return (
    <main className={styles.main}> {/* Sử dụng class từ CSS Module */}
      <h1 className={styles.title}>
        Welcome to Meow-care
      </h1>

      <p className={styles.description}>
        Take care of yourself and your furry friend every day.
      </p>

      <div className={styles.buttonContainer}>
        <Link href="/login" passHref>
          <button className={styles.button}>Sign in</button>
        </Link>
        <Link href="/register" passHref>
          <button className={`${styles.button} ${styles.buttonSecondary}`}>Sign up</button>
        </Link>
      </div>
    </main>
  );
};

export default HomePage;