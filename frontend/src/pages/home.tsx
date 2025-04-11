// src/pages/home.tsx
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout'; // User's path
import { fetchApi } from '@/lib/api'; // User's path
import { SleepHabit, SleepLog, HydrateLog, DietLog, TodoItem, UserStats, DietDish } from '@/types/habit.types'; // User's path
import LoadingSpinner from '@/components/common/LoadingSpinner'; // User's path
import styles from '@/styles/Home.module.css'; // User's path - USE THIS CSS MODULE
import TodoList from '@/components/home/TodoList'; // User's path
import DietUpdateModal from '@/components/home/DietUpdateModal'; // User's path
import HabitProgress from '@/components/home/HabitProgress'; // Import HabitProgress
import CatRoom from '@/components/home/CatRoom';           // **** IMPORT NEW COMPONENT ****
import { IoClose } from "react-icons/io5"; // Close icon


// --- Helper Functions (Can be removed if moved to utils, otherwise keep) ---
const formatTime = (timeString: string | null | undefined): string => {
    // ... (implementation as before)
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
    // ... (implementation as before)
     if (amount === null || amount === undefined) return `? ${unit}`;
    const roundedAmount = Number.isInteger(amount) ? amount : amount.toFixed(1);
    return `${roundedAmount} ${unit}`;
};

const calculatePercentage = (consumed: number | undefined, goal: number | undefined): number => {
    // ... (implementation as before)
    if (goal === null || goal === undefined || consumed === null || consumed === undefined || goal <= 0) return 0;
    const percentage = (consumed / goal) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Keep within 0-100
};
// --- End Helper Functions ---

const DashboardHomePage = () => {
    // Keep state exactly as provided by user
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [sleepHabit, setSleepHabit] = useState<SleepHabit | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);
    const [dietModalOpen, setDietModalOpen] = useState<string | null>(null);
    const [isTasksVisible, setIsTasksVisible] = useState(false);

    // Keep fetchData exactly as provided by user
    const fetchData = useCallback(async () => {
        setError(null);
        setIsUpdating({});
        setIsLoading(true);
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

            const userStatsRes = { data: { xp: 100, level: 1, streak: 10 } };
            if (userStatsRes.data) setUserStats(userStatsRes.data);
            if (apiErrors.length > 0) setError(`API Errors: ${apiErrors.join('; ')}`);
        } catch (err: any) {
            console.error("Failed to fetch dashboard data:", err);
            setError(err.message || "Failed to load dashboard data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

     // Keep useEffect exactly as provided by user
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Keep Action Handlers exactly as provided by user ---
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
    const handleUpdateDiet = (logId: string): Promise<void> => {
        setDietModalOpen(logId);
        return Promise.resolve();
    };
    const handleCloseDietModal = () => { setDietModalOpen(null); };
    const handleFoodAddedToLog = useCallback((updatedLog: DietLog) => {
        updateTodoInState({ ...updatedLog, type: 'diet' });
    }, []);
    // --- End Action Handlers ---

    // --- REMOVED renderSingleHabitIcon function ---

    // Main component return
    return (
        <DashboardLayout>
             {isLoading ? (
                 <div className={styles.contentLoadingContainer}> <LoadingSpinner /> </div>
             ) : error && todos.length === 0 ? (
                 <div className={styles.centered}> <p style={{ color: 'red' }}>Error loading data: {error}</p> </div>
             ) : (
                <div className={styles.mainLayoutGrid}>

                    {/* Column 1: Habit Progress Component */}
                    <HabitProgress
                        todos={todos}
                        sleepHabit={sleepHabit}
                        onTriggerClick={() => setIsTasksVisible(v => !v)}
                        isTasksVisible={isTasksVisible}
                    />

                    {/* Column 2: Cat Room Component */}
                    <CatRoom userStats={userStats} />

                     {/* Task List Popup */}
                     <div className={`${styles.tasksPopupContainer} ${isTasksVisible ? styles.visible : ''}`}>
                         <div className={styles.tasksPopupHeader}>
                             {/* <h2 className={styles.sectionTitle} style={{ marginBottom: 0, border: 'none' }}>Daily Tasks</h2> */}
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
                                        formatAmount={formatAmount} updateTodoInState={function (updatedItem: TodoItem): void {
                                            throw new Error('Function not implemented.');
                                        } }                                        // Removed updateTodoInState prop from here as well
                             />
                              {error && todos.length > 0 && <p style={{ color: 'red', marginTop: '1rem', fontSize: '0.9rem', padding: '0 0.5rem' }}>API Error: {error}</p>}
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