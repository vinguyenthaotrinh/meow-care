// src/components/settings/HabitSettings.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { fetchApi } from '../../lib/api';
// Add FocusHabit to imports
import { SleepHabit, HydrateHabit, DietHabit, FocusHabit } from '../../types/habit.types';
import styles from '../../styles/Settings.module.css';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';

const HabitSettings = () => {
    // State for each habit type
    const [sleepData, setSleepData] = useState<Partial<SleepHabit>>({});
    const [hydrateData, setHydrateData] = useState<Partial<HydrateHabit>>({});
    const [dietData, setDietData] = useState<Partial<DietHabit>>({});
    const [focusData, setFocusData] = useState<Partial<FocusHabit>>({}); // **** NEW STATE for Focus ****

    // Reminder times state (Keep as is)
    const [hydrateReminders, setHydrateReminders] = useState<string[]>([]);
    const [dietReminders, setDietReminders] = useState<string[]>([]);

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<Record<string, boolean>>({
        sleep: false, hydrate: false, diet: false, focus: false // **** ADD 'focus' ****
    });

    // Error/Success states (Keep as is - toasts handle messages)
    const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

    // Fetch all habits on mount
    useEffect(() => {
        const fetchHabits = async () => {
            setIsLoading(true);
            setInitialLoadError(null);
            let fetchError = null;
            try {
                // **** Add Focus fetch ****
                const [sleepRes, hydrateRes, dietRes, focusRes] = await Promise.all([
                    fetchApi<SleepHabit>('/sleep/habit', { isProtected: true }),
                    fetchApi<HydrateHabit>('/hydrate/habit', { isProtected: true }),
                    fetchApi<DietHabit>('/diet/habit', { isProtected: true }),
                    fetchApi<FocusHabit>('/focus/habit', { isProtected: true }), // **** FETCH FOCUS ****
                ]);

                // Process Sleep
                if (sleepRes.data) setSleepData(sleepRes.data);
                else if (sleepRes.status !== 404) fetchError = `Sleep: ${sleepRes.error || 'Failed to load'}`;

                // Process Hydrate
                if (hydrateRes.data) {
                    setHydrateData(hydrateRes.data);
                    setHydrateReminders(hydrateRes.data.reminder_time || []);
                } else if (hydrateRes.status !== 404) fetchError = `${fetchError ? fetchError + '; ' : ''}Hydrate: ${hydrateRes.error || 'Failed to load'}`;

                // Process Diet
                if (dietRes.data) {
                    setDietData(dietRes.data);
                    setDietReminders(dietRes.data.reminder_time || []);
                } else if (dietRes.status !== 404) fetchError = `${fetchError ? fetchError + '; ' : ''}Diet: ${dietRes.error || 'Failed to load'}`;

                // **** Process Focus ****
                if (focusRes.data) {
                    setFocusData(focusRes.data);
                } else if (focusRes.status !== 404) fetchError = `${fetchError ? fetchError + '; ' : ''}Focus: ${focusRes.error || 'Failed to load'}`;
                // **** End Process Focus ****

                if (fetchError) {
                    setInitialLoadError(fetchError);
                    toast.error(`Error loading habits: ${fetchError}`);
                }

            } catch (err: any) {
                 console.error("Error fetching habits:", err);
                 const errorMsg = 'Could not load habit settings.';
                 setInitialLoadError(errorMsg);
                 toast.error(errorMsg);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHabits();
    }, []);

    // Reminder Handlers (Keep as is)
    const handleAddReminder = (habitType: 'hydrate' | 'diet') => { /* ... */ };
    const handleRemoveReminder = (habitType: 'hydrate' | 'diet', index: number) => { /* ... */ };
    const handleReminderChange = (e: React.ChangeEvent<HTMLInputElement>, habitType: 'hydrate' | 'diet', index: number) => { /* ... */ };
    // --- End Reminder Handlers ---


    // Generic input handler - UPDATED for focus
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        habitType: 'sleep' | 'hydrate' | 'diet' | 'focus' // **** ADD 'focus' ****
    ) => {
        const { name, value, type } = e.target;
        // **** ADD focus setter ****
        const setterMap = { sleep: setSleepData, hydrate: setHydrateData, diet: setDietData, focus: setFocusData };
        const setter = setterMap[habitType];

        setter(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value
        }));
    };


    // --- Save Handler - UPDATED for focus ---
    const handleSaveHabit = async (
        e: FormEvent,
        habitType: 'sleep' | 'hydrate' | 'diet' | 'focus' // **** ADD 'focus' ****
    ) => {
        e.preventDefault();
        setIsSaving(prev => ({ ...prev, [habitType]: true }));
        // Removed error/success state setting - use toasts

        // **** ADD focus endpoint/data ****
        const endpointMap = {
            sleep: '/sleep/habit', hydrate: '/hydrate/habit',
            diet: '/diet/habit', focus: '/focus/habit'
        };
        const dataMap = { sleep: sleepData, hydrate: hydrateData, diet: dietData, focus: focusData };

        // Include reminders if needed
        let dataToSend = { ...dataMap[habitType] };
         if (habitType === 'hydrate') dataToSend.reminder_time = hydrateReminders;
         else if (habitType === 'diet') dataToSend.reminder_time = dietReminders;

        // --- Validation ---
        let validationError: string | null = null;
        if (habitType === 'sleep' && (!dataToSend.sleep_time || !dataToSend.wakeup_time)) { validationError = 'Wake up and sleep times are required.'; }
        if (habitType === 'hydrate') { if (!dataToSend.water_goal || dataToSend.water_goal <= 0) validationError = 'Valid Water Goal (> 0) is required.'; else if (!dataToSend.cup_size || dataToSend.cup_size <= 0) validationError = 'Valid Cup Size (> 0) is required.'; }
        if (habitType === 'diet' && (!dataToSend.calories_goal || dataToSend.calories_goal <= 0)) { validationError = 'Valid Calorie Goal (> 0) is required.'; }
        // **** ADD focus validation ****
        if (habitType === 'focus' && (!dataToSend.focus_goal || dataToSend.focus_goal <= 0 || !Number.isInteger(dataToSend.focus_goal))) { validationError = 'Valid positive integer Focus Goal (minutes) is required.'; }
        // **** End focus validation ****

        if (validationError) {
            toast.error(validationError);
            setIsSaving(prev => ({ ...prev, [habitType]: false }));
            return;
        }
        // --- End Validation ---

        try {
            const response = await fetchApi(endpointMap[habitType], {
                method: 'PUT', isProtected: true, body: dataToSend,
            });

            if (response.data) {
                toast.success(`${habitType.charAt(0).toUpperCase() + habitType.slice(1)} habit saved successfully!`);
                // Optional: Update local state after save if backend response differs
                // const setter = setterMap[habitType];
                // setter(response.data);
                // if (habitType === 'hydrate') setHydrateReminders(response.data.reminder_time || []);
                // if (habitType === 'diet') setDietReminders(response.data.reminder_time || []);
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


    if (isLoading) { return <div className={styles.loadingContainer}><LoadingSpinner /></div>; }
    if (initialLoadError && !sleepData.sleep_time && !hydrateData.water_goal && !dietData.calories_goal && !focusData.focus_goal) { // Check if all failed
         return <p className={styles.formError} style={{margin: '2rem'}}>{initialLoadError}</p>;
     }

    return (
        <div className={styles.settingsSection}>
            <h3 className={styles.sectionTitle}>Habit Settings</h3>
            <p className={styles.sectionDescription}>Set your daily goals. Saving will reset today's progress for that habit.</p>

            {/* --- Sleep Form (Keep as is) --- */}
            <form onSubmit={(e) => handleSaveHabit(e, 'sleep')} className={styles.subForm}>
                {/* ... sleep form elements ... */}
                 <h4 className={styles.subFormTitle}>Sleep</h4>
                <div className={styles.formGroup}>
                    <label htmlFor="sleep_time">Target Sleep Time:</label>
                    <input type="time" id="sleep_time" name="sleep_time" value={sleepData.sleep_time || ''} onChange={(e) => handleInputChange(e, 'sleep')} disabled={isSaving.sleep} required className={styles.formInput} />
                </div>
                 <div className={styles.formGroup}>
                    <label htmlFor="wakeup_time">Target Wake Up Time:</label>
                    <input type="time" id="wakeup_time" name="wakeup_time" value={sleepData.wakeup_time || ''} onChange={(e) => handleInputChange(e, 'sleep')} disabled={isSaving.sleep} required className={styles.formInput} />
                </div>
                <div className={styles.formActions}>
                    <button type="submit" disabled={isSaving.sleep} className={`${styles.formButton} ${styles.formButtonPrimary}`}> {isSaving.sleep ? <LoadingSpinner inline /> : 'Save Sleep Habit'} </button>
                </div>
            </form>
            <hr className={styles.divider} />

            {/* --- Hydrate Form (Keep as is, including reminders) --- */}
            <form onSubmit={(e) => handleSaveHabit(e, 'hydrate')} className={styles.subForm}>
                {/* ... hydrate form elements + reminder section ... */}
                 <h4 className={styles.subFormTitle}>Hydration</h4>
                 <div className={styles.formGroup}>
                    <label htmlFor="water_goal">Daily Water Goal (ml):</label>
                    <input type="number" id="water_goal" name="water_goal" min="1" step="50" value={hydrateData.water_goal || ''} onChange={(e) => handleInputChange(e, 'hydrate')} disabled={isSaving.hydrate} required className={styles.formInput} />
                 </div>
                 <div className={styles.formGroup}>
                     <label htmlFor="cup_size">Default Cup Size (ml):</label>
                    <input type="number" id="cup_size" name="cup_size" min="1" step="10" value={hydrateData.cup_size || ''} onChange={(e) => handleInputChange(e, 'hydrate')} disabled={isSaving.hydrate} required className={styles.formInput} />
                 </div>
                 <div className={styles.formGroup}>
                    <label>Reminders:</label>
                    {hydrateReminders.length === 0 && <p className={styles.noReminders}>No reminders set.</p>}
                    <div className={styles.remindersList}> {hydrateReminders.map((time, index) => ( <div key={`hydrate-${index}`} className={styles.reminderItem}> <input type="time" value={time} onChange={(e) => handleReminderChange(e, 'hydrate', index)} disabled={isSaving.hydrate} className={styles.formInput} /> <button type="button" onClick={() => handleRemoveReminder('hydrate', index)} disabled={isSaving.hydrate} className={styles.removeReminderButton} aria-label={`Remove ${time} reminder`}>×</button> </div> ))} </div>
                    <button type="button" onClick={() => handleAddReminder('hydrate')} disabled={isSaving.hydrate} className={styles.addReminderButton}> + Add Reminder </button>
                 </div>
                 <div className={styles.formActions}> <button type="submit" disabled={isSaving.hydrate} className={`${styles.formButton} ${styles.formButtonPrimary}`}> {isSaving.hydrate ? <LoadingSpinner inline /> : 'Save Hydrate Habit'} </button> </div>
            </form>
            <hr className={styles.divider} />

            {/* --- Diet Form (Keep as is, including reminders) --- */}
            <form onSubmit={(e) => handleSaveHabit(e, 'diet')} className={styles.subForm}>
                {/* ... diet form elements + reminder section ... */}
                  <h4 className={styles.subFormTitle}>Diet</h4>
                 <div className={styles.formGroup}>
                     <label htmlFor="calories_goal">Daily Calorie Goal (kcal):</label>
                    <input type="number" id="calories_goal" name="calories_goal" min="1" step="50" value={dietData.calories_goal || ''} onChange={(e) => handleInputChange(e, 'diet')} disabled={isSaving.diet} required className={styles.formInput} />
                 </div>
                 <div className={styles.formGroup}>
                    <label>Reminders:</label>
                     {dietReminders.length === 0 && <p className={styles.noReminders}>No reminders set.</p>}
                    <div className={styles.remindersList}> {dietReminders.map((time, index) => ( <div key={`diet-${index}`} className={styles.reminderItem}> <input type="time" value={time} onChange={(e) => handleReminderChange(e, 'diet', index)} disabled={isSaving.diet} className={styles.formInput} /> <button type="button" onClick={() => handleRemoveReminder('diet', index)} disabled={isSaving.diet} className={styles.removeReminderButton} aria-label={`Remove ${time} reminder`}> × </button> </div> ))} </div>
                    <button type="button" onClick={() => handleAddReminder('diet')} disabled={isSaving.diet} className={styles.addReminderButton}> + Add Reminder </button>
                 </div>
                  <div className={styles.formActions}> <button type="submit" disabled={isSaving.diet} className={`${styles.formButton} ${styles.formButtonPrimary}`}> {isSaving.diet ? <LoadingSpinner inline /> : 'Save Diet Habit'} </button> </div>
            </form>
             <hr className={styles.divider} /> {/* Optional divider before Focus */}

            {/* **** NEW: Focus Form **** */}
            <form onSubmit={(e) => handleSaveHabit(e, 'focus')} className={styles.subForm}>
                 <h4 className={styles.subFormTitle}>Focus</h4>
                 <div className={styles.formGroup}>
                     <label htmlFor="focus_goal">Daily Focus Goal (minutes):</label>
                    <input
                        type="number" id="focus_goal" name="focus_goal" min="5" step="5" // Example: min 5 min, step 5 min
                        value={focusData.focus_goal || ''} // Use focusData state
                        onChange={(e) => handleInputChange(e, 'focus')} // Use focus handler
                        disabled={isSaving.focus} // Use focus saving state
                        required
                        className={styles.formInput}
                        placeholder="e.g., 60"
                    />
                 </div>
                 <div className={styles.formActions}>
                     <button type="submit" disabled={isSaving.focus} className={`${styles.formButton} ${styles.formButtonPrimary}`}>
                         {isSaving.focus ? <LoadingSpinner inline /> : 'Save Focus Habit'}
                     </button>
                 </div>
            </form>
            {/* **** END NEW Focus Form **** */}

        </div>
    );
};

export default HabitSettings;