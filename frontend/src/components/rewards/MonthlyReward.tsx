// src/components/rewards/MonthlyReward.tsx
import React from 'react';
import styles from '../../styles/Rewards.module.css';
import { FaGem, FaCoins } from 'react-icons/fa'; // Import FaCoins if needed

interface MonthlyRewardProps {
    currentProgress: number;
    targetProgress: number;
    rewardAmount: number;
    rewardType?: 'coins' | 'diamonds'; // Make reward type explicit
}

const MonthlyReward: React.FC<MonthlyRewardProps> = ({
    currentProgress,
    targetProgress,
    rewardAmount,
    rewardType = 'diamonds' // Default to diamonds if not specified
}) => {
    const percentage = targetProgress > 0
        ? Math.min(100, (currentProgress / targetProgress) * 100)
        : 0;

    const isCompleted = currentProgress >= targetProgress;

    const rewardIcon = rewardType === 'diamonds'
        ? <FaGem className={`${styles.currencyIcon} ${styles.diamondIcon}`} />
        : <FaCoins className={`${styles.currencyIcon} ${styles.coinIcon}`} />;

    return (
         // Remove section wrapper, handled by grid layout now
         // Use a fragment or simple div if no extra styling needed for the whole block
        <>
             {/* Title outside the box */}
             <h3 className={styles.monthlyRewardOuterTitle}>Monthly Reward</h3>
             {/* The yellow box */}
            <div className={styles.monthlyRewardBox}>
                {/* Progress Bar */}
                <div className={styles.monthlyRewardProgressBarContainer}>
                    <div
                        className={styles.monthlyRewardProgressBarFill}
                        style={{ width: `${percentage}%` }}
                    ></div>
                     <span className={styles.monthlyRewardProgressText}>
                        {currentProgress} / {targetProgress} Daily Quests
                     </span>
                </div>
                {/* Reward Info and Disabled Button */}
                <div className={styles.monthlyRewardInfoArea}>
                    <span className={styles.monthlyRewardInfoText}>
                        Reward: {rewardIcon} {rewardAmount}
                    </span>
                     {/* Always disabled for Monthly Reward display, but styled like claimed */}
                     <button disabled className={`${styles.questClaimButton} ${styles.questClaimedButtonVisual}`}>
                         {isCompleted ? 'Claimed' : 'Claim'} {/* Text might change based on completion */}
                     </button>
                </div>
            </div>
        </>
    );
};

export default MonthlyReward;