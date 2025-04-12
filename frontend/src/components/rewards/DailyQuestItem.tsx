// src/components/rewards/DailyQuestItem.tsx
import React from 'react';
import { Quest } from '@/types/rewards.types';
import styles from '../../styles/Rewards.module.css';
// Removed LoadingSpinner import
import { FaCoins, FaGem } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface DailyQuestItemProps {
    quest: Quest;
    // Add onClaim function prop later for real API
    // onClaim: (questId: string) => Promise<boolean>; // Return true on success
}

const DailyQuestItem: React.FC<DailyQuestItemProps> = ({ quest }) => {
    // Simulate claimed state locally until API exists & parent updates quest prop
    const [isLocallyClaimed, setIsLocallyClaimed] = React.useState(false);
    // State to disable button during the async 'claim' operation
    const [isClaiming, setIsClaiming] = React.useState(false);

    // Determine if the button should be active 'Claim' or disabled 'Claimed'
    // It's claimable if the quest prop says so AND it hasn't been claimed locally (for mock)
    const canClaimNow = quest.isClaimable && !isLocallyClaimed;
    // Button should be disabled if currently processing OR if it's already claimed
    const isButtonDisabled = isClaiming || !canClaimNow;

    const percentage = quest.targetProgress > 0
        ? Math.min(100, (quest.currentProgress / quest.targetProgress) * 100)
        : 0;

    const handleClaim = async () => {
        if (!canClaimNow || isClaiming) return; // Prevent clicking if not claimable or already claiming

        setIsClaiming(true); // Disable button immediately
        console.log(`Claiming quest: ${quest.id}`);
        try {
            // --- MOCK API CALL ---
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            // --- END MOCK ---

            // --- On Real API Success ---
            // const success = await onClaim(quest.id); // Call parent's claim function
            // if (success) {
            //    toast.success(`Claimed ${quest.rewardAmount} ${quest.rewardType}!`);
            //    // Parent should refetch/update data, causing this component to re-render
            //    // with quest.isClaimable = false. No need for local state if parent handles it.
            // } else {
            //    toast.error("Failed to claim quest.");
            // }
            // --- End Real API ---

            // --- Mock Success Logic ---
            toast.success(`Claimed ${quest.rewardAmount} ${quest.rewardType}!`);
            setIsLocallyClaimed(true); // Update local state for visual feedback in mock
            // --- End Mock ---

        } catch (error) {
             toast.error("An error occurred while claiming.");
             console.error("Claiming error:", error);
        } finally {
             setIsClaiming(false); // Re-enable button logic (it will show "Claimed" due to isLocallyClaimed)
        }
    };

    let progressClass = styles.coin; // Default
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
            <div className={styles.questRewardActionArea}>
                {rewardElement}
                {/* Render button based on completion status */}
                {quest.isCompleted && (
                    <button
                        onClick={handleClaim}
                        // Disable based on combined state
                        disabled={isButtonDisabled}
                        // Use specific class for "Claimed" visual state
                        className={`${styles.questClaimButton} ${!canClaimNow ? styles.questClaimedButtonVisual : ''}`}
                    >
                        {/* No Spinner, text changes based on 'canClaimNow' */}
                        {canClaimNow ? 'Claim' : 'Claimed'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default DailyQuestItem;