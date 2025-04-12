// src/components/rewards/DailyCheckin.tsx
import React, { useState } from 'react';
import { XpRewardsData, CheckinDay } from '@/types/rewards.types';
import { fetchApi } from '@/lib/api';
import styles from '../../styles/Rewards.module.css';
import { toast } from 'react-toastify';
// Removed LoadingSpinner import
import { FaCoins, FaGem } from 'react-icons/fa';

interface DailyCheckinProps {
    rewardsData: XpRewardsData | null;
    onCheckinComplete: () => void; // Callback to refetch data in parent
}

const DailyCheckin: React.FC<DailyCheckinProps> = ({ rewardsData, onCheckinComplete }) => {
    // isClaiming state now only disables the button during the API call
    const [isClaiming, setIsClaiming] = useState(false);

    const handleClaimCheckin = async () => {
        // Prevent multiple clicks while processing
        if (isClaiming) return;

        setIsClaiming(true); // Disable button immediately
        try {
            const response = await fetchApi<XpRewardsData>('/xp/checkin', {
                method: 'PUT',
                isProtected: true,
            });
            if (response.data) {
                toast.success("Checked in successfully!");
                onCheckinComplete(); // Trigger refetch in parent
                // No need to set isClaiming false here, the refetch will update rewardsData
                // which will change isClaimable in the next render.
            } else {
                toast.error(response.error || "Failed to check in.");
                setIsClaiming(false); // Re-enable button on failure
            }
        } catch (err) {
            console.error("Checkin error:", err);
            toast.error("An error occurred during check-in.");
            setIsClaiming(false); // Re-enable button on unexpected error
        }
        // Note: isClaiming is not explicitly set back to false on success.
        // The component relies on the parent refetching and re-rendering
        // with updated rewardsData where today is no longer claimable.
    };

    const getCheckinDays = (): CheckinDay[] => {
        // ... (getCheckinDays logic remains exactly the same) ...
        if (!rewardsData) return [];
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const lastCheckinDate = new Date(rewardsData.last_checkin_date + 'T00:00:00'); lastCheckinDate.setHours(0,0,0,0);
        const isAlreadyCheckedInToday = lastCheckinDate.getTime() === today.getTime();
        const daysSinceLastCheckin = Math.floor((today.getTime() - lastCheckinDate.getTime()) / (1000 * 60 * 60 * 24));
        let currentDayIndex = 0;
        if (isAlreadyCheckedInToday) {
            currentDayIndex = rewardsData.daily_checkin === 0 ? 6 : rewardsData.daily_checkin - 1;
        } else if (daysSinceLastCheckin === 1) {
            currentDayIndex = rewardsData.daily_checkin % 7;
        } else if (daysSinceLastCheckin > 1) {
            currentDayIndex = 0;
        }
        const canClaimToday = !isAlreadyCheckedInToday;
        const days: CheckinDay[] = [];
        const rewards = [ { coins: 10 }, { coins: 10 }, { coins: 10 }, { coins: 10 }, { coins: 10 }, { coins: 10 }, { coins: 100, diamonds: 1 } ];
        for (let i = 0; i < 7; i++) {
            const isToday = i === currentDayIndex;
            const isClaimed = !canClaimToday ? i <= currentDayIndex : i < currentDayIndex;
            const isClaimable = isToday && canClaimToday;
            days.push({ dayIndex: i, isToday: isToday, isClaimed: isClaimed, isClaimable: isClaimable, rewardCoins: rewards[i].coins, rewardDiamonds: rewards[i].diamonds });
        }
        return days;
    };

    const checkinDays = getCheckinDays();
    const todayCheckin = checkinDays.find(d => d.isToday);
    const isButtonDisabled = isClaiming || !todayCheckin?.isClaimable; // Disable if claiming or not claimable

    return (
        <section className={styles.checkinSection}>
            <div className={styles.checkinGrid}>
                {/* ... (mapping checkinDays remains the same) ... */}
                 {checkinDays.map(day => (
                    <div key={day.dayIndex} className={` ${styles.checkinBox} ${day.isClaimed ? styles.claimed : ''} ${day.isToday ? styles.today : ''} ${!day.isClaimed && !day.isToday ? styles.future : ''} ${day.dayIndex === 6 ? styles.daySevenBox : ''} `}>
                        <div className={`${styles.checkinBoxContent} ${day.dayIndex === 6 ? styles.daySevenContent : ''}`}>
                           {day.rewardCoins && ( <span className={styles.checkinReward}> <FaCoins className={`${styles.currencyIcon} ${styles.coinIcon}`} /> +{day.rewardCoins} </span> )}
                            {day.rewardDiamonds && ( <span className={styles.checkinReward}> <FaGem className={`${styles.currencyIcon} ${styles.diamondIcon}`} /> +{day.rewardDiamonds} </span> )}
                        </div>
                        <span className={styles.checkinDayLabel}> {day.isToday ? 'Today' : `Day ${day.dayIndex + 1}`} </span>
                    </div>
                ))}
            </div>
            {/* Render button area IF it's today, regardless of claimable status */}
            {todayCheckin && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button
                        onClick={handleClaimCheckin}
                        // Disable if currently claiming OR if it's not claimable (already claimed)
                        disabled={isButtonDisabled}
                        // Use specific class for claimed state
                        className={`${styles.checkinClaimButton} ${!todayCheckin.isClaimable ? styles.claimedButtonVisual : ''}`}
                    >
                         {/* No Spinner, Text changes based on claimable status */}
                         {todayCheckin.isClaimable ? 'Claim' : 'Claimed'}
                    </button>
                </div>
            )}
        </section>
    );
};

export default DailyCheckin;