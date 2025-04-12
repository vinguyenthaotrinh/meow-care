// src/components/rewards/MonthlyReward.tsx
import React from 'react';
import styles from '../../styles/Rewards.module.css';
import { FaGem } from 'react-icons/fa'; // Assuming diamond reward

interface MonthlyRewardProps {
    currentProgress: number;
    targetProgress: number;
    rewardAmount: number;
}

const MonthlyReward: React.FC<MonthlyRewardProps> = ({
    currentProgress,
    targetProgress,
    rewardAmount
}) => {
    const percentage = targetProgress > 0
        ? Math.min(100, (currentProgress / targetProgress) * 100)
        : 0;

    return (
         // Changed section to div for grid layout flexibility
        <div className={styles.monthlyRewardSection}>
            <h3 className={styles.monthlyRewardTitle}>Monthly Reward</h3>
            <div className={styles.monthlyRewardProgressBarContainer}>
                <div
                    className={styles.monthlyRewardProgressBarFill}
                    style={{ width: `${percentage}%` }}
                ></div>
                 <span className={styles.monthlyRewardProgressText}>
                    {currentProgress} / {targetProgress} Daily Quests
                 </span>
            </div>
            <div className={styles.monthlyRewardInfo}>
                Reward:
                <FaGem className={`${styles.currencyIcon} ${styles.diamondIcon}`} />
                {rewardAmount}
            </div>
        </div>
    );
};

export default MonthlyReward;