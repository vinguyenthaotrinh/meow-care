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
import { XpRewardsData, Quest } from '@/types/rewards.types'; // Use correct Quest type
import rewardStyles from '@/styles/Rewards.module.css';
import { toast } from 'react-toastify';

const RewardsPage = () => {
    const [rewardsData, setRewardsData] = useState<XpRewardsData | null>(null);
    // State for ALL quests fetched from API
    const [allQuests, setAllQuests] = useState<Quest[]>([]);
    // State for loading specific parts
    const [isLoadingRewards, setIsLoadingRewards] = useState(true);
    const [isLoadingQuests, setIsLoadingQuests] = useState(true);
    // State to track which quest is currently being claimed
    const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Combined fetch function
    const fetchData = useCallback(async () => {
        setIsLoadingRewards(true);
        setIsLoadingQuests(true);
        setError(null);
        let fetchError = null; // Accumulate errors

        try {
            // Fetch rewards and quests in parallel
            const [rewardsRes, questsRes] = await Promise.all([
                fetchApi<XpRewardsData>('/xp', { isProtected: true }),
                fetchApi<Quest[]>('/quest', { isProtected: true }) // Fetch from /quest endpoint
            ]);

            // Process Rewards Data
            if (rewardsRes.data) {
                setRewardsData(rewardsRes.data);
            } else {
                fetchError = rewardsRes.error || "Failed to load rewards data.";
                setRewardsData(null); // Clear old data on error
            }

            // Process Quests Data
            if (questsRes.data) {
                setAllQuests(questsRes.data);
            } else {
                fetchError = fetchError ? `${fetchError}; ${questsRes.error || "Failed to load quests."}` : (questsRes.error || "Failed to load quests.");
                setAllQuests([]); // Clear old quests on error
            }

            if(fetchError) {
                setError(fetchError);
                toast.error(`Error loading data: ${fetchError}`);
            }

        } catch (err: any) {
            console.error("Error fetching rewards page data:", err);
            const errorMsg = "An unexpected error occurred loading data.";
            setError(errorMsg);
            toast.error(errorMsg);
            setRewardsData(null);
            setAllQuests([]);
        } finally {
             setIsLoadingRewards(false);
             setIsLoadingQuests(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handler for claiming a daily quest reward
    const handleClaimQuest = useCallback(async (questId: string) => {
        if (claimingQuestId) return; // Prevent multiple claims at once

        setClaimingQuestId(questId); // Set loading state for this specific quest
        let claimError = null;

        try {
            const response = await fetchApi<{ message: string, rewards: XpRewardsData }>(
                `/quest/${questId}/claim`,
                { method: 'POST', isProtected: true }
            );

            if (response.data) {
                toast.success(response.data.message || "Reward claimed!");
                // OPTION 1: Refetch everything to ensure consistency
                // fetchData();
                // OPTION 2: Update state locally for faster feedback
                setRewardsData(response.data.rewards); // Update currency display
                setAllQuests(prevQuests => prevQuests.map(q =>
                    q.id === questId ? { ...q, is_claimable: false, user_progress: { ...q.user_progress!, claimed_at: new Date().toISOString() } } : q
                ));

            } else {
                claimError = response.error || "Failed to claim reward.";
            }
        } catch (err) {
            console.error(`Error claiming quest ${questId}:`, err);
            claimError = "An unexpected error occurred while claiming.";
        } finally {
            setClaimingQuestId(null); // Clear loading state for this quest
            if (claimError) {
                toast.error(claimError);
            }
        }
    }, [claimingQuestId]); // Include claimingQuestId dependency

    // Handler for check-in completion
    const handleCheckinComplete = () => {
        // Refetch all data after check-in as it affects rewards and potentially quests
        fetchData();
    };

    // Filter quests for rendering
    const dailyQuests = allQuests.filter(q => q.type === 'daily');
    const monthlyQuest = allQuests.find(q => q.type === 'monthly') || null; // Assume only one monthly quest

    // Combined loading state
    const isLoading = isLoadingRewards || isLoadingQuests;

    const renderQuestsTab = () => (
        <div className={rewardStyles.questsTabContent}>
            {/* Render Currency Display first - it sticks */}
            <UserCurrencyDisplay rewardsData={rewardsData} />

            {isLoading ? (
                <div className={rewardStyles.loadingContainer}><LoadingSpinner /></div>
            ) : error ? (
                <p className={rewardStyles.errorText}>{error}</p>
            ) : (
                <>
                    {/* Wrap Checkin */}
                    <div>
                        <h3 className={rewardStyles.checkinTitle}>Daily Check-in</h3>
                        <DailyCheckin rewardsData={rewardsData} onCheckinComplete={handleCheckinComplete} />
                    </div>

                    {/* Layout Grid */}
                    <div className={rewardStyles.questsLayoutGrid}>
                        <DailyQuestsSection
                            quests={dailyQuests}
                            onClaimQuest={handleClaimQuest} // Pass claim handler
                            claimingQuestId={claimingQuestId} // Pass ID of quest being claimed
                        />
                        <div> {/* Wrapper for Monthly Reward */}
                            <MonthlyReward quest={monthlyQuest} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    const renderStoreTab = () => (
        <div>
            <h3 className={rewardStyles.questsTitle}>Store</h3>
            <p>Coming soon!</p>
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