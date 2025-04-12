// src/components/rewards/RewardsSidebar.tsx
import React from 'react';
// *** Use Settings styles directly for visual consistency OF THE SIDEBAR ITSELF ***
import styles from '../../styles/Settings.module.css'; // Use Settings CSS

export type RewardsTab = 'quests' | 'store';

interface RewardsSidebarProps {
  activeTab: RewardsTab;
  setActiveTab: (tab: RewardsTab) => void;
}

const RewardsSidebar: React.FC<RewardsSidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    // Use the exact same class name as Settings Sidebar
    <nav className={styles.settingsSidebar}>
      <ul>
        <li
          className={activeTab === 'quests' ? styles.active : ''}
          onClick={() => setActiveTab('quests')}
        >
          Quests
        </li>
        <li
          className={activeTab === 'store' ? styles.active : ''}
          onClick={() => setActiveTab('store')}
        >
          Store
        </li>
      </ul>
    </nav>
  );
};

export default RewardsSidebar;