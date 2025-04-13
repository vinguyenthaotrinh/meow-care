// src/components/rewards/MonthlyReward.tsx
import React from 'react';
import styles from '../../styles/Rewards.module.css';
import { FaGem, FaCoins } from 'react-icons/fa';
import { Quest } from '@/types/rewards.types'; // Import Quest type

interface MonthlyRewardProps {
    quest: Quest | null; // Accept the full Quest object or null
}

const MonthlyReward: React.FC<MonthlyRewardProps> = ({ quest }) => {
    // Show placeholder or nothing if no monthly quest data
    if (!quest) {
        return (
            <div className={styles.monthlyRewardSection} style={{ opacity: 0.5 }}>
                 <h3 className={styles.monthlyRewardOuterTitle}>Monthly Reward</h3>
                 <p>Loading monthly reward...</p>
            </div>
        );
    }

    const currentProgress = quest.user_progress?.current_progress ?? 0;
    const targetProgress = quest.target_progress;
    const rewardAmount = quest.reward_amount;
    const rewardType = quest.reward_type;

    const percentage = targetProgress > 0
        ? Math.min(100, (currentProgress / targetProgress) * 100)
        : 0;

    // Determine completion and claim status from the quest object
    const isCompleted = quest.is_completed;
    const isClaimed = quest.user_progress?.claimed_at != null; // Check if claimed_at has a value
    const isClaimable = quest.is_claimable; // Use the value calculated by backend

    const rewardIcon = rewardType === 'diamonds'
        ? <FaGem className={`${styles.currencyIcon} ${styles.diamondIcon}`} />
        : <FaCoins className={`${styles.currencyIcon} ${styles.coinIcon}`} />;

    return (
        <>
             <h3 className={styles.monthlyRewardOuterTitle}>Monthly Reward</h3>
             <div className={styles.monthlyRewardBox}>
                {/* Title inside the box */}
                {/* <h4 className={styles.monthlyRewardTitle}>{quest.title}</h4> */}
                <div className={styles.monthlyRewardProgressBarContainer}>
                    <div
                        className={styles.monthlyRewardProgressBarFill}
                        style={{ width: `${percentage}%` }}
                    ></div>
                     <span className={styles.monthlyRewardProgressText}>
                        {currentProgress} / {targetProgress} Daily Quests
                     </span>
                </div>
                <div className={styles.monthlyRewardInfoArea}>
                    <span className={styles.monthlyRewardInfoText}>
                        Reward: {rewardIcon} {rewardAmount}
                    </span>
                     {/* Monthly reward might have different claim logic - maybe automatic? */}
                     {/* For now, show Claimed if completed, otherwise disabled Claim */}
                     <button
                        disabled={!isClaimable || isClaimed} // Disable if not claimable or already claimed
                        className={`${styles.questClaimButton} ${isClaimed ? styles.questClaimedButtonVisual : ''} ${!isClaimable ? styles.questClaimedButtonVisual: ''}`}
                        // onClick={handleClaimMonthly} // Need a claim handler if it's manual
                     >
                         {isClaimed ? 'Claimed' : 'Claim'}
                     </button>
                </div>
            </div>
        </>
    );
};

export default MonthlyReward;