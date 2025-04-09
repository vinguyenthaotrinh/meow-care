import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchApi } from '../../lib/api';
import { SleepHabit, SleepLog, HydrateLog, DietLog, TodoItem, UserStats, DietDish } from '../../types/habit.types'; // Ensure DietDish is imported
import LoadingSpinner from '../../components/common/LoadingSpinner';
import styles from '../../styles/Dashboard.module.css';
import Image from 'next/image';
import catImageSrc from '../../assets/images/default-cat.png';
import HabitProgress from '../../components/dashboard/HabitProgress';
import TodoList from '../../components/dashboard/TodoList';
import DietUpdateModal from '@/components/dashboard/DietUpdateModal';

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
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [sleepHabit, setSleepHabit] = useState<SleepHabit | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Initial page load state
    const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({}); // For individual item updates
    const [error, setError] = useState<string | null>(null);
    const [dietModalOpen, setDietModalOpen] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        // Don't reset isLoading to true here if it's already true
        setError(null);
        setIsUpdating({});
        try {
            const [sleepLogsRes, hydrateLogsRes, dietLogsRes, sleepHabitRes /*, userStatsRes */] = await Promise.all([
                fetchApi<SleepLog[]>('/sleep/logs/today', { isProtected: true }),
                fetchApi<HydrateLog[]>('/hydrate/logs/today', { isProtected: true }),
                fetchApi<DietLog[]>('/diet/logs/today', { isProtected: true }),
                fetchApi<SleepHabit>('/sleep/habit', { isProtected: true }),
                Promise.resolve({ data: { xp: 100, level: 1, streak: 10 }, status: 200 }), // Fake data
            ]);

            let combinedTodos: TodoItem[] = [];
            let apiErrors: string[] = [];

            // Process responses...
            if (sleepLogsRes.data) combinedTodos = combinedTodos.concat(sleepLogsRes.data.map(log => ({ ...log, type: 'sleep' })));
            else if (sleepLogsRes.error && sleepLogsRes.status !== 404) apiErrors.push(`Sleep Logs: ${sleepLogsRes.error}`);
            if (sleepHabitRes.data) setSleepHabit(sleepHabitRes.data);
            else if (sleepHabitRes.error && sleepHabitRes.status !== 404) apiErrors.push(`Sleep Habit: ${sleepHabitRes.error}`);
            if (hydrateLogsRes.data && hydrateLogsRes.data.length > 0) combinedTodos.push({ ...hydrateLogsRes.data[0], type: 'hydrate' });
            else if (hydrateLogsRes.error && hydrateLogsRes.status !== 404) apiErrors.push(`Hydrate Logs: ${hydrateLogsRes.error}`);
            // Explicitly cast dishes to DietDish[] for DietLog
            if (dietLogsRes.data && dietLogsRes.data.length > 0) {
                 const dietLogData = dietLogsRes.data[0];
                 // Ensure dishes is an array, default to empty array if not present or null
                 const dishesArray: DietDish[] = Array.isArray(dietLogData.dishes) ? dietLogData.dishes : [];
                 combinedTodos.push({ ...dietLogData, dishes: dishesArray, type: 'diet' });
            } else if (dietLogsRes.error && dietLogsRes.status !== 404) {
                apiErrors.push(`Diet Logs: ${dietLogsRes.error}`);
            }


            // Sort todos...
             combinedTodos.sort((a, b) => {
                 const getTime = (item: TodoItem) => item.type === 'sleep' && item.scheduled_time ? new Date(item.scheduled_time).getTime() : Infinity;
                 const timeA = getTime(a); const timeB = getTime(b);
                 if (timeA !== Infinity || timeB !== Infinity) return timeA - timeB;
                 const typeOrder = { 'sleep': 1, 'hydrate': 2, 'diet': 3 };
                 return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
             });

            setTodos(combinedTodos);

            // Process User Stats...
            const userStatsRes = { data: { xp: 100, level: 1, streak: 10 } };
            if (userStatsRes.data) setUserStats(userStatsRes.data);

            if (apiErrors.length > 0) setError(`API Errors: ${apiErrors.join('; ')}`);

        } catch (err: any) {
            console.error("Failed to fetch dashboard data:", err);
            setError(err.message || "Failed to load dashboard data. Please try again.");
        } finally {
            setIsLoading(false); // Set loading false after fetch completes
        }
    }, []); // Keep dependency array empty for initial load

    useEffect(() => {
        // Fetch data only once on mount
        fetchData();
    }, [fetchData]);

    // --- Action Handlers ---
    const setItemLoading = (id: string, loading: boolean) => { setIsUpdating(prev => ({ ...prev, [id]: loading })); };
    const updateTodoInState = (updatedItem: TodoItem) => { setTodos(prevTodos => prevTodos.map(todo => todo.id === updatedItem.id ? updatedItem : todo)); };
    const handleCompleteSleep = async (logId: string) => {
        setItemLoading(logId, true); setError(null);
        const response = await fetchApi<SleepLog>(`/sleep/logs/${logId}/complete`, { method: 'PUT', isProtected: true });
        setItemLoading(logId, false);
        if (response.data) updateTodoInState({ ...response.data, type: 'sleep' });
        else setError(response.error || 'Failed to complete task.');
    };
    const handleUpdateHydrate = async (logId: string) => {
        setItemLoading(logId, true); setError(null);
        const response = await fetchApi<HydrateLog>(`/hydrate/logs/${logId}/update`, { method: 'PUT', isProtected: true });
        setItemLoading(logId, false);
        if (response.data) updateTodoInState({ ...response.data, type: 'hydrate' });
        else setError(response.error || 'Failed to update water intake.');
    };
    const handleUpdateDiet = (logId: string) => { setDietModalOpen(logId); };
    const handleCloseDietModal = () => { setDietModalOpen(null); };
    const handleFoodAddedToLog = useCallback((updatedLog: DietLog) => {
        // Ensure the updated log still has the 'type' property for TodoItem compatibility
        updateTodoInState({ ...updatedLog, type: 'diet' });
        // Optionally close modal and expand details (keep existing logic if needed)
        // handleCloseDietModal();
        // setExpandedDietLogId(updatedLog.id);
    }, [updateTodoInState]); // Correct dependency
    // --- End Action Handlers ---

    // --- Render Logic ---
    return (
        <DashboardLayout>
            {/* Main content area loading state */}
            {isLoading ? (
                <div className={styles.contentLoadingContainer}>
                    <LoadingSpinner />
                </div>
            ) : (
                <div className={styles.homeGrid}> {/* Removed contentDimmed class for simplicity, add back if needed */}
                    {/* --- Left Column --- */}
                    <div className={styles.leftColumn}>
                        {/* User Stats */}
                        <div className={styles.userStats}>
                             <h2 className={styles.sectionTitle}>Progress</h2>
                             {userStats ? (
                                <>
                                    <p className={styles.statItem}><span className={styles.statLabel}>XP:</span><span className={styles.statValue}>{userStats.xp}</span></p>
                                    <p className={styles.statItem}><span className={styles.statLabel}>Level:</span><span className={styles.statValue}>{userStats.level}</span></p>
                                    <p className={styles.statItem}><span className={styles.statLabel}>Streak 🔥:</span><span className={styles.statValue}>{userStats.streak} days</span></p>
                                </>
                             ) : <p>Could not load user stats.</p>}
                        </div>

                        {/* Habit Icons */}
                        <div className={styles.habitIconsContainer}>
                            <HabitProgress todos={todos} sleepHabit={sleepHabit} isLoading={false} />
                        </div>

                        {/* Cat Image */}
                        <div className={styles.catContainer}>
                             <h2 className={styles.sectionTitle} style={{ marginBottom: '0.5rem' }}>Your Companion</h2>
                            <Image src={catImageSrc} alt="User's companion cat" width={150} height={150} priority style={{ objectFit: 'contain' }}/>
                        </div>
                    </div>

                    {/* --- Right Column --- */}
                    <div className={styles.rightColumn}>
                        <h2 className={styles.sectionTitle}>Today's Tasks</h2>
                        {/* Todo List */}
                        <TodoList
                            todos={todos}
                            isUpdating={isUpdating}
                            setItemLoading={setItemLoading} // Pass if TodoList needs it
                            setError={setError} // Pass if TodoList needs it
                            handleCompleteSleep={handleCompleteSleep}
                            handleUpdateHydrate={handleUpdateHydrate}
                            handleUpdateDiet={handleUpdateDiet} // This opens the modal
                            formatTime={formatTime}
                            formatAmount={formatAmount}
                            updateTodoInState={updateTodoInState}
                        />
                        {/* Display API error at the bottom if occurred during fetch */}
                        {error && <p style={{ color: 'red', marginTop: '1rem', fontSize: '0.9rem' }}>API Error: {error}</p>}
                    </div>
                </div>
            )}

            {/* Diet Modal - Render outside the loading check */}
            {dietModalOpen && (
                <DietUpdateModal
                    logId={dietModalOpen}
                    isOpen={!!dietModalOpen}
                    onClose={handleCloseDietModal}
                    onFoodAdded={handleFoodAddedToLog} // Pass the correct callback
                />
            )}
        </DashboardLayout>
    );
};

export default DashboardHomePage;