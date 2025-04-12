// src/components/rewards/DailyCheckin.tsx
import React, { useState } from 'react';
import { XpRewardsData, CheckinDay } from '@/types/rewards.types';
import { fetchApi } from '@/lib/api';
import styles from '../../styles/Rewards.module.css';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaCoins, FaGem } from 'react-icons/fa';

interface DailyCheckinProps {
    rewardsData: XpRewardsData | null;
    onCheckinComplete: () => void; // Callback to refetch data in parent
}

const DailyCheckin: React.FC<DailyCheckinProps> = ({ rewardsData, onCheckinComplete }) => {
    const [isClaiming, setIsClaiming] = useState(false);

    const handleClaimCheckin = async () => {
        setIsClaiming(true);
        try {
            const response = await fetchApi<XpRewardsData>('/xp/checkin', {
                method: 'PUT',
                isProtected: true,
            });
            if (response.data) {
                toast.success("Checked in successfully!");
                onCheckinComplete(); // Trigger refetch in parent
            } else {
                toast.error(response.error || "Failed to check in.");
            }
        } catch (err) {
            console.error("Checkin error:", err);
            toast.error("An error occurred during check-in.");
        } finally {
            setIsClaiming(false);
        }
    };

    const getCheckinDays = (): CheckinDay[] => {
        if (!rewardsData) return [];

        const today = new Date(); today.setHours(0, 0, 0, 0); // Normalize today's date
        // Ensure last_checkin_date is treated correctly, even if '2000-01-01'
        const lastCheckinDate = new Date(rewardsData.last_checkin_date + 'T00:00:00'); // Add time to avoid timezone issues
        lastCheckinDate.setHours(0,0,0,0); // Normalize

        const isAlreadyCheckedInToday = lastCheckinDate.getTime() === today.getTime();
        const daysSinceLastCheckin = Math.floor((today.getTime() - lastCheckinDate.getTime()) / (1000 * 60 * 60 * 24));

        // Determine the current effective check-in day index (0-6)
        // If checked in yesterday or before, advance by 1 (modulo 7). If missed more than a day, reset to 0.
        // If checked in today, use the current value.
        let currentDayIndex = 0;
        if (isAlreadyCheckedInToday) {
            currentDayIndex = rewardsData.daily_checkin === 0 ? 6 : rewardsData.daily_checkin - 1; // Show the day they just claimed
        } else if (daysSinceLastCheckin === 1) {
            currentDayIndex = rewardsData.daily_checkin % 7; // The next day index
        } else if (daysSinceLastCheckin > 1) {
            currentDayIndex = 0; // Reset if missed days
        }
        // If first time ever (date is '2000-01-01'), currentDayIndex remains 0.

        const canClaimToday = !isAlreadyCheckedInToday;

        const days: CheckinDay[] = [];
        const rewards = [
            { coins: 10 }, { coins: 10 }, { coins: 10 }, { coins: 10 },
            { coins: 10 }, { coins: 10 }, { coins: 100, diamonds: 1 } // Day 7 reward
        ];

        for (let i = 0; i < 7; i++) {
            const isToday = i === currentDayIndex;
            // Claimed if index is less than the current check-in day index (unless reset),
            // OR if already checked in today and the index matches the one just claimed.
            const isClaimed = !canClaimToday ? i <= currentDayIndex : i < currentDayIndex;
             const isClaimable = isToday && canClaimToday;

            days.push({
                dayIndex: i,
                isToday: isToday,
                isClaimed: isClaimed,
                isClaimable: isClaimable,
                rewardCoins: rewards[i].coins,
                rewardDiamonds: rewards[i].diamonds,
            });
        }
        return days;
    };

    const checkinDays = getCheckinDays();
    const todayCheckin = checkinDays.find(d => d.isToday);

    return (
        <section className={styles.checkinSection}>
            <h3 className={styles.checkinTitle}>Daily Check-in</h3>
            <div className={styles.checkinGrid}>
                {checkinDays.map(day => (
                    <div
                        key={day.dayIndex}
                        className={`
                            ${styles.checkinBox}
                            ${day.isClaimed ? styles.claimed : ''}
                            ${day.isToday ? styles.today : ''}
                            ${!day.isClaimed && !day.isToday ? styles.future : ''}
                        `}
                    >
                        <div className={styles.checkinBoxContent}>
                           {day.rewardCoins && (
                                <span className={styles.checkinReward}>
                                    <FaCoins className={`${styles.currencyIcon} ${styles.coinIcon}`} />
                                    +{day.rewardCoins}
                                </span>
                            )}
                            {day.rewardDiamonds && (
                                <span className={styles.checkinReward}>
                                    <FaGem className={`${styles.currencyIcon} ${styles.diamondIcon}`} />
                                    +{day.rewardDiamonds}
                                </span>
                            )}
                        </div>
                        <span className={styles.checkinDayLabel}>
                            {day.isToday ? 'Today' : `Day ${day.dayIndex + 1}`}
                        </span>
                    </div>
                ))}
            </div>
            {todayCheckin?.isClaimable && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button
                        onClick={handleClaimCheckin}
                        disabled={isClaiming}
                        className={styles.checkinClaimButton}
                    >
                        {isClaiming ? <LoadingSpinner inline size="small" /> : 'Claim'}
                    </button>
                </div>
            )}
        </section>
    );
};

export default DailyCheckin;