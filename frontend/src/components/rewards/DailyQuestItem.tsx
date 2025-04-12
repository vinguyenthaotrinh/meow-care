// src/components/rewards/DailyQuestItem.tsx
import React from 'react';
import { Quest } from '@/types/rewards.types';
import styles from '../../styles/Rewards.module.css';
import { FaCoins, FaGem } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface DailyQuestItemProps {
    quest: Quest;
    // onClaim: (questId: string) => Promise<boolean>; // For real API
}

const DailyQuestItem: React.FC<DailyQuestItemProps> = ({ quest }) => {
    const [isLocallyClaimed, setIsLocallyClaimed] = React.useState(false);
    const [isClaiming, setIsClaiming] = React.useState(false);

    const canClaimNow = quest.isClaimable && !isLocallyClaimed;
    const isButtonDisabled = isClaiming || !canClaimNow;

    const percentage = quest.targetProgress > 0
        ? Math.min(100, (quest.currentProgress / quest.targetProgress) * 100)
        : 0;

    const handleClaim = async () => {
        if (!canClaimNow || isClaiming) return;
        setIsClaiming(true);
        console.log(`Claiming quest: ${quest.id}`);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // MOCK
            toast.success(`Claimed ${quest.rewardAmount} ${quest.rewardType}!`);
            setIsLocallyClaimed(true);
        } catch (error) {
             toast.error("An error occurred while claiming.");
             console.error("Claiming error:", error);
        } finally {
             setIsClaiming(false);
        }
    };

    let progressClass = styles.coin;
    if (quest.questType === 'hydrate') progressClass = styles.hydrate;
    else if (quest.questType === 'diet') progressClass = styles.diet;
    else if (quest.questType === 'sleep') progressClass = styles.sleep;
    else if (quest.rewardType === 'diamonds') progressClass = styles.diamond;

    const rewardElement = (
        <span className={styles.questRewardText}>
            {quest.rewardType === 'coins' && <FaCoins className={`${styles.currencyIcon} ${styles.coinIcon}`} />}
            {quest.rewardType === 'diamonds' && <FaGem className={`${styles.currencyIcon} ${styles.diamondIcon}`} />}
            +{quest.rewardAmount}
        </span>
    );

    return (
        <div className={styles.questItem}>
            {/* Content (Title, Progress) */}
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

            {/* Action Area */}
            <div className={styles.questRewardActionArea}>
                {rewardElement} {/* Always show reward text */}

                {/* Conditionally render button based on completion */}
                {quest.isCompleted ? (
                    // Completed: Show 'Claim' or 'Claimed'
                    <button
                        onClick={handleClaim}
                        disabled={isButtonDisabled}
                        className={`${styles.questClaimButton} ${!canClaimNow ? styles.questClaimedButtonVisual : ''}`}
                    >
                        {canClaimNow ? 'Claim' : 'Claimed'}
                    </button>
                ) : (
                    // Not completed: Show disabled button visually similar to 'Claimed'
                    <button disabled className={`${styles.questClaimButton} ${styles.questClaimedButtonVisual}`}>
                        Claim {/* Text could be optional here or just disabled */}
                    </button>
                )}
            </div>
        </div>
    );
};

export default DailyQuestItem;