// src/components/navigation/Navbar.tsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/Navbar.module.css';

const navItems = [
  { name: 'Home', path: '/dashboard' },
  { name: 'Habits', path: '/dashboard/habits' },
  { name: 'Focus', path: '/dashboard/focus' },
  { name: 'Profile', path: '/dashboard/profile' },
];

const Navbar = () => {
  const router = useRouter();

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {navItems.map((item) => {
          // Kiểm tra active dựa trên path bắt đầu bằng path của item
          // Ví dụ: /dashboard/habits cũng sẽ làm active item 'Habits'
          const isActive = router.pathname === item.path || (item.path !== '/dashboard' && router.pathname.startsWith(item.path));

          return (
            <Link key={item.name} href={item.path} passHref legacyBehavior>
              <a className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
                {item.name}
              </a>
            </Link>
          );
        })}
      </div>
       {/* Có thể thêm phần User Avatar/Logout ở đây */}
       <div className={styles.userActions}>
           {/* <button onClick={handleLogout}>Logout</button> */}
       </div>
    </nav>
  );
};

export default Navbar;