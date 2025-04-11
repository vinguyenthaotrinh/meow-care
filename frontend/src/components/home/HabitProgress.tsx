// src/components/home/HabitProgress.tsx
import React from 'react';
import { TodoItem, SleepLog, HydrateLog, DietLog, SleepHabit } from '@/types/habit.types';
import styles from '@/styles/Home.module.css'; // Reuse styles from Home for now
import { FaBed, FaSun, FaUtensils, FaBrain, FaTasks } from 'react-icons/fa';
import { FaGlassWater } from 'react-icons/fa6';

// --- Helper Functions (Copied from home.tsx or move to shared utils) ---
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
    return Math.min(Math.max(percentage, 0), 100); // Keep within 0-100
};
// --- End Helper Functions ---

interface HabitProgressProps {
    todos: TodoItem[];
    sleepHabit: SleepHabit | null;
    onTriggerClick: () => void; // Callback when the trigger button is clicked
    isTasksVisible: boolean; // Pass visibility state for aria-expanded
}

const HabitProgress: React.FC<HabitProgressProps> = ({
    todos,
    sleepHabit,
    onTriggerClick,
    isTasksVisible
}) => {

    // --- Internal Render Logic for Individual Habit Icons ---
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
                // Wrap the button in the same wrapper structure for consistent alignment
                <div className={styles.habitIconWrapper}>
                     <button
                        className={`${styles.iconCircle} ${styles.taskTriggerButton}`}
                        onClick={onTriggerClick} // Use the passed callback
                        aria-label="Toggle daily tasks list"
                        aria-expanded={isTasksVisible} // Use passed state
                     >
                        <span className={styles.iconSymbol}><FaTasks /></span>
                    </button>
                    {/* Add a placeholder div to mimic the height of the text elements below other icons */}
                    <div className={styles.habitTextPlaceholder}> </div>
                </div>
            );
        }
        // --- End Trigger Button ---

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
                if (wakeUpLog?.completed) { circleClasses += ` ${styles.wakeup} ${styles.completed}`; wrapperClasses += ` ${styles.completed}`; }
                else { circleClasses += ` ${styles.wakeup}`; }
                break;
            case 'sleep':
                icon = <FaBed />; textLine1 = 'Sleep';
                textLine2 = sleepHabit ? formatTime(sleepHabit.sleep_time) : 'N/A';
                if (sleepLog?.completed) { circleClasses += ` ${styles.sleep} ${styles.completed}`; wrapperClasses += ` ${styles.completed}`; }
                else { circleClasses += ` ${styles.sleep}`; }
                break;
            case 'hydrate':
                icon = <FaGlassWater />; textLine1 = 'Hydration';
                textLine2 = `${todayHydrateLog?.consumed_water} / ${formatAmount(todayHydrateLog?.water_goal, 'ml')}`;
                circleStyle = getIconBackgroundStyle(todayHydrateLog, 'hydrate');
                wrapperClasses += ` ${completedClass(todayHydrateLog)}`;
                break;
            case 'diet':
                icon = <FaUtensils />; textLine1 = 'Diet';
                textLine2 = `${todayDietLog?.consumed_calories} / ${formatAmount(todayDietLog?.calories_goal, 'kcal')}`;
                circleStyle = getIconBackgroundStyle(todayDietLog, 'diet');
                wrapperClasses += ` ${completedClass(todayDietLog)}`;
                break;
            case 'focus': // Mock Data for Focus
                icon = <FaBrain />; textLine1 = 'Focus';
                textLine2 = '30 / 100 min'; // Mock data
                // Mock completed style if desired
                // wrapperClasses += ` ${styles.completed}`;
                // circleClasses += ` ${styles.focus} ${styles.completed}`;
                break;
        }

        return (
             <div className={wrapperClasses}>
                <div className={circleClasses} style={circleStyle}>
                    <span className={styles.iconSymbol}>{icon}</span>
                </div>
                {/* Render text only if textLine1 has content */}
                {textLine1 && (
                    <span className={styles.habitText}>
                        {textLine1}<br />
                        <span className={styles.habitProgressText}>{textLine2}</span>
                    </span>
                )}
            </div>
        );
    };
    // --- End Internal Render Logic ---

    // Component's main return: The Grid Structure
    return (
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
                {renderSingleHabitIcon('trigger')}
            </div>
        </div>
    );
};

export default HabitProgress;