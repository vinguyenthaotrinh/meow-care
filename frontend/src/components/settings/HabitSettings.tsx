// src/components/settings/HabitSettings.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { fetchApi } from '../../lib/api';
import { SleepHabit, HydrateHabit, DietHabit } from '../../types/habit.types';
import styles from '../../styles/Settings.module.css';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';

const HabitSettings = () => {
    // State for habit data
    const [sleepData, setSleepData] = useState<Partial<SleepHabit>>({});
    const [hydrateData, setHydrateData] = useState<Partial<HydrateHabit>>({});
    const [dietData, setDietData] = useState<Partial<DietHabit>>({});

    // State for Reminder Times
    const [hydrateReminders, setHydrateReminders] = useState<string[]>([]);
    const [dietReminders, setDietReminders] = useState<string[]>([]);

    // Loading states
    const [isLoading, setIsLoading] = useState(true); // Initial loading
    const [isSaving, setIsSaving] = useState<Record<string, boolean>>({ sleep: false, hydrate: false, diet: false });

    // Initial Load Error state
    const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHabits = async () => {
            setIsLoading(true);
            setInitialLoadError(null);
            let errorOccurred = false;
            try {
                const [sleepRes, hydrateRes, dietRes] = await Promise.all([
                    fetchApi<SleepHabit>('/sleep/habit', { isProtected: true }),
                    fetchApi<HydrateHabit>('/hydrate/habit', { isProtected: true }),
                    fetchApi<DietHabit>('/diet/habit', { isProtected: true }),
                ]);

                if (sleepRes.data) setSleepData(sleepRes.data);
                else if (sleepRes.status !== 404) errorOccurred = true;

                if (hydrateRes.data) {
                    setHydrateData(hydrateRes.data);
                    setHydrateReminders(hydrateRes.data.reminder_time || []);
                } else if (hydrateRes.status !== 404) errorOccurred = true;

                if (dietRes.data) {
                    setDietData(dietRes.data);
                    setDietReminders(dietRes.data.reminder_time || []);
                } else if (dietRes.status !== 404) errorOccurred = true;

                if (errorOccurred) {
                     const errorMsg = "Failed to load some habit settings.";
                     setInitialLoadError(errorMsg);
                     toast.error(errorMsg);
                }

            } catch (err: any) {
                 console.error("Error fetching habits:", err);
                 const errorMsg = "An unexpected error occurred while loading habits.";
                 setInitialLoadError(errorMsg);
                 toast.error(errorMsg);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHabits();
    }, []);

    // --- Reminder Handlers ---
    const handleAddReminder = (habitType: 'hydrate' | 'diet') => {
        const setter = habitType === 'hydrate' ? setHydrateReminders : setDietReminders;
        setter(prev => [...prev, "09:00"]);
    };

    const handleRemoveReminder = (habitType: 'hydrate' | 'diet', index: number) => {
        const setter = habitType === 'hydrate' ? setHydrateReminders : setDietReminders;
        setter(prev => prev.filter((_, i) => i !== index));
    };

    const handleReminderChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        habitType: 'hydrate' | 'diet',
        index: number
    ) => {
        const setter = habitType === 'hydrate' ? setHydrateReminders : setDietReminders;
        const newTime = e.target.value;
        setter(prev => prev.map((time, i) => (i === index ? newTime : time)));
    };
    // --- End Reminder Handlers ---

    // Generic input handler for habit data
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        habitType: 'sleep' | 'hydrate' | 'diet'
    ) => {
        const { name, value, type } = e.target;
        const setterMap = { sleep: setSleepData, hydrate: setHydrateData, diet: setDietData };
        const setter = setterMap[habitType];

        setter(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value
        }));
    };

    const handleSaveHabit = async (
        e: FormEvent,
        habitType: 'sleep' | 'hydrate' | 'diet'
    ) => {
        e.preventDefault();

        const endpointMap = { sleep: '/sleep/habit', hydrate: '/hydrate/habit', diet: '/diet/habit' };
        const dataMap = { sleep: sleepData, hydrate: hydrateData, diet: dietData };

        // Prepare data, including reminders
        let dataToSend: any = { ...dataMap[habitType] };
         if (habitType === 'hydrate') {
            dataToSend.reminder_time = hydrateReminders.filter(time => !!time); // Filter empty strings
        } else if (habitType === 'diet') {
            dataToSend.reminder_time = dietReminders.filter(time => !!time); // Filter empty strings
        }

        // --- Validation ---
        let validationError: string | null = null;
        if (habitType === 'sleep') {
            if (!dataToSend.sleep_time) validationError = 'Target Sleep Time is required.';
            else if (!dataToSend.wakeup_time) validationError = 'Target Wake Up Time is required.';
        } else if (habitType === 'hydrate') {
             const goal = dataToSend.water_goal;
             const cup = dataToSend.cup_size;
            if (goal === undefined || goal === null || isNaN(goal) || goal <= 0) validationError = 'Valid Water Goal (ml) is required.';
            else if (cup === undefined || cup === null || isNaN(cup) || cup <= 0) validationError = 'Valid Cup Size (ml) is required.';
        } else if (habitType === 'diet') {
             const goal = dataToSend.calories_goal;
            if (goal === undefined || goal === null || isNaN(goal) || goal <= 0) validationError = 'Valid Calorie Goal (kcal) is required.';
        }

        if (validationError) {
            toast.error(validationError);
            return;
        }
        // --- End Validation ---

        setIsSaving(prev => ({ ...prev, [habitType]: true }));
        try {
            const response = await fetchApi(endpointMap[habitType], {
                method: 'PUT',
                isProtected: true,
                body: dataToSend,
            });

            if (response.data) {
                toast.success(`${habitType.charAt(0).toUpperCase() + habitType.slice(1)} habit saved successfully!`);
                 if (habitType === 'hydrate' && response.data.reminder_time) setHydrateReminders(response.data.reminder_time);
                 if (habitType === 'diet' && response.data.reminder_time) setDietReminders(response.data.reminder_time);
            } else {
                toast.error(response.error || `Failed to save ${habitType} habit.`);
            }
        } catch(err) {
            console.error(`Error saving ${habitType} habit:`, err);
            toast.error(`An unexpected error occurred while saving the ${habitType} habit.`);
        } finally {
             setIsSaving(prev => ({ ...prev, [habitType]: false }));
        }
    };

    if (isLoading) {
        return (
            <div className={styles.settingsSection}>
                <div className={styles.loadingContainer}>
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (initialLoadError) {
        return (
           <div className={styles.settingsSection}>
                 <p className={styles.formError} style={{marginTop: '2rem'}}>Error: {initialLoadError}</p>
            </div>
        );
    }

    return (
        <div className={styles.settingsSection}>
            <h3 className={styles.sectionTitle}>Habit Settings</h3>
            <p className={styles.sectionDescription}>Set your daily goals. Saving will reset today's progress for that habit.</p>

            {/* --- Sleep Form --- */}
            <form onSubmit={(e) => handleSaveHabit(e, 'sleep')} className={styles.subForm}>
                <h4 className={styles.subFormTitle}>Sleep</h4>
                <div className={styles.formGroup}>
                    <label htmlFor="sleep_time">Target Sleep Time:</label>
                    <input type="time" id="sleep_time" name="sleep_time"
                        value={sleepData.sleep_time || ''}
                        onChange={(e) => handleInputChange(e, 'sleep')}
                        disabled={isSaving.sleep} required className={styles.formInput}
                    />
                </div>
                 <div className={styles.formGroup}>
                    <label htmlFor="wakeup_time">Target Wake Up Time:</label>
                    <input type="time" id="wakeup_time" name="wakeup_time"
                        value={sleepData.wakeup_time || ''}
                        onChange={(e) => handleInputChange(e, 'sleep')}
                        disabled={isSaving.sleep} required className={styles.formInput}
                    />
                </div>
                <div className={styles.formActions}>
                    <button type="submit" disabled={isSaving.sleep} className={`${styles.formButton} ${styles.formButtonPrimary}`}>
                        Save Sleep Habit {/* Only Text */}
                    </button>
                </div>
            </form>

            <hr className={styles.divider} />

            {/* --- Hydrate Form --- */}
            <form onSubmit={(e) => handleSaveHabit(e, 'hydrate')} className={styles.subForm}>
                 <h4 className={styles.subFormTitle}>Hydration</h4>
                 <div className={styles.formGroup}>
                    <label htmlFor="water_goal">Daily Water Goal (ml):</label>
                    <input type="number" id="water_goal" name="water_goal" min="1" step="1"
                        value={hydrateData.water_goal ?? ''}
                        onChange={(e) => handleInputChange(e, 'hydrate')}
                        disabled={isSaving.hydrate} required className={styles.formInput}
                    />
                 </div>
                 <div className={styles.formGroup}>
                     <label htmlFor="cup_size">Default Cup Size (ml):</label>
                    <input type="number" id="cup_size" name="cup_size" min="1" step="1"
                        value={hydrateData.cup_size ?? ''}
                        onChange={(e) => handleInputChange(e, 'hydrate')}
                        disabled={isSaving.hydrate} required className={styles.formInput}
                    />
                 </div>
                 <div className={styles.formGroup}>
                    <label>Reminders:</label>
                    {hydrateReminders.length === 0 && <p className={styles.noReminders}>No reminders set.</p>}
                    <div className={styles.remindersList}>
                        {hydrateReminders.map((time, index) => (
                            <div key={`hydrate-${index}`} className={styles.reminderItem}>
                                <input type="time" value={time} required
                                    onChange={(e) => handleReminderChange(e, 'hydrate', index)}
                                    disabled={isSaving.hydrate} className={styles.formInput}
                                />
                                <button type="button"
                                    onClick={() => handleRemoveReminder('hydrate', index)}
                                    disabled={isSaving.hydrate} className={styles.removeReminderButton}
                                    aria-label={`Remove ${time || 'empty'} reminder`}
                                > × </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={() => handleAddReminder('hydrate')}
                        disabled={isSaving.hydrate} className={styles.addReminderButton}
                    > + Add Reminder </button>
                 </div>
                 <div className={styles.formActions}>
                     <button type="submit" disabled={isSaving.hydrate} className={`${styles.formButton} ${styles.formButtonPrimary}`}>
                         Save Hydrate Habit {/* Only Text */}
                     </button>
                 </div>
            </form>

             <hr className={styles.divider} />

            {/* --- Diet Form --- */}
            <form onSubmit={(e) => handleSaveHabit(e, 'diet')} className={styles.subForm}>
                 <h4 className={styles.subFormTitle}>Diet</h4>
                 <div className={styles.formGroup}>
                     <label htmlFor="calories_goal">Daily Calorie Goal (kcal):</label>
                    <input type="number" id="calories_goal" name="calories_goal" min="1" step="1"
                        value={dietData.calories_goal ?? ''}
                        onChange={(e) => handleInputChange(e, 'diet')}
                        disabled={isSaving.diet} required className={styles.formInput}
                    />
                 </div>
                 <div className={styles.formGroup}>
                    <label>Reminders:</label>
                     {dietReminders.length === 0 && <p className={styles.noReminders}>No reminders set.</p>}
                    <div className={styles.remindersList}>
                        {dietReminders.map((time, index) => (
                            <div key={`diet-${index}`} className={styles.reminderItem}>
                                <input type="time" value={time} required
                                    onChange={(e) => handleReminderChange(e, 'diet', index)}
                                    disabled={isSaving.diet} className={styles.formInput}
                                />
                                <button type="button"
                                    onClick={() => handleRemoveReminder('diet', index)}
                                    disabled={isSaving.diet} className={styles.removeReminderButton}
                                    aria-label={`Remove ${time || 'empty'} reminder`}
                                > × </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={() => handleAddReminder('diet')}
                        disabled={isSaving.diet} className={styles.addReminderButton}
                    > + Add Reminder </button>
                 </div>
                 <div className={styles.formActions}>
                     <button type="submit" disabled={isSaving.diet} className={`${styles.formButton} ${styles.formButtonPrimary}`}>
                         Save Diet Habit {/* Only Text */}
                     </button>
                 </div>
            </form>
        </div>
    );
};

export default HabitSettings;