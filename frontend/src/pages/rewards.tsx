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
import rewardStyles from '@/styles/Rewards.module.css'; // Use specific styles
import { toast } from 'react-toastify';

// --- Mock Data (Can be removed if API is reliable) ---
// const MOCK_DAILY_QUESTS: Quest[] = [ ... ];
// const MOCK_MONTHLY_QUEST: Quest = { ... };
// --- End Mock Data ---

const RewardsPage = () => {
    const [rewardsData, setRewardsData] = useState<XpRewardsData | null>(null);
    const [allQuests, setAllQuests] = useState<Quest[]>([]);
    // --- Combined loading state ---
    const [isLoading, setIsLoading] = useState(true);
    // --- Removed claimingQuestId state ---
    const [error, setError] = useState<string | null>(null);

    // Combined fetch function
    const fetchData = useCallback(async (showLoadingSpinner = true) => {
        // Use the main isLoading state if requested
        if (showLoadingSpinner) {
            setIsLoading(true);
        }
        setError(null); // Clear previous errors on fetch
        let fetchError = null;

        try {
            const [rewardsRes, questsRes] = await Promise.all([
                fetchApi<XpRewardsData>('/xp', { isProtected: true }),
                fetchApi<Quest[]>('/quest', { isProtected: true }) // Updated API path
            ]);

            if (rewardsRes.data) { setRewardsData(rewardsRes.data); }
            else { fetchError = rewardsRes.error || "Failed to load rewards data."; }

            if (questsRes.data) { setAllQuests(questsRes.data); }
            else { fetchError = fetchError ? `${fetchError}; ${questsRes.error || "Failed to load quests."}` : (questsRes.error || "Failed to load quests."); }

            if (fetchError) {
                setError(fetchError);
                toast.error(`Error loading data: ${fetchError}`);
                // Optionally clear data on error
                // setRewardsData(null);
                // setAllQuests([]);
            }

        } catch (err: any) {
            console.error("Error fetching rewards page data:", err);
            const errorMsg = "An unexpected error occurred loading data.";
            setError(errorMsg);
            toast.error(errorMsg);
            setRewardsData(null); // Clear data on major error
            setAllQuests([]);
        } finally {
            // Always turn off loading spinner after fetch attempt
            setIsLoading(false);
        }
    }, []); // No dependencies needed if it doesn't rely on changing props/state

    useEffect(() => {
        fetchData(); // Initial fetch
    }, [fetchData]); // Run effect when fetchData definition changes (usually only once)

    // Handler for claiming a daily quest reward - Uses main isLoading state
    const handleClaimQuest = useCallback(async (questId: string) => {
        // Prevent claiming if already loading/processing another action
        if (isLoading) return;

        setIsLoading(true); // <<< Use main loading state to show overlay
        let claimError = null;

        try {
            // Assuming API endpoint is /quests/{quest_id}/claim
            const response = await fetchApi<{ message: string, rewards: XpRewardsData }>(
                `/quest/${questId}/claim`, // Corrected endpoint path
                { method: 'POST', isProtected: true }
            );

            if (response.data) {
                toast.success(response.data.message || "Reward claimed!");
                // OPTION 1 (Simpler): Refetch all data after claim to ensure consistency
                await fetchData(false); // Refetch without showing spinner again immediately
                // OPTION 2 (Faster UI feedback): Update state locally (more complex)
                // setRewardsData(response.data.rewards);
                // setAllQuests(prevQuests => prevQuests.map(q =>
                //     q.id === questId ? { ...q, is_claimable: false, user_progress: { ...q.user_progress!, claimed_at: new Date().toISOString() } } : q
                // ));
            } else {
                claimError = response.error || "Failed to claim reward.";
            }
        } catch (err) {
            console.error(`Error claiming quest ${questId}:`, err);
            claimError = "An unexpected error occurred while claiming.";
        } finally {
            setIsLoading(false); // <<< Turn off main loading state
            if (claimError) {
                toast.error(claimError);
            }
        }
    }, [isLoading, fetchData]); // Depend on isLoading and fetchData

    // Handler for check-in completion
    const handleCheckinComplete = () => {
        // Refetch all data after check-in
        fetchData();
    };

    // Filter quests for rendering
    const dailyQuests = allQuests.filter(q => q.type === 'daily');
    const monthlyQuest = allQuests.find(q => q.type === 'monthly') || null;

    const renderQuestsTab = () => (
        // Outer container for content + potential overlay
        <div className={rewardStyles.questsTabContent}>
            {/* Loading Overlay */}
            {isLoading && (
                <div className={rewardStyles.loadingOverlay}>
                    <LoadingSpinner />
                </div>
            )}

            {/* Actual Content Container (Hidden visually while loading) */}
            {/* Added check for rewardsData being loaded before showing content */}
            <div style={{ visibility: isLoading ? 'hidden' : 'visible' }}>
                {error && !isLoading ? (
                    <p className={rewardStyles.errorText}>{error}</p>
                ) : rewardsData ? ( // Only render content if rewardsData is available
                    <>
                        <UserCurrencyDisplay rewardsData={rewardsData} />
                        <div> {/* Wrapper for Checkin */}
                            <h3 className={rewardStyles.checkinTitle}>Daily Check-in</h3>
                            <DailyCheckin rewardsData={rewardsData} onCheckinComplete={handleCheckinComplete} />
                        </div>
                        <div className={rewardStyles.questsLayoutGrid}>
                            <DailyQuestsSection
                                quests={dailyQuests}
                                onClaimQuest={handleClaimQuest}
                                // Removed claimingQuestId prop
                            />
                            <div> {/* Wrapper for Monthly Reward */}
                                <MonthlyReward quest={monthlyQuest} />
                            </div>
                        </div>
                    </>
                ) : (
                    // Optional: Placeholder or message if rewardsData is null but not loading/error
                     <p>No reward data available.</p>
                )
              }
            </div>
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