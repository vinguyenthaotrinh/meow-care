// src/components/rewards/DailyQuestItem.tsx
import React from 'react';
import { Quest } from '@/types/rewards.types';
import styles from '../../styles/Rewards.module.css';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaCoins, FaGem } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface DailyQuestItemProps {
    quest: Quest;
    // Add onClaim function prop later when API is available
    // onClaim: (questId: string) => Promise<void>;
}

const DailyQuestItem: React.FC<DailyQuestItemProps> = ({ quest }) => {
    const [isClaiming, setIsClaiming] = React.useState(false); // Mock claiming state

    const percentage = quest.targetProgress > 0
        ? Math.min(100, (quest.currentProgress / quest.targetProgress) * 100)
        : 0;

    const handleClaim = async () => {
        if (!quest.isClaimable || isClaiming) return;
        setIsClaiming(true);
        console.log(`Claiming quest: ${quest.id}`);
        // MOCK API CALL
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(`Claimed ${quest.rewardAmount} ${quest.rewardType}!`);
        // In real scenario, call API via onClaim prop and update state in parent
        // setIsClaiming(false); // Parent should handle state update which re-renders this
        // For mock, just keep it loading visually for now or fake completion
         // Or: visually disable after "claim"
         // quest.isClaimable = false; // This won't work directly on prop
         // Need parent state update
         setIsClaiming(false); // Reset mock loading
    };

    // Determine progress bar color based on quest type or reward type
    let progressClass = styles.coin; // Default to coin color
    if (quest.questType === 'hydrate') progressClass = styles.hydrate;
    else if (quest.questType === 'diet') progressClass = styles.diet;
    else if (quest.questType === 'sleep') progressClass = styles.sleep;
    else if (quest.rewardType === 'diamonds') progressClass = styles.diamond; // Fallback to diamond color if reward is diamond

    return (
        <div className={styles.questItem}>
            <div className={styles.questContent}>
                <h4 className={styles.questTitle}>{quest.title}</h4>
                <div className={styles.questProgressBarContainer}>
                    <div
                        className={`${styles.questProgressBarFill} ${progressClass}`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                    <span className={styles.questProgressText}>
                        {quest.currentProgress} / {quest.targetProgress}
                    </span>
                </div>
            </div>
            <div className={styles.questReward}>
                {quest.isClaimable ? (
                    <button
                        onClick={handleClaim}
                        disabled={isClaiming}
                        className={styles.questClaimButton}
                    >
                        {isClaiming ? <LoadingSpinner inline size="small" /> : 'Claim'}
                    </button>
                ) : (
                     // Show reward text if not claimable (already claimed or not completed)
                     <span className={styles.questRewardText}>
                        {quest.rewardType === 'coins' && <FaCoins className={`${styles.currencyIcon} ${styles.coinIcon}`} />}
                        {quest.rewardType === 'diamonds' && <FaGem className={`${styles.currencyIcon} ${styles.diamondIcon}`} />}
                        +{quest.rewardAmount}
                     </span>
                )}

            </div>
        </div>
    );
};

export default DailyQuestItem;