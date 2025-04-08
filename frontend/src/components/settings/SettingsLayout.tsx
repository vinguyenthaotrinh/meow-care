// src/components/settings/SettingsLayout.tsx
import React, { useState, ReactNode } from 'react';
import SettingsSidebar from './SettingsSidebar';
import styles from '../../styles/Settings.module.css';

interface SettingsLayoutProps {
  children: (activeSection: 'personal' | 'habits') => ReactNode; // Function as child để truyền activeSection
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<'personal' | 'habits'>('personal'); // Mặc định là personal

  return (
    <div className={styles.settingsContainer}>
      <SettingsSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className={styles.settingsContent}>
        {children(activeSection)} {/* Render nội dung dựa trên section đang active */}
      </main>
    </div>
  );
};

export default SettingsLayout;