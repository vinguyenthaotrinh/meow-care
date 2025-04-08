// src/components/settings/SettingsSidebar.tsx
import React from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/Settings.module.css';

interface SettingsSidebarProps {
  activeSection: 'personal' | 'habits'; // Chỉ có 2 section chính cần chuyển đổi view
  setActiveSection: (section: 'personal' | 'habits') => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeSection, setActiveSection }) => {
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    router.push('/login');
    console.log("User logged out from settings");
  };

  return (
    <nav className={styles.settingsSidebar}>
      <ul>
        <li
          className={activeSection === 'personal' ? styles.active : ''}
          onClick={() => setActiveSection('personal')}
        >
          Personal Information
        </li>
        <li
          className={activeSection === 'habits' ? styles.active : ''}
          onClick={() => setActiveSection('habits')}
        >
          Habit Settings
        </li>
        <li onClick={handleLogout}> {/* Nút Logout riêng */}
          Log Out
        </li>
      </ul>
    </nav>
  );
};

export default SettingsSidebar;