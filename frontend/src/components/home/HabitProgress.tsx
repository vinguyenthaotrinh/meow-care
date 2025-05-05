// src/components/home/HabitProgress.tsx
import React from 'react';
import { TodoItem, SleepLog, HydrateLog, DietLog, SleepHabit } from '@/types/habit.types';
import styles from '@/styles/Home.module.css'; // Assuming styles are in Home.module.css
import { FaBed, FaSun, FaUtensils, FaBrain } from 'react-icons/fa';
import { FaGlassWater } from 'react-icons/fa6';

// --- Helper Functions (Copied from home.tsx or move to shared utils) ---
// It's generally better to move these to a separate utils file and import them.
const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return "N/A";
    try {
        // Check if format is HH:MM:SS
        if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
            const [hours, minutes] = timeString.split(':');
            // Create a dummy date to use toLocaleTimeString for formatting
            const date = new Date();
            date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
        // Assume ISO string otherwise
        const date = new Date(timeString);
        if (isNaN(date.getTime())) return "Invalid Time"; // Check if date is valid
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
        console.error("Error formatting time:", timeString, e);
        return "Error";
    }
};

const formatAmount = (
    amount: number | null | undefined,
    unit: string,
    showUnit: boolean = true // Add flag to control unit display
): string => {
    if (amount === null || amount === undefined) return `?${showUnit ? ' ' + unit : ''}`; // Handle null/undefined, optionally show unit with '?'
    const roundedAmount = Number.isInteger(amount) ? amount : amount.toFixed(1); // Round floats to 1 decimal
    return `${roundedAmount}${showUnit ? ' ' + unit : ''}`; // Conditionally add unit
};

const calculatePercentage = (consumed: number | undefined, goal: number | undefined): number => {
    if (goal === null || goal === undefined || consumed === null || consumed === undefined || goal <= 0) return 0;
    const percentage = (consumed / goal) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Clamp between 0 and 100
};
// --- End Helper Functions ---

// Props interface for the component
interface HabitProgressProps {
    todos: TodoItem[]; // Array of current logs/todos
    sleepHabit: SleepHabit | null; // Sleep goal times
    isUpdating: Record<string, boolean>; // Map of logId to loading state
    // Callback functions for actions
    onCompleteSleep: (logId: string) => Promise<void>;
    onUpdateHydrate: (logId: string) => Promise<void>;
    onUpdateDiet: (logId: string) => Promise<void>; // Opens the diet modal
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
        // Find relevant logs from the todos array
        const todaySleepLogs = todos.filter(t => t.type === 'sleep') as SleepLog[];
        const todayHydrateLog = todos.find(t => t.type === 'hydrate') as HydrateLog | undefined;
        const todayDietLog = todos.find(t => t.type === 'diet') as DietLog | undefined;
        const wakeUpLog = todaySleepLogs.find(log => log.task_type === 'wakeup');
        const sleepLog = todaySleepLogs.find(log => log.task_type === 'sleep');

        // Helper to get background style for progress circles
        const getIconBackgroundStyle = (item: HydrateLog | DietLog | undefined, habitType: 'hydrate' | 'diet'): React.CSSProperties => {
            if (!item) return {};
            const consumed = habitType === 'hydrate' ? item.consumed_water : item.consumed_calories;
            const goal = habitType === 'hydrate' ? item.water_goal : item.calories_goal;
            const percentage = calculatePercentage(consumed, goal);
            const progressColor = habitType === 'hydrate' ? 'var(--hydrate-progress-color)' : 'var(--diet-progress-color)';
            return { background: `linear-gradient(to top, ${progressColor} ${percentage}%, var(--icon-background-default) ${percentage}%)` };
        };

        // Helper to get completed class (mostly for sleep/wake color change)
        const completedClass = (log: SleepLog | HydrateLog | DietLog | undefined): string => log?.completed ? styles.completed : '';

        // --- Determine Icon Data based on type ---
        let icon: React.ReactNode;
        let textLine1: string = '';
        let textLine2: string = '';
        let circleStyle: React.CSSProperties = {};
        let circleClasses = `${styles.iconCircle}`;
        let wrapperClasses = `${styles.habitIconWrapper}`;
        let logId: string | undefined = undefined;
        let isCompleted = false;
        let clickHandler: (() => Promise<void>) | undefined = undefined;
        let ariaLabel = '';
        let isInteractive = false; // Flag to determine if it should be a button

        switch (type) {
            case 'wakeup':
                icon = <FaSun />; textLine1 = 'Wake-up';
                textLine2 = sleepHabit ? formatTime(sleepHabit.wakeup_time) : 'N/A';
                logId = wakeUpLog?.id; isCompleted = !!wakeUpLog?.completed;
                if (isCompleted) { circleClasses += ` ${styles.wakeup} ${styles.completed}`; }
                else { circleClasses += ` ${styles.wakeup}`; }
                if (logId && !isCompleted) { clickHandler = () => onCompleteSleep(logId as string); isInteractive = true; }
                ariaLabel = isCompleted ? `Wake up completed at ${textLine2}` : `Mark wake up at ${textLine2} as complete`;
                break;
            case 'sleep':
                icon = <FaBed />; textLine1 = 'Sleep';
                textLine2 = sleepHabit ? formatTime(sleepHabit.sleep_time) : 'N/A';
                logId = sleepLog?.id; isCompleted = !!sleepLog?.completed;
                if (isCompleted) { circleClasses += ` ${styles.sleep} ${styles.completed}`; }
                else { circleClasses += ` ${styles.sleep}`; }
                if (logId && !isCompleted) { clickHandler = () => onCompleteSleep(logId as string); isInteractive = true; }
                ariaLabel = isCompleted ? `Sleep completed at ${textLine2}` : `Mark sleep at ${textLine2} as complete`;
                break;
            case 'hydrate':
                icon = <FaGlassWater />; textLine1 = 'Hydration';
                textLine2 = `${formatAmount(todayHydrateLog?.consumed_water, 'ml', false)} / ${formatAmount(todayHydrateLog?.water_goal, 'ml')}`; // Unit only on goal
                logId = todayHydrateLog?.id; isCompleted = !!todayHydrateLog?.completed; // Based on backend logic
                circleStyle = getIconBackgroundStyle(todayHydrateLog, 'hydrate');
                wrapperClasses += ` ${completedClass(todayHydrateLog)}`; // Apply completed style to wrapper if needed
                if (logId) { clickHandler = () => onUpdateHydrate(logId as string); isInteractive = true; }
                ariaLabel = `Add ${formatAmount(todayHydrateLog?.cup_size, 'ml')} water. Current: ${textLine2}`;
                break;
            case 'diet':
                icon = <FaUtensils />; textLine1 = 'Diet';
                textLine2 = `${formatAmount(todayDietLog?.consumed_calories, 'kcal', false)} / ${formatAmount(todayDietLog?.calories_goal, 'kcal')}`; // Unit only on goal
                logId = todayDietLog?.id; isCompleted = !!todayDietLog?.completed; // Based on backend logic
                circleStyle = getIconBackgroundStyle(todayDietLog, 'diet');
                wrapperClasses += ` ${completedClass(todayDietLog)}`; // Apply completed style to wrapper if needed
                if (logId) { clickHandler = () => onUpdateDiet(logId as string); isInteractive = true; }
                ariaLabel = `Log food. Current: ${textLine2}`;
                break;
            case 'focus': // Mock Data for Focus
                icon = <FaBrain />; textLine1 = 'Focus';
                textLine2 = `${formatAmount(30, 'min', false)} / ${formatAmount(100, 'min')}`; // Unit only on goal
                isCompleted = false; clickHandler = undefined; isInteractive = false;
                ariaLabel = 'Focus session progress';
                // Add specific class if needed: circleClasses += ` ${styles.focus}`;
                break;
        }

        // Determine loading and disabled states for the specific icon
        const isLoadingThis = logId ? isUpdating[logId] ?? false : false;
        // Disable if loading OR if it's not interactive OR if it's completed (except hydrate/diet)
        const isDisabled = isLoadingThis || !isInteractive || (isCompleted && type !== 'hydrate' && type !== 'diet');

        // Use button for interactive elements, div for non-interactive
        const WrapperElement = isInteractive ? 'button' : 'div';

        return (
            // Outer wrapper for spacing and text alignment
            <div className={`${wrapperClasses} ${isCompleted ? styles.completed : ''}`}>
                 {/* Button or Div for the CIRCLE */}
                <WrapperElement
                    className={`${circleClasses} ${isLoadingThis ? styles.loadingHabit : ''}`}
                    style={circleStyle}
                    onClick={!isDisabled ? clickHandler : undefined} // Attach handler only if interactive and not disabled
                    disabled={isDisabled} // Standard disabled attribute for buttons
                    aria-label={ariaLabel}
                    // For non-button elements that might become interactive later:
                    // role={isInteractive ? "button" : undefined}
                    // aria-disabled={isDisabled}
                    // tabIndex={isInteractive && !isDisabled ? 0 : undefined}
                >
                    <span className={styles.iconSymbol}>{icon}</span>
                    {/* Optional: Spinner overlay can be added here if desired for loading state */}
                </WrapperElement>

                {/* Text below the circle */}
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

    // Component's main return: Renders the grid of icons
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
            <div className={`${styles.habitRow} ${styles.centerLastRow}`}>
                {renderSingleHabitIcon('focus')}
            </div>
        </div>
    );
};

export default HabitProgress;