// src/components/rewards/RewardsLayout.tsx
import React, { useState, ReactNode } from 'react';
import RewardsSidebar, { RewardsTab } from './RewardsSidebar';
import styles from '../../styles/Rewards.module.css'; // Use new CSS module

interface RewardsLayoutProps {
  children: (activeTab: RewardsTab) => ReactNode; // Function as child
}

const RewardsLayout: React.FC<RewardsLayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<RewardsTab>('quests'); // Default to 'quests'

  return (
    // Use a different class name to avoid conflicts with settings layout
    <div className={`${styles.rewardsContainer} ${styles.settingsContainer}`}> {/* Reuse some settings styles */}
      <RewardsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className={`${styles.rewardsContent} ${styles.settingsContent}`}> {/* Reuse some settings styles */}
        {children(activeTab)} {/* Render content based on active tab */}
      </main>
    </div>
  );
};

export default RewardsLayout;