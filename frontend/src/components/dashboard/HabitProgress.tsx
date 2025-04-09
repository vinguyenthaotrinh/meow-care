// src/components/dashboard/HabitProgress.tsx
import React from 'react';
import { SleepHabit, SleepLog, HydrateLog, DietLog, TodoItem } from '../../types/habit.types';
import LoadingSpinner from '../common/LoadingSpinner'; // Import LoadingSpinner
import styles from '../../styles/Dashboard.module.css'; // Import CSS Module

const formatTime = (timeString: string | null | undefined): string => { /* ... (same as in index.tsx) */
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

const formatAmount = (amount: number | null | undefined, unit: string): string => { /* ... (same as in index.tsx) */
    if (amount === null || amount === undefined) return `? ${unit}`;
    // Làm tròn đến 1 chữ số thập phân nếu là float, không làm tròn nếu là int
    const roundedAmount = Number.isInteger(amount) ? amount : amount.toFixed(1);
    return `${roundedAmount} ${unit}`;
}

const calculatePercentage = (consumed: number | undefined, goal: number | undefined): number => { /* ... (same as in index.tsx) */
    if (goal === null || goal === undefined || consumed === null || consumed === undefined || goal <= 0) {
        return 0;
    }
    const percentage = (consumed / goal) * 100;
    return Math.min(Math.max(percentage, 0), 100);
};


interface HabitProgressProps {
    todos: TodoItem[];
    sleepHabit: SleepHabit | null;
    isLoading: boolean; // Add isLoading prop to handle loading state in HabitProgress itself, if needed
}


const HabitProgress: React.FC<HabitProgressProps> = ({ todos, sleepHabit, isLoading }) => {

    if (isLoading) {
        return <LoadingSpinner />; // Or a simpler loading indicator if preferred
    }


    // Find today's logs from the state (Move from index.tsx)
    const todaySleepLogs = todos.filter(t => t.type === 'sleep') as SleepLog[];
    const todayHydrateLog = todos.find(t => t.type === 'hydrate') as HydrateLog | undefined;
    const todayDietLog = todos.find(t => t.type === 'diet') as DietLog | undefined;

    const wakeUpLog = todaySleepLogs.find(log => log.task_type === 'wakeup');
    const sleepLog = todaySleepLogs.find(log => log.task_type === 'sleep');

    const getIconBackgroundStyle = (item: HydrateLog | DietLog | undefined, type: 'hydrate' | 'diet'): React.CSSProperties => { /* ... (same as in index.tsx) */
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
                    Wake-up<br />
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
                    Hydration<br />
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
};

export default HabitProgress;