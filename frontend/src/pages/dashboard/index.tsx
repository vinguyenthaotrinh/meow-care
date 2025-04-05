// src/pages/dashboard/index.tsx
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchApi } from '../../lib/api';
import { SleepHabit, SleepLog, HydrateLog, DietLog, TodoItem, UserStats, HydrateHabit, DietHabit } from '../../types/habit.types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import styles from '../../styles/Dashboard.module.css';
import Image from 'next/image';
import catImageSrc from '../../assets/images/default-cat.png';

// --- Helper Functions ---
const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return "N/A";
    try {
        // Nếu backend trả về "HH:MM:SS"
        if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
            const [hours, minutes] = timeString.split(':');
            // Tạo date giả để dùng toLocaleTimeString
            const date = new Date();
            date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
        // Nếu backend trả về ISO String
        const date = new Date(timeString);
        if (isNaN(date.getTime())) return "Invalid Time"; // Kiểm tra date hợp lệ
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
        console.error("Error formatting time:", timeString, e);
        return "Error";
    }
};

const formatAmount = (amount: number | null | undefined, unit: string): string => {
    if (amount === null || amount === undefined) return `? ${unit}`;
    // Làm tròn đến 1 chữ số thập phân nếu là float, không làm tròn nếu là int
    const roundedAmount = Number.isInteger(amount) ? amount : amount.toFixed(1);
    return `${roundedAmount} ${unit}`;
}

const calculatePercentage = (consumed: number | undefined, goal: number | undefined): number => {
    if (goal === null || goal === undefined || consumed === null || consumed === undefined || goal <= 0) {
        return 0;
    }
    const percentage = (consumed / goal) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Giữ trong khoảng 0-100
};


const DashboardHomePage = () => {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [sleepHabit, setSleepHabit] = useState<SleepHabit | null>(null); // Cần để lấy giờ mục tiêu hiển thị icon
    // Không cần state riêng cho hydrate/diet habit vì log đã có goal
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({}); // State loading cho từng item
    const [error, setError] = useState<string | null>(null);

    // Hàm fetch data dùng useCallback để tránh tạo lại mỗi lần render
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setIsUpdating({}); // Reset loading item
        try {
            const [sleepLogsRes, hydrateLogsRes, dietLogsRes, sleepHabitRes /*, userStatsRes */] = await Promise.all([
                fetchApi<SleepLog[]>('/sleep/logs/today', { isProtected: true }),
                fetchApi<HydrateLog[]>('/hydrate/logs/today', { isProtected: true }),
                fetchApi<DietLog[]>('/diet/logs/today', { isProtected: true }),
                fetchApi<SleepHabit>('/sleep/habit', { isProtected: true }), // Lấy giờ ngủ/dậy mục tiêu
                // --- TODO: Add API call for User Stats ---
                Promise.resolve({ data: { xp: 100, level: 1, streak: 10 }, status: 200 }), // Fake data for now
            ]);

            let combinedTodos: TodoItem[] = [];
            let apiErrors: string[] = []; // Thu thập các lỗi

            // Process Sleep
            if (sleepLogsRes.data) {
                combinedTodos = combinedTodos.concat(sleepLogsRes.data.map(log => ({ ...log, type: 'sleep' })));
            } else if (sleepLogsRes.error && sleepLogsRes.status !== 404) {
                apiErrors.push(`Sleep Logs: ${sleepLogsRes.error}`);
            }
            if (sleepHabitRes.data) {
                setSleepHabit(sleepHabitRes.data);
            } else if (sleepHabitRes.error && sleepHabitRes.status !== 404) {
                apiErrors.push(`Sleep Habit: ${sleepHabitRes.error}`);
            }


            // Process Hydrate (Log đã có goal)
            if (hydrateLogsRes.data && hydrateLogsRes.data.length > 0) {
                // Assume only one hydrate log per day from API
                combinedTodos.push({ ...hydrateLogsRes.data[0], type: 'hydrate' });
            } else if (hydrateLogsRes.error && hydrateLogsRes.status !== 404) {
                apiErrors.push(`Hydrate Logs: ${hydrateLogsRes.error}`);
            }

            // Process Diet (Log đã có goal)
            if (dietLogsRes.data && dietLogsRes.data.length > 0) {
                // Assume only one diet log per day from API
                combinedTodos.push({ ...dietLogsRes.data[0], type: 'diet' });
            } else if (dietLogsRes.error && dietLogsRes.status !== 404) {
                apiErrors.push(`Diet Logs: ${dietLogsRes.error}`);
            }

            // Sort todos (e.g., by scheduled time for sleep, then others)
            combinedTodos.sort((a, b) => {
                const getTime = (item: TodoItem) => {
                    if (item.type === 'sleep' && item.scheduled_time) return new Date(item.scheduled_time).getTime();
                    return Infinity; // Đẩy các item không có giờ xuống cuối
                }
                const timeA = getTime(a);
                const timeB = getTime(b);
                if (timeA !== Infinity || timeB !== Infinity) return timeA - timeB;

                // Sắp xếp theo type nếu không có giờ
                const typeOrder = { 'sleep': 1, 'hydrate': 2, 'diet': 3 };
                return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
            });

            setTodos(combinedTodos);

            // Process User Stats (using fake data)
            const userStatsRes = { data: { xp: 100, level: 1, streak: 10 } };
            if (userStatsRes.data) {
                setUserStats(userStatsRes.data);
            } // else if(userStatsRes.error) { apiErrors.push(...) }

            if (apiErrors.length > 0) setError(`API Errors: ${apiErrors.join('; ')}`);

        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            setError("Failed to load dashboard data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []); // Dependency array is empty, fetch only once on mount

    useEffect(() => {
        fetchData();
    }, [fetchData]); // Include fetchData in dependency array

    // --- Action Handlers (Giữ nguyên) ---
    const setItemLoading = (id: string, loading: boolean) => {
        setIsUpdating(prev => ({ ...prev, [id]: loading }));
    };

    // Generic function to update a todo item in state (Giữ nguyên)
    const updateTodoInState = (updatedItem: TodoItem) => {
        setTodos(prevTodos => prevTodos.map(todo =>
            todo.id === updatedItem.id ? updatedItem : todo
        ));
    };

    const handleCompleteSleep = async (logId: string) => {
        setItemLoading(logId, true);
        setError(null);
        const response = await fetchApi<SleepLog>(`/sleep/logs/${logId}/complete`, {
            method: 'PUT',
            isProtected: true,
        });
        setItemLoading(logId, false);

        if (response.data) {
            // API should return the updated log
            updateTodoInState({ ...response.data, type: 'sleep' }); // Add type back
        } else {
            setError(response.error || 'Failed to complete task.');
        }
    };

    const handleUpdateHydrate = async (logId: string) => {
        setItemLoading(logId, true);
        setError(null);
        const response = await fetchApi<HydrateLog>(`/hydrate/logs/${logId}/update`, {
            method: 'PUT',
            isProtected: true,
        });
        setItemLoading(logId, false);

        if (response.data) {
            // API returns the updated log with new consumed_water
            updateTodoInState({ ...response.data, type: 'hydrate' }); // Add type back
        } else {
            setError(response.error || 'Failed to update water intake.');
        }
    };

    const handleUpdateDiet = async (logId: string) => {
        setItemLoading(logId, true);
        setError(null);
        console.log("Updating diet log:", logId);
        // --- TODO: Implement Diet Update ---
        // 1. Open a Modal/Form to input dish details (name, calories, etc.)
        // 2. Get the data from the form. Example: const foodData = { name: 'Apple', calories: 95 };
        // 3. Call the API:
        /*
        const response = await fetchApi<DietLog>(`/diet/logs/${logId}/update`, {
          method: 'PUT',
          isProtected: true,
          body: foodData, // Send the dish data
        });
        */
        // 4. Process response and update state like other handlers
        // For now, just simulate a delay and reset loading
        await new Promise(resolve => setTimeout(resolve, 500));
        console.warn("Diet update UI not implemented yet.");
        setItemLoading(logId, false);
        // setError("Diet update functionality is not yet available."); // Optional message
    };

    // --- Render Logic ---

    // Render Left Column Icons
    const renderHabitIcons = () => {
        // Find today's logs from the state (Giữ nguyên)
        const todaySleepLogs = todos.filter(t => t.type === 'sleep') as SleepLog[];
        const todayHydrateLog = todos.find(t => t.type === 'hydrate') as HydrateLog | undefined;
        const todayDietLog = todos.find(t => t.type === 'diet') as DietLog | undefined;

        const wakeUpLog = todaySleepLogs.find(log => log.task_type === 'wakeup');
        const sleepLog = todaySleepLogs.find(log => log.task_type === 'sleep');

        const getIconBackgroundStyle = (item: HydrateLog | DietLog | undefined, type: 'hydrate' | 'diet'): React.CSSProperties => {
            if (!item) return {};
            const consumed = type === 'hydrate' ? item.consumed_water : item.consumed_calories;
            const goal = type === 'hydrate' ? item.water_goal : item.calories_goal;
            const percentage = calculatePercentage(consumed, goal);
            const progressColor = type === 'hydrate' ? 'var(--hydrate-progress-color)' : 'var(--diet-progress-color)';
            // Thay conic-gradient bằng linear-gradient để fill từ dưới lên
            return {
                background: `linear-gradient(to top, ${progressColor} ${percentage}%, var(--icon-background-default) ${percentage}%)`
            };
        };

        return (
            <div className={styles.habitIconsList}>
                {/* Wake Up (Cập nhật icon và text) */}
                <div className={`${styles.habitIconWrapper} ${wakeUpLog?.completed ? styles.completed : ''}`}>
                    <div className={`${styles.iconCircle} ${styles.wakeup} ${wakeUpLog?.completed ? styles.completed : ''}`}>
                        <span className={styles.iconSymbol}>🔆</span>
                    </div>
                    <span className={styles.habitText}>
                        Wake up<br />
                        <span className={styles.habitProgressText}>
                            {sleepHabit ? formatTime(sleepHabit.wakeup_time) : 'Goal N/A'}
                            {wakeUpLog?.completed && ' ✓'}
                        </span>
                    </span>
                </div>

                {/* Sleep (Cập nhật icon và text) */}
                <div className={`${styles.habitIconWrapper} ${sleepLog?.completed ? styles.completed : ''}`}>
                    <div className={`${styles.iconCircle} ${styles.sleep} ${sleepLog?.completed ? styles.completed : ''}`}>
                        <span className={styles.iconSymbol}>🌙</span>
                    </div>
                    <span className={styles.habitText}>
                        Sleep<br />
                        <span className={styles.habitProgressText}>
                            {sleepHabit ? formatTime(sleepHabit.sleep_time) : 'Goal N/A'}
                            {sleepLog?.completed && ' ✓'}
                        </span>
                    </span>
                </div>

                {/* Hydrate (Cập nhật icon và text) */}
                <div className={`${styles.habitIconWrapper} ${todayHydrateLog?.completed ? styles.completed : ''}`}>
                    <div className={styles.iconCircle} style={getIconBackgroundStyle(todayHydrateLog, 'hydrate')}>
                        <span className={styles.iconSymbol}>🥛</span>
                    </div>
                    <span className={styles.habitText}>
                        Hydrate<br />
                        <span className={styles.habitProgressText}>
                            {formatAmount(todayHydrateLog?.consumed_water, 'ml')} / {formatAmount(todayHydrateLog?.water_goal, 'ml')}
                            {todayHydrateLog?.completed && ' ✓'}
                        </span>
                    </span>
                </div>

                {/* Diet (Giữ nguyên icon, cập nhật text) */}
                <div className={`${styles.habitIconWrapper} ${todayDietLog?.completed ? styles.completed : ''}`}>
                    <div className={styles.iconCircle} style={getIconBackgroundStyle(todayDietLog, 'diet')}>
                        <span className={styles.iconSymbol}>🍴</span>
                    </div>
                    <span className={styles.habitText}>
                        Diet<br />
                        <span className={styles.habitProgressText}>
                            {formatAmount(todayDietLog?.consumed_calories, 'kcal')} / {formatAmount(todayDietLog?.calories_goal, 'kcal')}
                            {todayDietLog?.completed && ' ✓'}
                        </span>
                    </span>
                </div>
            </div>
        );
    }

    // Render Todo List in Right Column
    const renderTodoList = () => {
        if (isLoading) return null; // Không render todo list khi trang đang loading
        if (error && todos.length === 0) return <p>Error: {error}</p>;
        if (!isLoading && todos.length === 0) return <p>No tasks for today yet.</p>;

        return (
            <div className={styles.todoListContainer}>
                {/* Optional: Show main loading state on top */}
                {/* {isLoading && <p>Loading tasks...</p>} */}
                {todos.map((item) => {
                    const itemIsLoading = isUpdating[item.id] ?? false; // Check if this specific item is loading
                    return (
                        <div key={item.id} className={`${styles.todoItem} ${itemIsLoading ? styles.loading : ''}`}>
                            <div className={styles.todoContent}>
                                {item.type === 'sleep' && (
                                    <>
                                        <p className={styles.todoText}>
                                            {item.task_type === 'sleep' ? 'Go to bed' : 'Wake up'}
                                        </p>
                                        <p className={styles.todoSubtext}>Scheduled: {formatTime(item.scheduled_time)}</p>
                                    </>
                                )}
                                {item.type === 'hydrate' && (
                                    <>
                                        <p className={styles.todoText}>Hydrate</p> {/* Đổi text */}
                                        <p className={styles.todoSubtext}>
                                            Progress: {formatAmount(item.consumed_water, 'ml')} / {formatAmount(item.water_goal, 'ml')}
                                        </p>
                                    </>
                                )}
                                {item.type === 'diet' && (
                                    <>
                                        <p className={styles.todoText}>Eat well</p> {/* Đổi text */}
                                        <p className={styles.todoSubtext}>
                                            Progress: {formatAmount(item.consumed_calories, 'kcal')} / {formatAmount(item.calories_goal, 'kcal')}
                                        </p>
                                    </>
                                )}
                            </div>
                            <div className={styles.todoActions}>
                                {itemIsLoading ? <LoadingSpinner /> : item.completed ? (
                                    <span className={styles.checkIcon}>✓</span>
                                ) : (
                                    // Show button based on type
                                    item.type === 'sleep' ? (
                                        <button onClick={() => handleCompleteSleep(item.id)} disabled={itemIsLoading}>Complete</button>
                                    ) : item.type === 'hydrate' ? (
                                        <button className={styles.updateButton} onClick={() => handleUpdateHydrate(item.id)} disabled={itemIsLoading}>
                                            + {formatAmount(item.cup_size, 'ml')}
                                        </button>
                                    ) : item.type === 'diet' ? (
                                        <button className={styles.updateButton} onClick={() => handleUpdateDiet(item.id)} disabled={itemIsLoading}>
                                            Add Food {/* // TODO: Icon? */}
                                        </button>
                                    ) : null
                                )}
                            </div>
                        </div>
                    )
                })}
                {/* Show general API error at the bottom */}
                {error && <p style={{ color: 'red', marginTop: '1rem', fontSize: '0.9rem' }}>API Error: {error}</p>}
            </div>
        );
    };


    return (
        <DashboardLayout>
            {isLoading && <div className={styles.fullPageSpinnerContainer}><LoadingSpinner /></div>} {/* Full page spinner when loading */}
            {!isLoading && ( // Chỉ render nội dung khi không loading
                <div className={styles.homeGrid}>
                    {/* --- Left Column --- */}
                    <div className={styles.leftColumn}>
                        {/* User Stats (Giữ nguyên) */}
                        <div className={styles.userStats}>
                            <h2 className={styles.sectionTitle}>Progress</h2>
                            {isLoading && !userStats ? <LoadingSpinner /> : userStats ? (
                                <>
                                    <p className={styles.statItem}>
                                        <span className={styles.statLabel}>XP:</span>
                                        <span className={styles.statValue}>{userStats.xp}</span>
                                    </p>
                                    <p className={styles.statItem}>
                                        <span className={styles.statLabel}>Level:</span>
                                        <span className={styles.statValue}>{userStats.level}</span>
                                    </p>
                                    <p className={styles.statItem}>
                                        <span className={styles.statLabel}>Streak 🔥:</span>
                                        <span className={styles.statValue}>{userStats.streak} days</span>
                                    </p>
                                </>
                            ) : <p>Could not load user stats.</p>}
                        </div>

                        {/* Habit Icons/Progress (Giữ nguyên) */}
                        <div className={styles.habitIconsContainer}>
                            {renderHabitIcons()}
                        </div>

                        {/* Cat Image (Bỏ title) */}
                        <div className={styles.catContainer}>
                            <Image
                                src={catImageSrc}
                                alt="User's companion cat"
                                width={150}
                                height={150}
                                priority // Mark as priority if it's important for LCP
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                    </div>

                    {/* --- Right Column --- */}
                    <div className={styles.rightColumn}>
                        <h2 className={styles.sectionTitle}>Today's Tasks</h2>
                        {renderTodoList()}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default DashboardHomePage;