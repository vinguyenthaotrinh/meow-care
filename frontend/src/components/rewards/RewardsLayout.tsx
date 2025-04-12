// src/components/rewards/RewardsLayout.tsx
import React, { useState, ReactNode } from 'react';
import RewardsSidebar, { RewardsTab } from './RewardsSidebar';
// *** Use REWARDS styles for the overall layout ***
import styles from '../../styles/Rewards.module.css';

interface RewardsLayoutProps {
  children: (activeTab: RewardsTab) => ReactNode;
}

const RewardsLayout: React.FC<RewardsLayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<RewardsTab>('quests');

  return (
    // *** Use REWARDS container class ***
    <div className={styles.rewardsContainer}>
      {/* Sidebar still uses Settings styles for its look */}
      <RewardsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      {/* *** Use REWARDS content class *** */}
      <main className={styles.rewardsContent}>
        {children(activeTab)}
      </main>
    </div>
  );
};

export default RewardsLayout;