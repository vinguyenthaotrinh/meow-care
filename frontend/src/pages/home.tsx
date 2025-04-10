// src/pages/home.tsx
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout'; // User's path
import { fetchApi } from '@/lib/api'; // User's path
import { SleepHabit, SleepLog, HydrateLog, DietLog, TodoItem, UserStats, DietDish } from '@/types/habit.types'; // User's path
import LoadingSpinner from '@/components/common/LoadingSpinner'; // User's path
import styles from '@/styles/Home.module.css'; // User's path - USE THIS CSS MODULE
import Image from 'next/image';
import catImageSrc from '@/assets/images/default-cat.png'; // User's path
import backgroundImageSrc from '@/assets/images/background.jpg'; // User's path
import TodoList from '@/components/home/TodoList'; // User's path
import DietUpdateModal from '@/components/home/DietUpdateModal'; // User's path
import { BsListTask } from "react-icons/bs"; // Task list icon (Removed, using FaTasks now)
import { IoClose } from "react-icons/io5"; // Close icon
import { FaBed, FaSun, FaUtensils, FaBrain, FaTasks } from 'react-icons/fa'; // Example icons
import { FaGlassWater } from 'react-icons/fa6'; // Water icon from FA6 or FaGlasses

// --- Helper Functions (Exactly as provided by user) ---
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
    // Keep state exactly as provided by user
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [sleepHabit, setSleepHabit] = useState<SleepHabit | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);
    const [dietModalOpen, setDietModalOpen] = useState<string | null>(null);

    // --- State for Task Popup Visibility ---
    const [isTasksVisible, setIsTasksVisible] = useState(false);
    // ---

    // Keep fetchData exactly as provided by user
    const fetchData = useCallback(async () => {
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

            // Process responses... (Keep user's logic)
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
            } else if (dietLogsRes.error && dietLogsRes.status !== 404) {
                apiErrors.push(`Diet Logs: ${dietLogsRes.error}`);
            }

            // Sort todos... (Keep user's logic)
             combinedTodos.sort((a, b) => {
                 const getTime = (item: TodoItem) => item.type === 'sleep' && item.scheduled_time ? new Date(item.scheduled_time).getTime() : Infinity;
                 const timeA = getTime(a); const timeB = getTime(b);
                 if (timeA !== Infinity || timeB !== Infinity) return timeA - timeB;
                 const typeOrder = { 'sleep': 1, 'hydrate': 2, 'diet': 3 };
                 return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
             });

            setTodos(combinedTodos);

            // Process User Stats... (Keep user's logic)
            const userStatsRes = { data: { xp: 100, level: 1, streak: 10 } };
            if (userStatsRes.data) setUserStats(userStatsRes.data);

            if (apiErrors.length > 0) setError(`API Errors: ${apiErrors.join('; ')}`);

        } catch (err: any) {
            console.error("Failed to fetch dashboard data:", err);
            setError(err.message || "Failed to load dashboard data. Please try again.");
        } finally {
            setIsLoading(false); // Set loading false after fetch completes
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
    }, []); // Keep original empty dependency array
    // --- End Action Handlers ---


    // --- Render Logic for Individual Habit Icons ---
    const renderSingleHabitIcon = (type: 'wakeup' | 'sleep' | 'hydrate' | 'diet' | 'focus' | 'trigger') => {
        const todaySleepLogs = todos.filter(t => t.type === 'sleep') as SleepLog[];
        const todayHydrateLog = todos.find(t => t.type === 'hydrate') as HydrateLog | undefined;
        const todayDietLog = todos.find(t => t.type === 'diet') as DietLog | undefined;
        const wakeUpLog = todaySleepLogs.find(log => log.task_type === 'wakeup');
        const sleepLog = todaySleepLogs.find(log => log.task_type === 'sleep');

        const getIconBackgroundStyle = (item: HydrateLog | DietLog | undefined, habitType: 'hydrate' | 'diet'): React.CSSProperties => {
            if (!item) return {};
            const consumed = habitType === 'hydrate' ? item.consumed_water : item.consumed_calories;
            const goal = habitType === 'hydrate' ? item.water_goal : item.calories_goal;
            const percentage = calculatePercentage(consumed, goal);
            const progressColor = habitType === 'hydrate' ? 'var(--hydrate-progress-color)' : 'var(--diet-progress-color)';
            return { background: `linear-gradient(to top, ${progressColor} ${percentage}%, var(--icon-background-default) ${percentage}%)` };
        };

        const completedClass = (log: SleepLog | HydrateLog | DietLog | undefined): string => log?.completed ? styles.completed : '';

        // --- Trigger Button (6th Icon) ---
        if (type === 'trigger') {
            return (
                 // Use a button for semantics, but style it to remove default appearance
                 <button
                    className={`${styles.habitIconWrapper} ${styles.taskTriggerButton}`}
                    onClick={() => setIsTasksVisible(true)}
                    aria-label="Show daily tasks"
                 >
                    <div className={`${styles.iconCircle}`}> {/* Standard circle */}
                        <span className={styles.iconSymbol}><FaTasks /></span> {/* Task list icon */}
                    </div>
                    <span className={styles.habitText}>
                       Daily Tasks
                    </span>
                </button>
            );
        }

        // --- Other Icons ---
        let icon: React.ReactNode;
        let textLine1: string = '';
        let textLine2: string = '';
        let circleStyle: React.CSSProperties = {};
        let circleClasses = `${styles.iconCircle}`;
        let wrapperClasses = `${styles.habitIconWrapper}`;

        switch (type) {
            case 'wakeup':
                icon = <FaSun />; textLine1 = 'Wake-up';
                textLine2 = sleepHabit ? formatTime(sleepHabit.wakeup_time) : 'N/A';
                if (wakeUpLog?.completed) { textLine2 += ' ✓'; circleClasses += ` ${styles.wakeup} ${styles.completed}`; wrapperClasses += ` ${styles.completed}`; }
                else { circleClasses += ` ${styles.wakeup}`; }
                break;
            case 'sleep':
                icon = <FaBed />; textLine1 = 'Sleep';
                textLine2 = sleepHabit ? formatTime(sleepHabit.sleep_time) : 'N/A';
                if (sleepLog?.completed) { textLine2 += ' ✓'; circleClasses += ` ${styles.sleep} ${styles.completed}`; wrapperClasses += ` ${styles.completed}`; }
                else { circleClasses += ` ${styles.sleep}`; }
                break;
            case 'hydrate':
                icon = <FaGlassWater />; textLine1 = 'Hydration';
                textLine2 = `${formatAmount(todayHydrateLog?.consumed_water, 'ml')} / ${formatAmount(todayHydrateLog?.water_goal, 'ml')}`;
                 if (todayHydrateLog?.completed) textLine2 += ' ✓';
                circleStyle = getIconBackgroundStyle(todayHydrateLog, 'hydrate');
                wrapperClasses += ` ${completedClass(todayHydrateLog)}`;
                break;
            case 'diet':
                icon = <FaUtensils />; textLine1 = 'Diet';
                textLine2 = `${formatAmount(todayDietLog?.consumed_calories, 'kcal')} / ${formatAmount(todayDietLog?.calories_goal, 'kcal')}`;
                if (todayDietLog?.completed) textLine2 += ' ✓';
                circleStyle = getIconBackgroundStyle(todayDietLog, 'diet');
                wrapperClasses += ` ${completedClass(todayDietLog)}`;
                break;
            case 'focus': // Mock Data for Focus
                icon = <FaBrain />; textLine1 = 'Focus';
                textLine2 = '30 min / 100 min'; // Mock data
                // wrapperClasses += ` ${styles.completed}`; // Optional: Add completed style
                // circleClasses += ` ${styles.focus} ${styles.completed}`; // Optional: Add completed style
                break;
        }

        return (
             <div className={wrapperClasses}>
                <div className={circleClasses} style={circleStyle}>
                    <span className={styles.iconSymbol}>{icon}</span>
                </div>
                <span className={styles.habitText}>
                    {textLine1}<br />
                    <span className={styles.habitProgressText}>{textLine2}</span>
                </span>
            </div>
        );
    };
    // --- End Render Logic for Icons ---


    // Main component return
    return (
        <DashboardLayout>
             {/* Use main content area loading */}
            {isLoading ? (
                 <div className={styles.contentLoadingContainer}>
                    <LoadingSpinner />
                 </div>
             ) : error && todos.length === 0 ? (
                 <div className={styles.centered}>
                    <p style={{ color: 'red' }}>Error loading data: {error}</p>
                 </div>
             ) : (
                // --- Main Layout Grid ---
                <div className={styles.mainLayoutGrid}>

                    {/* Column 1: Habit Icons (NEW 3x2 Grid Structure) */}
                    <div className={styles.habitColumnGrid}>
                        <div className={styles.habitRow}>
                            {renderSingleHabitIcon('wakeup')}
                            {renderSingleHabitIcon('sleep')}
                        </div>
                        <div className={styles.habitRow}>
                            {renderSingleHabitIcon('hydrate')}
                            {renderSingleHabitIcon('diet')}
                        </div>
                        <div className={styles.habitRow}>
                            {renderSingleHabitIcon('focus')}
                            {renderSingleHabitIcon('trigger')} {/* The button */}
                        </div>
                    </div>

                    {/* Column 2: Cat's Room with Background */}
                    <div className={styles.catRoom}>
                        {/* Background Image using Next/Image */}
                         <Image
                             src={backgroundImageSrc}
                             alt="Cat room background"
                             layout="fill" // Fill the container
                             objectFit="cover" // Stretch/crop to cover
                             className={styles.catRoomBackground} // Optional class for styling/opacity
                             priority // Load image sooner
                         />
                         {/* Cat Image positioned on top */}
                        <Image
                            src={catImageSrc}
                            alt="User's companion cat"
                            width={180} // Adjust cat size if needed
                            height={180}
                            className={styles.catImage} // Class to position the cat
                            style={{ objectFit: 'contain' }}
                        />
                    </div>

                    {/* Column 3: Progress Info */}
                    <div className={styles.progressInfo}>
                        <h2 className={styles.sectionTitle}>Progress</h2>
                        {userStats ? (
                            <>
                                <p className={styles.statItem}><span className={styles.statLabel}>XP:</span><span className={styles.statValue}>{userStats.xp}</span></p>
                                <p className={styles.statItem}><span className={styles.statLabel}>Level:</span><span className={styles.statValue}>{userStats.level}</span></p>
                                <p className={styles.statItem}><span className={styles.statLabel}>Streak 🔥:</span><span className={styles.statValue}>{userStats.streak} days</span></p>
                            </>
                        ) : <p>Could not load stats.</p>}
                    </div>

                     {/* --- Task List Popup (Positioned Absolutely relative to grid) --- */}
                     <div className={`${styles.tasksPopupContainer} ${isTasksVisible ? styles.visible : ''}`}>
                         <div className={styles.tasksPopupHeader}>
                             <h2 className={styles.sectionTitle} style={{ marginBottom: 0, border: 'none' }}>Daily Tasks</h2>
                             <button onClick={() => setIsTasksVisible(false)} className={styles.closeTasksButton} aria-label="Close tasks list">
                                 <IoClose />
                             </button>
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
                                 updateTodoInState={updateTodoInState}
                             />
                              {error && todos.length > 0 && <p style={{ color: 'red', marginTop: '1rem', fontSize: '0.9rem', padding: '0 0.5rem' }}>API Error: {error}</p>}
                         </div>
                     </div>

                </div> // End mainLayoutGrid
            )}

            {/* --- Keep Diet Modal Logic (Render outside main grid) --- */}
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