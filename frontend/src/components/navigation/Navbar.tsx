// src/components/navigation/Navbar.tsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/Navbar.module.css';

const navItems = [
  { name: 'Home', path: '/home' },
  { name: 'Rewards', path: '/rewards' }, // Sẽ làm sau
  { name: 'Focus', path: '/focus' },   // Sẽ làm sau
  { name: 'Profile', path: '/profile' }, // Có thể gộp vào Settings hoặc để riêng
  { name: 'Settings', path: '/settings' }, // <-- Thêm mới
];

const Navbar = () => {
  const router = useRouter();

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {navItems.map((item) => {
          // --- CẬP NHẬT LOGIC isActive ---
          // So sánh chính xác đường dẫn hiện tại với đường dẫn của item
          const isActive = router.pathname === item.path;

          return (
            <Link key={item.name} href={item.path} passHref legacyBehavior>
              {/* Áp dụng class 'active' nếu isActive là true */}
              <a className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
                {item.name}
              </a>
            </Link>
          );
        })}
      </div>
       {/* --- User Actions (Optional Logout Button) --- */}
       {/* Bạn có thể bỏ comment phần này nếu muốn nút logout ở góc */}
       {/* <div className={styles.userActions}>
           <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
       </div> */}
    </nav>
  );
};

export default Navbar;