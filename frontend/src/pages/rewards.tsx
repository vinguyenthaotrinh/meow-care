// src/pages/dashboard/rewards.tsx
import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RewardsLayout from '@/components/rewards/RewardsLayout';
import UserCurrencyDisplay from '@/components/rewards/UserCurrencyDisplay';
import DailyCheckin from '@/components/rewards/DailyCheckin';
import DailyQuestsSection from '@/components/rewards/DailyQuestsSection';
import MonthlyReward from '@/components/rewards/MonthlyReward';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { fetchApi } from '@/lib/api';
import { XpRewardsData, Quest } from '@/types/rewards.types';
import rewardStyles from '@/styles/Rewards.module.css';
import { toast } from 'react-toastify';

// --- Mock Data (Keep as is or update with more realistic states) ---
const MOCK_DAILY_QUESTS: Quest[] = [
    { id: 'dq1', title: 'Drink up 1500ml', currentProgress: 750, targetProgress: 1500, rewardType: 'coins', rewardAmount: 30, isClaimable: false, isCompleted: false, questType: 'hydrate' },
    { id: 'dq2', title: 'Complete 3 Daily Tasks', currentProgress: 1, targetProgress: 3, rewardType: 'coins', rewardAmount: 50, isClaimable: false, isCompleted: false },
    { id: 'dq4', title: 'Log Dinner', currentProgress: 1, targetProgress: 1, rewardType: 'diamonds', rewardAmount: 1, isClaimable: true, isCompleted: true, questType: 'diet' },
    { id: 'dq3', title: 'Check-in Today', currentProgress: 0, targetProgress: 1, rewardType: 'coins', rewardAmount: 10, isClaimable: false, isCompleted: false, questType: 'checkin' },
];
const MOCK_MONTHLY_REWARD = { currentProgress: 25, targetProgress: 40, rewardAmount: 40, rewardType: 'diamonds' as const }; // Added rewardType
// --- End Mock Data ---


const RewardsPage = () => {
    const [rewardsData, setRewardsData] = useState<XpRewardsData | null>(null);
    const [dailyQuests, setDailyQuests] = useState<Quest[]>([]); // Start empty, populate from mock/API
    const [monthlyReward, setMonthlyReward] = useState(MOCK_MONTHLY_REWARD);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRewardsData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchApi<XpRewardsData>('/xp', { isProtected: true });
            if (response.data) {
                setRewardsData(response.data);

                // --- Update Quest Status based on fetched data ---
                // Use MOCK_DAILY_QUESTS as base, update status
                const updatedQuests = MOCK_DAILY_QUESTS.map(q => {
                    if (q.questType === 'checkin') {
                        const today = new Date(); today.setHours(0, 0, 0, 0);
                        const lastCheckin = new Date((response.data?.last_checkin_date || new Date().toISOString().split('T')[0]) + 'T00:00:00'); lastCheckin.setHours(0,0,0,0);
                        const isCheckedIn = lastCheckin.getTime() === today.getTime();
                        // Quest is completed if checked-in, claimable if completed (assuming checkin reward is instant)
                        return { ...q, currentProgress: isCheckedIn ? 1 : 0, isCompleted: isCheckedIn, isClaimable: isCheckedIn };
                    }
                    // TODO: Update other quests based on real data later
                    // For now, keep mock status for others
                    return q;
                });
                setDailyQuests(updatedQuests);
                // --- End Quest Update ---

            } else {
                setError(response.error || "Failed to load rewards data.");
                toast.error(response.error || "Failed to load rewards data.");
                setDailyQuests(MOCK_DAILY_QUESTS); // Fallback to default mock on error
            }
        } catch (err: any) {
            console.error("Error fetching rewards:", err);
            setError("An unexpected error occurred.");
            toast.error("An unexpected error occurred loading rewards.");
            setDailyQuests(MOCK_DAILY_QUESTS); // Fallback to default mock on error
        } finally {
             setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchRewardsData(); }, [fetchRewardsData]);

    const handleCheckinComplete = () => { fetchRewardsData(); };

    const renderQuestsTab = () => (
        <div className={rewardStyles.questsTabContent}>
             {/* Render Currency Display first, it will stick */}
             <UserCurrencyDisplay rewardsData={rewardsData} />

             {isLoading ? (
                 <div className={rewardStyles.loadingContainer}><LoadingSpinner /></div>
            ) : error ? (
                <p className={rewardStyles.errorText}>{error}</p>
            ) : (
                <>
                    {/* Wrap Checkin in a div to ensure it's below sticky currency */}
                    <div>
                        <h3 className={rewardStyles.checkinTitle}>Daily Check-in</h3>
                        <DailyCheckin rewardsData={rewardsData} onCheckinComplete={handleCheckinComplete} />
                    </div>

                    {/* Layout Grid for Daily/Monthly */}
                    <div className={rewardStyles.questsLayoutGrid}>
                        {/* Daily Quests Section takes the first grid column */}
                        <DailyQuestsSection quests={dailyQuests} />

                        {/* Monthly Reward Section takes the second grid column */}
                        {/* Wrap MonthlyReward component call inside a div or fragment if needed by grid */}
                        <div>
                            <MonthlyReward
                                currentProgress={monthlyReward.currentProgress}
                                targetProgress={monthlyReward.targetProgress}
                                rewardAmount={monthlyReward.rewardAmount}
                                rewardType={monthlyReward.rewardType} // Pass type
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    const renderStoreTab = () => (
        <div>
            <h3 className={rewardStyles.questsTitle}>Store</h3>
            <p>Store coming soon!</p>
        </div>
    );


    return (
        <DashboardLayout>
             <RewardsLayout>
                 {(currentActiveTab) => (
                    <>
                        {currentActiveTab === 'quests' && renderQuestsTab()}
                        {currentActiveTab === 'store' && renderStoreTab()}
                    </>
                 )}
            </RewardsLayout>
        </DashboardLayout>
    );
};

export default RewardsPage;