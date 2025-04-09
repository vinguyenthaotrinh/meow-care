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

  const handleLogout = () => {
    // Xóa token khỏi localStorage
    if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
    }
    // Điều hướng về trang login
    router.push('/login');
    // Có thể hiển thị thông báo logout thành công nếu muốn
    console.log("User logged out");
  };


  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {navItems.map((item) => {
          const isActive = router.pathname === item.path || (item.path !== '' && router.pathname.startsWith(item.path));

          return (
            <Link key={item.name} href={item.path} passHref legacyBehavior>
              <a className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
                {item.name}
              </a>
            </Link>
          );
        })}
      </div>
       {/* --- User Actions (Add Logout Button) --- */}
       <div className={styles.userActions}>
           {/* Bạn có thể đặt nút Logout ở đây hoặc trong SettingsSidebar */}
           <button onClick={handleLogout} className={styles.logoutButton}>Log Out</button>
       </div>
    </nav>
  );
};

export default Navbar;