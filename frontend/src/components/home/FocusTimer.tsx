// src/components/home/FocusTimer.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from '@/styles/Home.module.css'; // Reuse Home styles for consistency
import { FaArrowUp, FaArrowDown, FaPlay, FaPause, FaCheck } from 'react-icons/fa';
import { fetchApi } from '@/lib/api';
import { FocusHabit, FocusLog } from '@/types/habit.types';
import { toast } from 'react-toastify';

interface FocusTimerProps {
    focusHabit: FocusHabit | null;
    todayFocusLog: FocusLog | null; // Pass today's log to know initial progress
    onFocusSessionComplete: (minutesCompleted: number, logId: string) => void; // Callback to update backend
    initialFocusDuration?: number; // Default focus duration if no habit
}

type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

const MIN_DURATION = 1; // Minimum 1 minutes
const MAX_DURATION = 120; // Maximum 120 minutes
const DURATION_STEP = 1; // Increment/decrement by 1 minutes

const FocusTimer: React.FC<FocusTimerProps> = ({
    focusHabit,
    todayFocusLog,
    onFocusSessionComplete,
    initialFocusDuration = 25 // Default to 25 minutes
}) => {
    const [duration, setDuration] = useState(initialFocusDuration); // Current set duration for the timer
    const [timeLeft, setTimeLeft] = useState(duration * 60); // Time left in seconds
    const [status, setStatus] = useState<TimerStatus>('idle');
    const [sessionMinutesCompleted, setSessionMinutesCompleted] = useState(0);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize duration from habit or default
    useEffect(() => {
        const initial = focusHabit?.focus_goal || initialFocusDuration;
        setDuration(initial);
        setTimeLeft(initial * 60);
    }, [focusHabit, initialFocusDuration]);

    // Timer logic
    useEffect(() => {
        if (status === 'running') {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(intervalRef.current!);
                        setStatus('finished');
                        setSessionMinutesCompleted(duration); // Record full duration completed
                        // Play a sound or notification if desired
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [status, duration]); // Add duration here, so if duration changes while running, it resets (or adjust logic)


    const handleDurationChange = (increment: boolean) => {
        if (status !== 'idle') return; // Only change when idle
        setDuration((prevDuration) => {
            const newDuration = increment
                ? Math.min(prevDuration + DURATION_STEP, MAX_DURATION)
                : Math.max(prevDuration - DURATION_STEP, MIN_DURATION);
            setTimeLeft(newDuration * 60);
            return newDuration;
        });
    };

    const handleStart = () => {
        if (status === 'idle' || status === 'paused') {
            setStatus('running');
            // If starting from idle, reset session completed minutes.
            // If resuming, it continues from where it was.
            if (status === 'idle') {
                setSessionMinutesCompleted(0);
                setTimeLeft(duration * 60); // Reset timeLeft to full duration
            }
        }
    };

    const handlePause = () => {
        if (status === 'running') {
            setStatus('paused');
            // Calculate minutes completed so far in this session segment
            const elapsedSecondsThisSegment = (duration * 60) - timeLeft;
            setSessionMinutesCompleted(prev => prev + Math.floor(elapsedSecondsThisSegment / 60));
        }
    };

    const handleResume = () => {
        if (status === 'paused') {
            setStatus('running');
        }
    };

    const handleDone = async () => {
        if (!todayFocusLog) {
            toast.error("Focus log not found for today. Cannot save progress.");
            setStatus('idle');
            setTimeLeft(duration * 60);
            return;
        }
        // Here, sessionMinutesCompleted should hold the total minutes from this timer session
        onFocusSessionComplete(sessionMinutesCompleted, todayFocusLog.id);
        setStatus('idle');
        setTimeLeft(duration * 60); // Reset for next session
        setSessionMinutesCompleted(0); // Reset session specific counter
    };


    const formatDisplayTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} min`;
    };

    return (
        <div className={styles.focusTimerContainer}>
            <div className={styles.focusTimeDisplayControls}>
                <button
                    onClick={() => handleDurationChange(false)}
                    disabled={status !== 'idle'}
                    className={styles.focusDurationButton}
                    aria-label="Decrease focus duration"
                >
                    <FaArrowDown />
                </button>
                <h2 className={styles.focusTimeDisplay}>{formatDisplayTime(timeLeft)}</h2>
                <button
                    onClick={() => handleDurationChange(true)}
                    disabled={status !== 'idle'}
                    className={styles.focusDurationButton}
                    aria-label="Increase focus duration"
                >
                    <FaArrowUp />
                </button>
            </div>

            <div className={styles.focusTimerActions}>
                {status === 'idle' && (
                    <button onClick={handleStart} className={`${styles.focusActionButton} ${styles.focusStartButton}`}>
                        <FaPlay style={{ marginRight: '0.5rem' }} /> Start
                    </button>
                )}
                {status === 'running' && (
                    <button onClick={handlePause} className={`${styles.focusActionButton} ${styles.focusPauseButton}`}>
                        <FaPause style={{ marginRight: '0.5rem' }} /> Pause
                    </button>
                )}
                {status === 'paused' && (
                    <button onClick={handleResume} className={`${styles.focusActionButton} ${styles.focusResumeButton}`}>
                        <FaPlay style={{ marginRight: '0.5rem' }} /> Resume
                    </button>
                )}
                {status === 'finished' && (
                    <button onClick={handleDone} className={`${styles.focusActionButton} ${styles.focusDoneButton}`}>
                        <FaCheck style={{ marginRight: '0.5rem' }} /> Done
                    </button>
                )}
            </div>

            <p className={styles.focusNote}>
                Note: If you close this tab, your focus session progress will not be saved until you press "Done"
            </p>

            {/* Optional: Display today's total focus time from logs */}
            {todayFocusLog && status === 'idle' && (
                <p className={styles.focusTotalToday}>
                    Today's total focus: {todayFocusLog.focus_done} / {focusHabit?.focus_goal || duration} min
                    {todayFocusLog.completed && " (Goal Reached!)"}
                </p>
            )}
        </div>
    );
};

export default FocusTimer;