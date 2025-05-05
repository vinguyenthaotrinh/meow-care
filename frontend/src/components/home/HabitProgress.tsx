// src/components/home/HabitProgress.tsx
import React from 'react';
import { TodoItem, SleepLog, HydrateLog, DietLog, SleepHabit } from '@/types/habit.types';
import styles from '@/styles/Home.module.css';
import { FaBed, FaSun, FaUtensils, FaBrain } from 'react-icons/fa'; // Removed FaTasks
import { FaGlassWater } from 'react-icons/fa6';
// Removed LoadingSpinner import if not used for individual icon loading state here

// --- Helper Functions (Keep as is or move to utils) ---
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
    } catch (e) { return "Error"; }
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

interface HabitProgressProps {
    todos: TodoItem[];
    sleepHabit: SleepHabit | null;
    isUpdating: Record<string, boolean>; // Receive loading state for individual items
    // Action Handlers passed from parent
    onCompleteSleep: (logId: string) => Promise<void>;
    onUpdateHydrate: (logId: string) => Promise<void>;
    onUpdateDiet: (logId: string) => Promise<void>; // This will trigger the modal
    // Removed onTriggerClick and isTasksVisible
}

const HabitProgress: React.FC<HabitProgressProps> = ({
    todos,
    sleepHabit,
    isUpdating,
    onCompleteSleep,
    onUpdateHydrate,
    onUpdateDiet
}) => {

    // --- Internal Render Logic for Individual Habit Icons ---
    const renderSingleHabitIcon = (type: 'wakeup' | 'sleep' | 'hydrate' | 'diet' | 'focus') => {
        // Find relevant logs
        const todaySleepLogs = todos.filter(t => t.type === 'sleep') as SleepLog[];
        const todayHydrateLog = todos.find(t => t.type === 'hydrate') as HydrateLog | undefined;
        const todayDietLog = todos.find(t => t.type === 'diet') as DietLog | undefined;
        const wakeUpLog = todaySleepLogs.find(log => log.task_type === 'wakeup');
        const sleepLog = todaySleepLogs.find(log => log.task_type === 'sleep');

        // Helper functions remain the same
        const getIconBackgroundStyle = (item: HydrateLog | DietLog | undefined, habitType: 'hydrate' | 'diet'): React.CSSProperties => {
            // ... (implementation as before)
             if (!item) return {};
            const consumed = habitType === 'hydrate' ? item.consumed_water : item.consumed_calories;
            const goal = habitType === 'hydrate' ? item.water_goal : item.calories_goal;
            const percentage = calculatePercentage(consumed, goal);
            const progressColor = habitType === 'hydrate' ? 'var(--hydrate-progress-color)' : 'var(--diet-progress-color)';
            return { background: `linear-gradient(to top, ${progressColor} ${percentage}%, var(--icon-background-default) ${percentage}%)` };
        };
        const completedClass = (log: SleepLog | HydrateLog | DietLog | undefined): string => log?.completed ? styles.completed : '';

        // --- Determine Icon Data ---
        let icon: React.ReactNode;
        let textLine1: string = '';
        let textLine2: string = '';
        let circleStyle: React.CSSProperties = {};
        let circleClasses = `${styles.iconCircle}`;
        let wrapperClasses = `${styles.habitIconWrapper}`;
        let logId: string | undefined = undefined;
        let isCompleted = false;
        let clickHandler: (() => Promise<void>) | undefined = undefined;
        let ariaLabel = ''; // For accessibility

        switch (type) {
            case 'wakeup':
                icon = <FaSun />; textLine1 = 'Wake-up';
                textLine2 = sleepHabit ? formatTime(sleepHabit.wakeup_time) : 'N/A';
                logId = wakeUpLog?.id;
                isCompleted = !!wakeUpLog?.completed;
                if (isCompleted) { textLine2 += ' ✓'; circleClasses += ` ${styles.wakeup} ${styles.completed}`; wrapperClasses += ` ${styles.completed}`; }
                else { circleClasses += ` ${styles.wakeup}`; }
                if (logId && !isCompleted) clickHandler = () => onCompleteSleep(logId as string);
                ariaLabel = isCompleted ? `Wake up completed at ${textLine2.replace(' ✓', '')}` : `Mark wake up at ${textLine2} as complete`;
                break;
            case 'sleep':
                icon = <FaBed />; textLine1 = 'Sleep';
                textLine2 = sleepHabit ? formatTime(sleepHabit.sleep_time) : 'N/A';
                logId = sleepLog?.id;
                isCompleted = !!sleepLog?.completed;
                if (isCompleted) { textLine2 += ' ✓'; circleClasses += ` ${styles.sleep} ${styles.completed}`; wrapperClasses += ` ${styles.completed}`; }
                else { circleClasses += ` ${styles.sleep}`; }
                if (logId && !isCompleted) clickHandler = () => onCompleteSleep(logId as string);
                ariaLabel = isCompleted ? `Sleep completed at ${textLine2.replace(' ✓', '')}` : `Mark sleep at ${textLine2} as complete`;
                break;
            case 'hydrate':
                icon = <FaGlassWater />; textLine1 = 'Hydration';
                textLine2 = `${todayHydrateLog?.consumed_water} / ${formatAmount(todayHydrateLog?.water_goal, 'ml')}`;
                logId = todayHydrateLog?.id;
                isCompleted = !!todayHydrateLog?.completed; // Hydration 'completion' might mean reaching goal
                if (isCompleted) textLine2 += ' ✓';
                circleStyle = getIconBackgroundStyle(todayHydrateLog, 'hydrate');
                wrapperClasses += ` ${completedClass(todayHydrateLog)}`;
                // Allow clicking even if completed to add more water
                if (logId) clickHandler = () => onUpdateHydrate(logId as string);
                 ariaLabel = `Add ${todayHydrateLog?.cup_size} water. Current: ${textLine2}`;
                break;
            case 'diet':
                icon = <FaUtensils />; textLine1 = 'Diet';
                textLine2 = `${todayDietLog?.consumed_calories} / ${formatAmount(todayDietLog?.calories_goal, 'kcal')}`;
                logId = todayDietLog?.id;
                isCompleted = !!todayDietLog?.completed; // Diet 'completion' might mean reaching goal or just logging
                if (isCompleted) textLine2 += ' ✓';
                circleStyle = getIconBackgroundStyle(todayDietLog, 'diet');
                wrapperClasses += ` ${completedClass(todayDietLog)}`;
                 // Always allow clicking diet to add food
                if (logId) clickHandler = () => onUpdateDiet(logId as string);
                ariaLabel = `Log food. Current: ${textLine2}`;
                break;
            case 'focus':
                icon = <FaBrain />; textLine1 = 'Focus';
                textLine2 = '30 / 100 min'; // Mock data
                isCompleted = false; // Mock
                clickHandler = undefined; // Non-interactive for now
                ariaLabel = 'Focus session progress';
                break;
        }

        // Determine if the specific item is loading
        const isLoadingThis = logId ? isUpdating[logId] ?? false : false;
        const isDisabled = isLoadingThis || (type !== 'hydrate' && type !== 'diet' && isCompleted); // Disable completed sleep/wake/focus

        // Use button for interactive elements, div for non-interactive (Focus)
        const WrapperElement = clickHandler ? 'button' : 'div';

        return (
            <WrapperElement
                className={`${wrapperClasses} ${isDisabled ? styles.disabledHabit : ''} ${isLoadingThis ? styles.loadingHabit : ''}`}
                onClick={!isDisabled ? clickHandler : undefined} // Only attach handler if interactive and not disabled
                disabled={isDisabled} // Disable button if needed
                aria-label={ariaLabel}
                // Add role="button" and tabIndex if using div for interaction later
            >
                <div className={circleClasses} style={circleStyle}>
                    <span className={styles.iconSymbol}>{icon}</span>
                     {/* Optional: Show spinner inside icon if loading */}
                     {/* {isLoadingThis && <LoadingSpinner inline size="small" overlay={true}/>} */}
                </div>
                {textLine1 && (
                    <span className={styles.habitText}>
                        {textLine1}<br />
                        <span className={styles.habitProgressText}>{textLine2}</span>
                    </span>
                )}
            </WrapperElement>
        );
    };
    // --- End Internal Render Logic ---

    // Component's main return: Adjusted Grid Structure (2x2 + 1)
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
            {/* Center the last item */}
            <div className={`${styles.habitRow} ${styles.centerLastRow}`}>
                {renderSingleHabitIcon('focus')}
                 {/* Empty div as placeholder if needed for alignment, or adjust grid CSS */}
                 {/* <div></div> */}
            </div>
        </div>
    );
};

export default HabitProgress;