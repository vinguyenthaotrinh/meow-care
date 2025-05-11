// src/pages/home.tsx
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { fetchApi } from '@/lib/api';
import { SleepHabit, SleepLog, HydrateLog, DietLog, TodoItem, DietDish, FocusHabit, FocusLog } from '@/types/habit.types';
import { XpRewardsData } from '@/types/rewards.types'; // Import reward type
import LoadingSpinner from '@/components/common/LoadingSpinner';
import styles from '@/styles/Home.module.css';
// Removed TodoList import
import DietUpdateModal from '@/components/home/DietUpdateModal';
import HabitProgress from '@/components/home/HabitProgress';
import CatRoom from '@/components/home/CatRoom';
import FocusTimer from '@/components/home/FocusTimer'; // **** IMPORT FOCUS TIMER ****
// Removed IoClose import
import { toast } from 'react-toastify';

// --- Helper Functions ---
const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return "N/A";
    try {
        if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
            const [hours, minutes] = timeString.split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
        const date = new Date(timeString);
        if (isNaN(date.getTime())) return "Invalid Time";
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
        console.error("Error formatting time:", timeString, e);
        return "Error";
    }
};
const formatAmount = (amount: number | null | undefined, unit: string): string => {
     if (amount === null || amount === undefined) return `? ${unit}`;
    const roundedAmount = Number.isInteger(amount) ? amount : amount.toFixed(1);
    return `${roundedAmount} ${unit}`;
};
const calculatePercentage = (consumed: number | undefined, goal: number | undefined): number => {
    if (goal === null || goal === undefined || consumed === null || consumed === undefined || goal <= 0) return 0;
    const percentage = (consumed / goal) * 100;
    return Math.min(Math.max(percentage, 0), 100);
};
// --- End Helper Functions ---

const DashboardHomePage = () => {
    // State

    // State
    const [todos, setTodos] = useState<TodoItem[]>([]); // Keep todos to pass data to HabitProgress
    const [xpRewards, setXpRewards] = useState<XpRewardsData | null>(null); // Keep for CatRoom stats
    const [sleepHabit, setSleepHabit] = useState<SleepHabit | null>(null); // Keep for HabitProgress
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({}); // Keep for icon loading state
    const [error, setError] = useState<string | null>(null); // General error state
    const [dietModalOpen, setDietModalOpen] = useState<string | null>(null); // Keep for Diet modal
    // Removed isTasksVisible state
    const [focusHabit, setFocusHabit] = useState<FocusHabit | null>(null); // **** NEW STATE ****
    const [todayFocusLog, setTodayFocusLog] = useState<FocusLog | null>(null); // **** NEW STATE ****
    // Removed isTasksVisible

    // --- State to toggle between CatRoom and FocusTimer ---
    const [showFocusTimer, setShowFocusTimer] = useState(false);
    // ---

    // Fetch Data Function
    const fetchData = useCallback(async () => {
        setError(null);
        setIsUpdating({});
        setIsLoading(true);
        try {
            const [sleepLogsRes, hydrateLogsRes, dietLogsRes, sleepHabitRes, focusHabitRes, todayFocusLogRes, xpRes] = await Promise.all([
                fetchApi<SleepLog[]>('/sleep/logs/today', { isProtected: true }),
                fetchApi<HydrateLog[]>('/hydrate/logs/today', { isProtected: true }),
                fetchApi<DietLog[]>('/diet/logs/today', { isProtected: true }),
                fetchApi<SleepHabit>('/sleep/habit', { isProtected: true }),
                fetchApi<FocusHabit>('/focus/habit', { isProtected: true }),      // **** FETCH FOCUS HABIT ****
                fetchApi<FocusLog[]>('/focus/logs/today', { isProtected: true }), // **** FETCH TODAY'S FOCUS LOG ****
                fetchApi<XpRewardsData>('/xp', { isProtected: true })
            ]);

            let combinedTodos: TodoItem[] = [];
            let apiErrors: string[] = [];

            // Process Log/Habit data
            if (sleepLogsRes.data) combinedTodos = combinedTodos.concat(sleepLogsRes.data.map(log => ({ ...log, type: 'sleep' })));
            else if (sleepLogsRes.error && sleepLogsRes.status !== 404) apiErrors.push(`Sleep Logs: ${sleepLogsRes.error}`);

            if (sleepHabitRes.data) setSleepHabit(sleepHabitRes.data);
            else if (sleepHabitRes.error && sleepHabitRes.status !== 404) apiErrors.push(`Sleep Habit: ${sleepHabitRes.error}`);

            if (hydrateLogsRes.data && hydrateLogsRes.data.length > 0) combinedTodos.push({ ...hydrateLogsRes.data[0], type: 'hydrate' });
            else if (hydrateLogsRes.error && hydrateLogsRes.status !== 404) apiErrors.push(`Hydrate Logs: ${hydrateLogsRes.error}`);

            if (dietLogsRes.data && dietLogsRes.data.length > 0) {
                 const dietLogData = dietLogsRes.data[0];
                 const dishesArray: DietDish[] = Array.isArray(dietLogData.dishes) ? dietLogData.dishes : [];
                 combinedTodos.push({ ...dietLogData, dishes: dishesArray, type: 'diet' });
            } else if (dietLogsRes.error && dietLogsRes.status !== 404) apiErrors.push(`Diet Logs: ${dietLogsRes.error}`);

            // Set Focus Data
            if (focusHabitRes.data) setFocusHabit(focusHabitRes.data);
            else if (focusHabitRes.error && focusHabitRes.status !== 404) apiErrors.push(`Focus Habit: ${focusHabitRes.error}`);
            if (todayFocusLogRes.data && todayFocusLogRes.data.length > 0) setTodayFocusLog(todayFocusLogRes.data[0]);
            else if (todayFocusLogRes.error && todayFocusLogRes.status !== 404) { /* No log today is fine */ }

            // Sort combinedTodos if needed (optional based on HabitProgress need)
            combinedTodos.sort((a, b) => { 
                /* ... sort logic ... */
                return 0; // Default to equal if no specific logic implemented
            });
            setTodos(combinedTodos);

            // Process XP Rewards Data
            if (xpRes.data) { setXpRewards(xpRes.data); }
            else {
                const xpError = xpRes.error || "Failed to load user rewards.";
                apiErrors.push(`Rewards: ${xpError}`);
                toast.error(`Could not load rewards: ${xpError}`);
            }

            if (apiErrors.length > 0) { setError(`Errors loading data: ${apiErrors.join('; ')}`); }

        } catch (err: any) {
            console.error("Failed to fetch dashboard data:", err);
            const generalError = err.message || "Failed to load dashboard data.";
            setError(generalError);
            toast.error(generalError);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- Action Handlers ---
    const setItemLoading = (id: string, loading: boolean) => { setIsUpdating(prev => ({ ...prev, [id]: loading })); };

    // Modified to handle state update AND potentially refetch rewards
    const updateStateAndRefetchRewards = useCallback(async (updatedItem: TodoItem, actionType: 'sleep' | 'hydrate' | 'diet') => {
        // Update the 'todos' state first for immediate UI feedback
        setTodos(prevTodos => prevTodos.map(todo => {
            if (todo.type === 'sleep' && updatedItem.type === 'sleep' && todo.id === updatedItem.id) { return updatedItem; }
            if (todo.type === updatedItem.type && todo.type !== 'sleep') { return updatedItem; }
            return todo;
        }));

        // Optionally, refetch rewards data if the action might have granted coins/diamonds
        // Example: Only refetch after completing sleep/hydrate tasks
        if (actionType === 'sleep' || actionType === 'hydrate') {
            try {
                console.log(`Refetching rewards after ${actionType} update...`);
                const xpRes = await fetchApi<XpRewardsData>('/xp', { isProtected: true });
                if (xpRes.data) {
                    setXpRewards(xpRes.data);
                } else {
                    toast.warn("Could not refresh rewards data after action.");
                }
            } catch (e) {
                 toast.warn("Error refreshing rewards data.");
                 console.error("Error refetching rewards:", e);
            }
        }
    }, []); // No dependencies needed if fetchApi is stable

    const handleCompleteSleep = useCallback(async (logId: string) => {
        setItemLoading(logId, true);
        // Don't reset general error here
        const response = await fetchApi<SleepLog>(`/sleep/logs/${logId}/complete`, { method: 'PUT', isProtected: true });
        setItemLoading(logId, false);
        if (response.data) {
            updateStateAndRefetchRewards({ ...response.data, type: 'sleep' }, 'sleep'); // Update state & refetch rewards
        } else {
            toast.error(response.error || 'Failed to complete sleep task.');
        }
    }, [updateStateAndRefetchRewards]); // Add dependency

    const handleUpdateHydrate = useCallback(async (logId: string) => {
        setItemLoading(logId, true);
        const response = await fetchApi<HydrateLog>(`/hydrate/logs/${logId}/update`, { method: 'PUT', isProtected: true });
        setItemLoading(logId, false);
        if (response.data) {
            updateStateAndRefetchRewards({ ...response.data, type: 'hydrate' }, 'hydrate'); // Update state & refetch rewards
        } else {
            toast.error(response.error || 'Failed to update water intake.');
        }
    }, [updateStateAndRefetchRewards]); // Add dependency

    // Opens the modal
    const handleOpenDietModal = useCallback(async (logId: string) => {
        setDietModalOpen(logId);
        return Promise.resolve();
    }, []);

    const handleCloseDietModal = () => { setDietModalOpen(null); };

    // Updates state after food is added via modal
    const handleFoodAddedToLog = useCallback((updatedLog: DietLog) => {
         updateStateAndRefetchRewards({ ...updatedLog, type: 'diet' }, 'diet'); // Update state, maybe refetch rewards if logging food gives xp
    }, [updateStateAndRefetchRewards]); // Add dependency

    // --- NEW: Handler for Focus Session Completion ---
    const handleFocusSessionComplete = async (minutesCompleted: number, logId: string) => {
        if (!logId) {
            toast.error("Focus session log ID is missing.");
            return;
        }
        setItemLoading(logId, true); // Use logId for loading state if needed
        try {
            const response = await fetchApi<FocusLog>(`/focus/logs/${logId}/update`, {
                method: 'PUT',
                isProtected: true,
                body: { minutes: minutesCompleted },
            });
            if (response.data) {
                toast.success(`Focus session of ${minutesCompleted} min saved!`);
                setTodayFocusLog(response.data); // Update today's focus log
                // Optionally refetch all data or just userStats if rewards change
                fetchData(); // Or a more targeted fetch if preferred
            } else {
                toast.error(response.error || "Failed to save focus session.");
            }
        } catch (err) {
            toast.error("An error occurred while saving the focus session.");
            console.error("Error saving focus session:", err);
        } finally {
            setItemLoading(logId, false);
        }
    };
    // --- End Action Handlers ---

    // Main component return
    return (
        <DashboardLayout>
             {isLoading ? (
                 <div className={styles.contentLoadingContainer}> <LoadingSpinner /> </div>
             ) : error && todos.length === 0 && !xpRewards ? ( // Check essential data
                 <div className={styles.centered}> <p style={{ color: 'red' }}>{error}</p> </div>
             ) : (
                <div className={styles.mainLayoutGrid}>

                    {/* Column 1: Habit Progress */}
                    <HabitProgress
                        todos={todos}
                        sleepHabit={sleepHabit}
                        focusHabit={focusHabit}     // **** PASS FOCUS HABIT ****
                        todayFocusLog={todayFocusLog} // **** PASS TODAY'S FOCUS LOG ****
                        isUpdating={isUpdating}
                        onCompleteSleep={handleCompleteSleep}
                        onUpdateHydrate={handleUpdateHydrate}
                        onUpdateDiet={handleOpenDietModal} // Pass the function to open modal
                        onToggleFocusView={() => setShowFocusTimer(prev => !prev)} // **** PASS TOGGLE HANDLER ****
                    />

                    {/* Column 2: Cat Room */}
                    {/* **** Conditional Rendering for CatRoom / FocusTimer **** */}
                    {showFocusTimer ? (
                        <FocusTimer
                            focusHabit={focusHabit}
                            todayFocusLog={todayFocusLog}
                            onFocusSessionComplete={handleFocusSessionComplete}
                            // You can set initialFocusDuration from focusHabit?.focus_goal if needed,
                            // or let FocusTimer handle its default.
                        />
                    ) : (
                        <CatRoom xpData={xpRewards} />
                    )}
                    {/* **** End Conditional Rendering **** */}

                </div> // End mainLayoutGrid
            )}

            {/* Diet Modal */}
            {dietModalOpen && (
                <DietUpdateModal
                    logId={dietModalOpen}
                    isOpen={!!dietModalOpen}
                    onClose={handleCloseDietModal}
                    onFoodAdded={handleFoodAddedToLog}
                />
            )}
        </DashboardLayout>
    );
};

export default DashboardHomePage;

function setXpRewards(data: XpRewardsData) {
    throw new Error('Function not implemented.');
}
