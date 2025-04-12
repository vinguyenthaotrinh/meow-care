// src/components/rewards/RewardsSidebar.tsx
import React from 'react';
import styles from '../../styles/Rewards.module.css'; // Use new CSS module

// Define the possible tabs for the Rewards page
export type RewardsTab = 'quests' | 'store';

interface RewardsSidebarProps {
  activeTab: RewardsTab;
  setActiveTab: (tab: RewardsTab) => void;
}

const RewardsSidebar: React.FC<RewardsSidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    // Use a different class name to avoid conflicts with settings sidebar if needed
    <nav className={`${styles.rewardsSidebar} ${styles.settingsSidebar}`}> {/* Reuse some settings styles */}
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
        {/* Add other sections later if needed */}
      </ul>
    </nav>
  );
};

export default RewardsSidebar;