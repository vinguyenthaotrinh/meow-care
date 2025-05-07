// src/components/rewards/DailyQuestItem.tsx
import React from 'react';
import { Quest } from '@/types/rewards.types'; // Use correct Quest type
import styles from '../../styles/Rewards.module.css'; // Use specific styles
import { FaCoins, FaGem } from 'react-icons/fa';
// Removed toast import if not used directly here
// Removed LoadingSpinner import

interface DailyQuestItemProps {
    quest: Quest;
    onClaim: (questId: string) => Promise<void>; // Function to call when claim is clicked
    // Removed isClaimingQuest prop
}

const DailyQuestItem: React.FC<DailyQuestItemProps> = ({ quest, onClaim }) => {

    // Determine button state directly from props provided by the parent
    // 'is_claimable' should be false if already claimed or not completed according to backend logic
    const canClaimNow = quest.is_claimable;
    // Button is disabled if it cannot be claimed now
    // The parent's loading overlay prevents clicks during the API call itself
    const isButtonDisabled = !canClaimNow;

    // Calculate percentage based on user_progress if available
    const currentProgress = quest.user_progress?.current_progress ?? 0;
    const percentage = quest.target_progress > 0
        ? Math.min(100, (currentProgress / quest.target_progress) * 100)
        : 0;

    const handleClaim = () => {
        // Parent's loading state prevents clicks during API call.
        // Only call onClaim if it's currently claimable.
        if (canClaimNow) {
            onClaim(quest.id); // Call parent's claim function
        }
    };

    // Determine progress bar color based on quest type or reward type
    let progressClass = styles.coin; // Default
    if (quest.trigger_type === 'hydrate_goal') progressClass = styles.hydrate;
    else if (quest.trigger_type === 'log_meal') progressClass = styles.diet;
    else if (quest.trigger_type === 'checkin') progressClass = styles.coin;
    else if (quest.trigger_type === 'tasks_completed') progressClass = styles.coin;
    else if (quest.reward_type === 'diamonds') progressClass = styles.diamond;

    // Reward text element
    const rewardElement = (
        <span className={styles.questRewardText}>
            {quest.reward_type === 'coins' && <FaCoins className={`${styles.currencyIcon} ${styles.coinIcon}`} />}
            {quest.reward_type === 'diamonds' && <FaGem className={`${styles.currencyIcon} ${styles.diamondIcon}`} />}
            +{quest.reward_amount}
        </span>
    );

    return (
        // Parent overlay handles visual loading state for the whole item
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
                        {currentProgress} / {quest.target_progress}
                    </span>
                </div>
            </div>

            {/* Action Area */}
            <div className={styles.questRewardActionArea}>
                {rewardElement}

                {/* Button area - No internal spinner */}
                {quest.is_completed ? (
                     <button
                        onClick={handleClaim}
                        disabled={isButtonDisabled} // Disable based on claimable status
                        className={`${styles.questClaimButton} ${!canClaimNow ? styles.questClaimedButtonVisual : ''}`}
                    >
                        {/* Text changes based on claimable status */}
                        {canClaimNow ? 'Claim' : 'Claimed'}
                    </button>
                ) : (
                    // Optional: Render a disabled button even if not completed
                     <button disabled className={`${styles.questClaimButton} ${styles.questClaimedButtonVisual}`}>
                        Claim
                    </button>
                )}
            </div>
        </div>
    );
};

export default DailyQuestItem;