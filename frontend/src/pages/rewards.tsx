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
import styles from '@/styles/Rewards.module.css'; // Import styles
import { toast } from 'react-toastify';

// --- Mock Data ---
const MOCK_DAILY_QUESTS: Quest[] = [
    { id: 'dq1', title: 'Drink up 1500ml', currentProgress: 750, targetProgress: 1500, rewardType: 'coins', rewardAmount: 30, isClaimable: false, isCompleted: false, questType: 'hydrate' },
    { id: 'dq2', title: 'Complete 3 Daily Tasks', currentProgress: 1, targetProgress: 3, rewardType: 'coins', rewardAmount: 50, isClaimable: false, isCompleted: false },
    { id: 'dq3', title: 'Check-in Today', currentProgress: 0, targetProgress: 1, rewardType: 'coins', rewardAmount: 10, isClaimable: false, isCompleted: false, questType: 'checkin' }, // Status updated based on checkin API
    { id: 'dq4', title: 'Log Dinner', currentProgress: 1, targetProgress: 1, rewardType: 'diamonds', rewardAmount: 1, isClaimable: true, isCompleted: true, questType: 'diet' },
];

const MOCK_MONTHLY_REWARD = {
    currentProgress: 25, // Example progress
    targetProgress: 40,
    rewardAmount: 40
};
// --- End Mock Data ---


const RewardsPage = () => {
    const [activeTab, setActiveTab] = useState<'quests' | 'store'>('quests'); // State now managed in RewardsLayout, but needed here for fetching/logic
    const [rewardsData, setRewardsData] = useState<XpRewardsData | null>(null);
    const [dailyQuests, setDailyQuests] = useState<Quest[]>(MOCK_DAILY_QUESTS); // Use mock data
    const [monthlyReward, setMonthlyReward] = useState(MOCK_MONTHLY_REWARD); // Use mock data
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch rewards data
    const fetchRewardsData = useCallback(async () => {
        // Keep isLoading true if already loading
        setError(null);
        try {
            const response = await fetchApi<XpRewardsData>('/xp', { isProtected: true });
            if (response.data) {
                setRewardsData(response.data);
                // --- Update Mock Quest Status based on fetched data ---
                setDailyQuests(prevQuests => prevQuests.map(q => {
                    if (q.questType === 'checkin' && response.data) {
                        const today = new Date(); today.setHours(0, 0, 0, 0);
                        const lastCheckin = new Date(response.data.last_checkin_date + 'T00:00:00'); lastCheckin.setHours(0,0,0,0);
                        const isCheckedIn = lastCheckin.getTime() === today.getTime();
                        return { ...q, currentProgress: isCheckedIn ? 1 : 0, isCompleted: isCheckedIn, isClaimable: isCheckedIn /* Assuming instant reward on check-in */ };
                    }
                    // Add logic for other quest types based on fetched logs if needed later
                    return q;
                }));
                // --- End Quest Update ---
            } else {
                setError(response.error || "Failed to load rewards data.");
                toast.error(response.error || "Failed to load rewards data.");
            }
        } catch (err: any) {
            console.error("Error fetching rewards:", err);
            setError("An unexpected error occurred.");
            toast.error("An unexpected error occurred loading rewards.");
        } finally {
             // Set loading false only after all initial setup is done
             // If we were fetching quests/monthly too, wait for them
             setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRewardsData();
    }, [fetchRewardsData]);

    // Callback for DailyCheckin to refetch data
    const handleCheckinComplete = () => {
        setIsLoading(true); // Show loading while refetching
        fetchRewardsData();
    };

    const renderQuestsTab = () => (
        <div className={styles.questsTabContent}> {/* Optional wrapper */}
             {isLoading && !rewardsData ? (
                 <div className={styles.loadingContainer}><LoadingSpinner /></div>
            ) : error ? (
                <p className={styles.errorText}>{error}</p>
            ) : (
                <>
                    {/* Currency Display absolutely positioned by its own CSS */}
                    <UserCurrencyDisplay rewardsData={rewardsData} />

                    <DailyCheckin rewardsData={rewardsData} onCheckinComplete={handleCheckinComplete} />

                    <DailyQuestsSection quests={dailyQuests} />

                    <MonthlyReward
                        currentProgress={monthlyReward.currentProgress}
                        targetProgress={monthlyReward.targetProgress}
                        rewardAmount={monthlyReward.rewardAmount}
                    />
                </>
            )}
        </div>
    );

    const renderStoreTab = () => (
        <div>
            <h3 className={styles.sectionTitle}>Store</h3>
            <p>Store coming soon!</p>
            {/* Store items will be rendered here */}
        </div>
    );


    return (
        <DashboardLayout>
             {/* Pass the render function to RewardsLayout */}
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