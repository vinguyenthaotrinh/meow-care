// src/pages/home.tsx
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout'; // User's path
import { fetchApi } from '@/lib/api'; // User's path
import { SleepHabit, SleepLog, HydrateLog, DietLog, TodoItem, /* UserStats, */ DietDish } from '@/types/habit.types'; // Removed UserStats if unused
import { XpRewardsData } from '@/types/rewards.types'; // **** IMPORT REWARDS TYPE ****
import LoadingSpinner from '@/components/common/LoadingSpinner'; // User's path
import styles from '@/styles/Home.module.css'; // User's path - USE THIS CSS MODULE
import TodoList from '@/components/home/TodoList'; // User's path
import DietUpdateModal from '@/components/home/DietUpdateModal'; // User's path
import HabitProgress from '@/components/home/HabitProgress'; // Import HabitProgress
import CatRoom from '@/components/home/CatRoom';           // Import CatRoom
import { IoClose } from "react-icons/io5"; // Close icon
import { toast } from 'react-toastify'; // Import toast for error handling

// --- Helper Functions (Keep as is) ---
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
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [xpRewards, setXpRewards] = useState<XpRewardsData | null>(null); // **** USE NEW STATE & TYPE ****
    const [sleepHabit, setSleepHabit] = useState<SleepHabit | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null); // General error state
    const [dietModalOpen, setDietModalOpen] = useState<string | null>(null);
    const [isTasksVisible, setIsTasksVisible] = useState(false);

    // Fetch Data Function
    const fetchData = useCallback(async () => {
        setError(null);
        setIsUpdating({});
        setIsLoading(true); // Ensure loading starts
        try {
            // **** Fetch all data concurrently ****
            const [sleepLogsRes, hydrateLogsRes, dietLogsRes, sleepHabitRes, xpRes] = await Promise.all([
                fetchApi<SleepLog[]>('/sleep/logs/today', { isProtected: true }),
                fetchApi<HydrateLog[]>('/hydrate/logs/today', { isProtected: true }),
                fetchApi<DietLog[]>('/diet/logs/today', { isProtected: true }),
                fetchApi<SleepHabit>('/sleep/habit', { isProtected: true }),
                fetchApi<XpRewardsData>('/xp', { isProtected: true }) // **** FETCH XP DATA ****
            ]);

            let combinedTodos: TodoItem[] = [];
            let apiErrors: string[] = []; // Collect specific errors

            // Process Log/Habit data (keep existing logic)
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

             combinedTodos.sort((a, b) => {
                 const getTime = (item: TodoItem) => item.type === 'sleep' && item.scheduled_time ? new Date(item.scheduled_time).getTime() : Infinity;
                 const timeA = getTime(a); const timeB = getTime(b);
                 if (timeA !== Infinity || timeB !== Infinity) return timeA - timeB;
                 const typeOrder = { 'sleep': 1, 'hydrate': 2, 'diet': 3 };
                 return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
             });
            setTodos(combinedTodos);

            // **** Process XP Rewards Data ****
            if (xpRes.data) {
                setXpRewards(xpRes.data);
            } else {
                // Handle error fetching XP data specifically
                const xpError = xpRes.error || "Failed to load user rewards.";
                apiErrors.push(`Rewards: ${xpError}`);
                toast.error(`Could not load rewards: ${xpError}`); // Show toast
            }

            // Set general error if any API failed
            if (apiErrors.length > 0) {
                setError(`Errors loading data: ${apiErrors.join('; ')}`);
            }

        } catch (err: any) {
            // Catch errors from Promise.all or other unexpected issues
            console.error("Failed to fetch dashboard data:", err);
            const generalError = err.message || "Failed to load dashboard data.";
            setError(generalError);
            toast.error(generalError); // Show general error toast
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- Action Handlers (Keep as is) ---
    const setItemLoading = (id: string, loading: boolean) => { setIsUpdating(prev => ({ ...prev, [id]: loading })); };
    const updateTodoInState = (updatedItem: TodoItem) => { setTodos(prevTodos => prevTodos.map(todo => todo.id === updatedItem.id ? updatedItem : todo)); };
    const handleCompleteSleep = async (logId: string) => {
        setItemLoading(logId, true); setError(null);
        const response = await fetchApi<SleepLog>(`/sleep/logs/${logId}/complete`, { method: 'PUT', isProtected: true });
        setItemLoading(logId, false);
        if (response.data) updateTodoInState({ ...response.data, type: 'sleep' });
        // Don't reset general error here, use toast for specific action errors
        else toast.error(response.error || 'Failed to complete task.');
    };
    const handleUpdateHydrate = async (logId: string) => {
        setItemLoading(logId, true); setError(null);
        const response = await fetchApi<HydrateLog>(`/hydrate/logs/${logId}/update`, { method: 'PUT', isProtected: true });
        setItemLoading(logId, false);
        if (response.data) updateTodoInState({ ...response.data, type: 'hydrate' });
        else toast.error(response.error || 'Failed to update water intake.');
    };
    const handleUpdateDiet = (logId: string): Promise<void> => {
        setDietModalOpen(logId);
        return Promise.resolve();
    };
    const handleCloseDietModal = () => { setDietModalOpen(null); };
    const handleFoodAddedToLog = useCallback((updatedLog: DietLog) => {
        updateTodoInState({ ...updatedLog, type: 'diet' });
        // Optionally refetch XP data if adding food gives coins/rewards
        // fetchRewardsData(); // Uncomment if needed
    }, [/* fetchRewardsData (add if uncommented) */]); // Add dependencies if used inside
    // --- End Action Handlers ---

    // Main component return
    return (
        <DashboardLayout>
             {isLoading ? (
                 <div className={styles.contentLoadingContainer}> <LoadingSpinner /> </div>
             ) : error && todos.length === 0 && !xpRewards ? ( // Show error only if essential data failed
                 <div className={styles.centered}> <p style={{ color: 'red' }}>{error}</p> </div>
             ) : (
                <div className={styles.mainLayoutGrid}>

                    {/* Column 1: Habit Progress */}
                    <HabitProgress
                        todos={todos}
                        sleepHabit={sleepHabit}
                        onTriggerClick={() => setIsTasksVisible(v => !v)}
                        isTasksVisible={isTasksVisible}
                    />

                    {/* Column 2: Cat Room - Pass fetched xpRewards */}
                    <CatRoom xpData={xpRewards} /> {/* **** PASS xpRewards **** */}

                     {/* Task List Popup */}
                     <div className={`${styles.tasksPopupContainer} ${isTasksVisible ? styles.visible : ''}`}>
                         <div className={styles.tasksPopupHeader}>
                             <button onClick={() => setIsTasksVisible(false)} className={styles.closeTasksButton} aria-label="Close tasks list"> <IoClose /> </button>
                         </div>
                         <div className={styles.todoListScrollable}>
                             <TodoList
                                 todos={todos}
                                 isUpdating={isUpdating}
                                 handleCompleteSleep={handleCompleteSleep}
                                 handleUpdateHydrate={handleUpdateHydrate}
                                 handleUpdateDiet={handleUpdateDiet}
                                 formatTime={formatTime}
                                 formatAmount={formatAmount}
                             />
                             {/* Display general fetch error inside popup if some todos loaded but other errors occurred */}
                             {error && todos.length > 0 && <p style={{ color: 'red', marginTop: '1rem', fontSize: '0.9rem', padding: '0 0.5rem' }}>{error}</p>}
                         </div>
                     </div>
                </div> // End mainLayoutGrid
            )}

            {/* Diet Modal */}
            {dietModalOpen && (
                <DietUpdateModal logId={dietModalOpen} isOpen={!!dietModalOpen} onClose={handleCloseDietModal} onFoodAdded={handleFoodAddedToLog} />
            )}
        </DashboardLayout>
    );
};

export default DashboardHomePage;