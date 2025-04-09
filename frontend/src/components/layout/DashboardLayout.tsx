// src/components/layout/DashboardLayout.tsx
import React, { ReactNode } from 'react';
import Navbar from '../navigation/Navbar';
import { useAuth } from '../../hooks/useAuth'; // Import hook kiểm tra auth
import LoadingSpinner from '../common/LoadingSpinner'; // Import component loading (tạo ở bước sau)
import styles from '../../styles/Dashboard.module.css'; // CSS cho layout dashboard

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Kiểm tra trạng thái đăng nhập

  // Nếu đang kiểm tra hoặc chưa xác thực, hiển thị loading hoặc null
  if (isAuthenticated === null) {
    return <div className={styles.centered}><LoadingSpinner /></div>; // Hoặc return null;
  }

  // Nếu không được xác thực (đã bị chuyển hướng bởi hook, nhưng để chắc chắn)
  if (!isAuthenticated) {
    // Hook useAuth đã xử lý chuyển hướng, nên thực tế ít khi rơi vào đây
    // Có thể return một thông báo hoặc null
    return <div className={styles.centered}>Login required to access this page.</div>;
  }

  // Nếu đã xác thực, hiển thị layout dashboard
  return (
    <div className={styles.dashboardContainer}>
      <Navbar />
      <main className={styles.mainContent}>
        {children} {/* Đây là nơi nội dung của từng trang (Home, Habits,...) sẽ được render */}
      </main>
       {/* Có thể thêm Footer ở đây nếu cần */}
    </div>
  );
};

export default DashboardLayout;