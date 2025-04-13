// src/components/rewards/DailyQuestItem.tsx
import React from 'react';
import { Quest } from '@/types/rewards.types'; // Use updated type
import styles from '../../styles/Rewards.module.css';
import { FaCoins, FaGem } from 'react-icons/fa';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner'; // Keep LoadingSpinner

interface DailyQuestItemProps {
    quest: Quest;
    onClaim: (questId: string) => Promise<void>; // Function to call when claim is clicked
    isClaimingQuest: boolean; // Pass loading state specific to this quest
}

const DailyQuestItem: React.FC<DailyQuestItemProps> = ({ quest, onClaim, isClaimingQuest }) => {
    // Removed local claimed state - rely on quest.isClaimable from props
    // const [isLocallyClaimed, setIsLocallyClaimed] = React.useState(false);
    // Removed local claiming state - use isClaimingQuest prop

    // Determine button state directly from props
    const canClaimNow = quest.is_claimable; // isClaimable is calculated by backend/parent
    const isButtonDisabled = isClaimingQuest || !canClaimNow; // Disable if loading or already claimed/not claimable

    // Calculate percentage based on user_progress if available
    const currentProgress = quest.user_progress?.current_progress ?? 0;
    const percentage = quest.target_progress > 0
        ? Math.min(100, (currentProgress / quest.target_progress) * 100)
        : 0;

    const handleClaim = () => {
        if (!canClaimNow || isClaimingQuest) return;
        onClaim(quest.id); // Call parent's claim function
    };

    let progressClass = styles.coin; // Default
    if (quest.trigger_type === 'hydrate_goal') progressClass = styles.hydrate;
    else if (quest.trigger_type === 'log_meal') progressClass = styles.diet; // Use trigger type if more specific
    else if (quest.trigger_type === 'checkin') progressClass = styles.coin; // Checkin gives coins
    else if (quest.trigger_type === 'tasks_completed') progressClass = styles.coin; // Example
    else if (quest.reward_type === 'diamonds') progressClass = styles.diamond; // Fallback to reward type

    const rewardElement = (
        <span className={styles.questRewardText}>
            {quest.reward_type === 'coins' && <FaCoins className={`${styles.currencyIcon} ${styles.coinIcon}`} />}
            {quest.reward_type === 'diamonds' && <FaGem className={`${styles.currencyIcon} ${styles.diamondIcon}`} />}
            +{quest.reward_amount}
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
                        {/* Use currentProgress from user_progress */}
                        {currentProgress} / {quest.target_progress}
                    </span>
                </div>
            </div>

            {/* Action Area */}
            <div className={styles.questRewardActionArea}>
                {rewardElement} {/* Always show reward text */}

                {/* Render button based on completion status from backend */}
                {quest.is_completed ? (
                    // Completed: Show 'Claim' or 'Claimed'
                    <button
                        onClick={handleClaim}
                        disabled={isButtonDisabled}
                        // Apply claimed visual style if it's not claimable now
                        className={`${styles.questClaimButton} ${!canClaimNow ? styles.questClaimedButtonVisual : ''}`}
                    >
                        {/* Show spinner if this specific quest is loading */}
                        {isClaimingQuest ? <LoadingSpinner inline /> : (canClaimNow ? 'Claim' : 'Claimed')}
                    </button>
                ) : (
                    // Not completed: Show disabled button visually similar to 'Claimed'
                    // Or potentially hide button entirely if not completed? Your choice.
                    <button disabled className={`${styles.questClaimButton} ${styles.questClaimedButtonVisual}`}>
                        Claim {/* Text might be optional here */}
                    </button>
                )}
            </div>
        </div>
    );
};

export default DailyQuestItem;