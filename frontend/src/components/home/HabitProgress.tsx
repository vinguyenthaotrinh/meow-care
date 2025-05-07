// src/components/home/HabitProgress.tsx
import React from 'react';
import { TodoItem, SleepLog, HydrateLog, DietLog, SleepHabit, FocusLog, FocusHabit } from '@/types/habit.types';
import styles from '@/styles/Home.module.css'; // Assuming styles are in Home.module.css
import { FaBed, FaSun, FaUtensils, FaBrain } from 'react-icons/fa';
import { FaGlassWater } from 'react-icons/fa6';

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
    } catch (e) { console.error("Error formatting time:", timeString, e); return "Error"; }
};
const formatAmount = (amount: number | null | undefined, unit: string, showUnit: boolean = true): string => {
    if (amount === null || amount === undefined) return `?${showUnit ? ' ' + unit : ''}`;
    const roundedAmount = Number.isInteger(amount) ? amount : amount.toFixed(1);
    return `${roundedAmount}${showUnit ? ' ' + unit : ''}`;
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
    focusHabit: FocusHabit | null;
    todayFocusLog: FocusLog | null;
    isUpdating: Record<string, boolean>;
    onCompleteSleep: (logId: string) => Promise<void>;
    onUpdateHydrate: (logId: string) => Promise<void>;
    onUpdateDiet: (logId: string) => Promise<void>;
    onToggleFocusView: () => void;
}

const HabitProgress: React.FC<HabitProgressProps> = ({
    todos,
    sleepHabit,
    focusHabit,
    todayFocusLog,
    isUpdating,
    onCompleteSleep,
    onUpdateHydrate,
    onUpdateDiet,
    onToggleFocusView
}) => {

    const renderSingleHabitIcon = (type: 'wakeup' | 'sleep' | 'hydrate' | 'diet' | 'focus') => {
        const todaySleepLogs = todos.filter(t => t.type === 'sleep') as SleepLog[];
        const todayHydrateLog = todos.find(t => t.type === 'hydrate') as HydrateLog | undefined;
        const todayDietLog = todos.find(t => t.type === 'diet') as DietLog | undefined;
        const wakeUpLog = todaySleepLogs.find(log => log.task_type === 'wakeup');
        const sleepLog = todaySleepLogs.find(log => log.task_type === 'sleep');

        const getIconBackgroundStyle = (item: HydrateLog | DietLog | FocusLog | undefined, habitType: 'hydrate' | 'diet' | 'focus'): React.CSSProperties => {
            if (!item && habitType !== 'focus') return {};
            let consumed, goal;
            if (habitType === 'hydrate' && item?.type === 'hydrate') { consumed = (item as HydrateLog).consumed_water; goal = (item as HydrateLog).water_goal; }
            else if (habitType === 'diet' && item?.type === 'diet') { consumed = (item as DietLog).consumed_calories; goal = (item as DietLog).calories_goal; }
            else if (habitType === 'focus' && todayFocusLog) { consumed = todayFocusLog.focus_done; goal = focusHabit?.focus_goal; }
            else { return {}; }
            const percentage = calculatePercentage(consumed, goal);
            let progressColor = 'var(--icon-background-default)';
            if (habitType === 'hydrate') progressColor = 'var(--hydrate-progress-color)';
            else if (habitType === 'diet') progressColor = 'var(--diet-progress-color)';
            else if (habitType === 'focus') progressColor = 'var(--color-pastel-purple)';
            return { background: `linear-gradient(to top, ${progressColor} ${percentage}%, var(--icon-background-default) ${percentage}%)` };
        };

        const completedClass = (log: SleepLog | HydrateLog | DietLog | FocusLog | undefined): string => log?.completed ? styles.completed : '';

        let icon: React.ReactNode;
        let textLine1: string = '';
        let textLine2: string = '';
        let circleStyle: React.CSSProperties = {};
        let baseCircleClasses = `${styles.iconCircle}`; // Base class for the circle visual
        let logId: string | undefined = undefined;
        let isCompleted = false;
        let clickHandler: (() => Promise<void> | void) | undefined = undefined;
        let ariaLabel = '';
        let isInteractive = false;

        switch (type) {
            case 'wakeup':
                icon = <FaSun />; textLine1 = 'Wake-up';
                textLine2 = sleepHabit ? formatTime(sleepHabit.wakeup_time) : 'N/A';
                logId = wakeUpLog?.id; isCompleted = !!wakeUpLog?.completed;
                baseCircleClasses += ` ${styles.wakeup} ${isCompleted ? styles.completed : ''}`;
                if (logId && !isCompleted) { clickHandler = () => onCompleteSleep(logId as string); isInteractive = true; }
                ariaLabel = isCompleted ? `Wake up completed at ${textLine2}` : `Mark wake up at ${textLine2} as complete`;
                break;
            case 'sleep':
                icon = <FaBed />; textLine1 = 'Sleep';
                textLine2 = sleepHabit ? formatTime(sleepHabit.sleep_time) : 'N/A';
                logId = sleepLog?.id; isCompleted = !!sleepLog?.completed;
                 baseCircleClasses += ` ${styles.sleep} ${isCompleted ? styles.completed : ''}`;
                if (logId && !isCompleted) { clickHandler = () => onCompleteSleep(logId as string); isInteractive = true; }
                ariaLabel = isCompleted ? `Sleep completed at ${textLine2}` : `Mark sleep at ${textLine2} as complete`;
                break;
            case 'hydrate':
                icon = <FaGlassWater />; textLine1 = 'Hydration';
                textLine2 = `${formatAmount(todayHydrateLog?.consumed_water, 'ml', false)} / ${formatAmount(todayHydrateLog?.water_goal, 'ml')}`;
                logId = todayHydrateLog?.id; isCompleted = !!todayHydrateLog?.completed;
                circleStyle = getIconBackgroundStyle(todayHydrateLog, 'hydrate');
                 baseCircleClasses += ` ${completedClass(todayHydrateLog)}`; // Add completed class if needed
                if (logId) { clickHandler = () => onUpdateHydrate(logId as string); isInteractive = true; }
                ariaLabel = `Add ${formatAmount(todayHydrateLog?.cup_size, 'ml')} water. Current: ${textLine2}`;
                break;
            case 'diet':
                icon = <FaUtensils />; textLine1 = 'Diet';
                textLine2 = `${formatAmount(todayDietLog?.consumed_calories, 'kcal', false)} / ${formatAmount(todayDietLog?.calories_goal, 'kcal')}`;
                logId = todayDietLog?.id; isCompleted = !!todayDietLog?.completed;
                circleStyle = getIconBackgroundStyle(todayDietLog, 'diet');
                 baseCircleClasses += ` ${completedClass(todayDietLog)}`; // Add completed class if needed
                if (logId) { clickHandler = () => onUpdateDiet(logId as string); isInteractive = true; }
                ariaLabel = `Log food. Current: ${textLine2}`;
                break;
            case 'focus':
                icon = <FaBrain />; textLine1 = 'Focus';
                textLine2 = `${todayFocusLog?.focus_done || 0} / ${focusHabit?.focus_goal || '...'} min`;
                isCompleted = !!todayFocusLog?.completed;
                circleStyle = getIconBackgroundStyle(todayFocusLog ?? undefined, 'focus');
                 baseCircleClasses += ` ${completedClass(todayFocusLog ?? undefined)}`; // Add completed class if needed
                clickHandler = onToggleFocusView;
                isInteractive = true; // Focus icon is always interactive to open timer
                ariaLabel = 'Open focus timer';
                break;
        }

        const isLoadingThis = logId ? isUpdating[logId] ?? false : false;
        // Disable completed sleep/wake. Allow re-clicking hydrate/diet/focus.
        const isDisabled = isLoadingThis || (isCompleted && !['hydrate', 'diet', 'focus'].includes(type));

        // The outer div is ONLY for layout positioning
        return (
            <div className={`${styles.habitIconWrapper} ${isCompleted ? styles.completed : ''} ${isDisabled ? styles.disabledHabitVisual : ''} `}>
                {/* The interactive element is the circle itself */}
                {isInteractive ? (
                    <button
                        className={`${baseCircleClasses} ${isLoadingThis ? styles.loadingHabitVisual : ''}`} // Apply base + loading styles
                        style={circleStyle}
                        onClick={!isDisabled ? clickHandler : undefined}
                        disabled={isDisabled}
                        aria-label={ariaLabel}
                    >
                        <span className={styles.iconSymbol}>{icon}</span>
                    </button>
                ) : (
                    <div className={baseCircleClasses} style={circleStyle} aria-label={ariaLabel}>
                        <span className={styles.iconSymbol}>{icon}</span>
                    </div>
                )}

                {/* Text is always outside the interactive element */}
                {textLine1 && (
                    <span className={styles.habitText}>
                        {textLine1}<br />
                        <span className={styles.habitProgressText}>
                            {textLine2}
                            {isCompleted && type !== 'focus'} {/* Add checkmark visually here */}
                        </span>
                    </span>
                )}
            </div>
        );
    };
    // --- End Internal Render Logic ---

    // Grid structure for 5 icons
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