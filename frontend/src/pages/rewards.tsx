// src/pages/dashboard/rewards.tsx
import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RewardsLayout from '@/components/rewards/RewardsLayout'; // Use the correct layout
import UserCurrencyDisplay from '@/components/rewards/UserCurrencyDisplay';
import DailyCheckin from '@/components/rewards/DailyCheckin';
import DailyQuestsSection from '@/components/rewards/DailyQuestsSection';
import MonthlyReward from '@/components/rewards/MonthlyReward';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { fetchApi } from '@/lib/api';
import { XpRewardsData, Quest } from '@/types/rewards.types';
import rewardStyles from '@/styles/Rewards.module.css'; // Styles specific to reward elements
import { toast } from 'react-toastify';

// --- Mock Data (Keep as is or update with more realistic states) ---
const MOCK_DAILY_QUESTS: Quest[] = [
    // Quest not completed, not claimable
    { id: 'dq1', title: 'Drink up 1500ml', currentProgress: 750, targetProgress: 1500, rewardType: 'coins', rewardAmount: 30, isClaimable: false, isCompleted: false, questType: 'hydrate' },
    // Quest partially completed, not claimable
    { id: 'dq2', title: 'Complete 3 Daily Tasks', currentProgress: 1, targetProgress: 3, rewardType: 'coins', rewardAmount: 50, isClaimable: false, isCompleted: false },
    // Quest completed, IS claimable
    { id: 'dq4', title: 'Log Dinner', currentProgress: 1, targetProgress: 1, rewardType: 'diamonds', rewardAmount: 1, isClaimable: true, isCompleted: true, questType: 'diet' },
    // Quest representing check-in (status updated from API)
    { id: 'dq3', title: 'Check-in Today', currentProgress: 0, targetProgress: 1, rewardType: 'coins', rewardAmount: 10, isClaimable: false, isCompleted: false, questType: 'checkin' },
];
const MOCK_MONTHLY_REWARD = { currentProgress: 25, targetProgress: 40, rewardAmount: 40 };
// --- End Mock Data ---


const RewardsPage = () => {
    const [rewardsData, setRewardsData] = useState<XpRewardsData | null>(null);
    const [dailyQuests, setDailyQuests] = useState<Quest[]>(MOCK_DAILY_QUESTS);
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
                // Update mock check-in quest status
                setDailyQuests(prevQuests => prevQuests.map(q => {
                    if (q.questType === 'checkin') {
                        const today = new Date(); today.setHours(0, 0, 0, 0);
                        const lastCheckin = new Date(response.data.last_checkin_date + 'T00:00:00'); lastCheckin.setHours(0,0,0,0);
                        const isCheckedIn = lastCheckin.getTime() === today.getTime();
                        // Assume check-in quest is claimable if completed (checked-in)
                        return { ...q, currentProgress: isCheckedIn ? 1 : 0, isCompleted: isCheckedIn, isClaimable: isCheckedIn };
                    }
                    // TODO: Add logic here later to update other quests based on API data
                    // e.g., check hydrate logs, diet logs, etc. to set isCompleted/isClaimable
                    return q;
                }));
            } else {
                setError(response.error || "Failed to load rewards data.");
                toast.error(response.error || "Failed to load rewards data.");
            }
        } catch (err: any) {
            console.error("Error fetching rewards:", err);
            setError("An unexpected error occurred.");
            toast.error("An unexpected error occurred loading rewards.");
        } finally {
             setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchRewardsData(); }, [fetchRewardsData]);

    const handleCheckinComplete = () => { fetchRewardsData(); };

    const renderQuestsTab = () => (
        <div className={rewardStyles.questsTabContent}>
             {isLoading && !rewardsData ? (
                 <div className={rewardStyles.loadingContainer}><LoadingSpinner /></div>
            ) : error ? (
                <p className={rewardStyles.errorText}>{error}</p>
            ) : (
                <>
                    {/* Currency Display - positioned sticky via its CSS */}
                    <UserCurrencyDisplay rewardsData={rewardsData} />

                    {/* Add Title for Check-in */}
                    <h3 className={rewardStyles.checkinTitle}>Daily Check-in</h3>
                    <DailyCheckin rewardsData={rewardsData} onCheckinComplete={handleCheckinComplete} />

                    {/* NEW Layout Grid for Daily/Monthly */}
                    <div className={rewardStyles.questsLayoutGrid}>
                        <DailyQuestsSection quests={dailyQuests} />
                        <MonthlyReward
                            currentProgress={monthlyReward.currentProgress}
                            targetProgress={monthlyReward.targetProgress}
                            rewardAmount={monthlyReward.rewardAmount}
                        />
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
                 {(currentActiveTab: string) => (
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