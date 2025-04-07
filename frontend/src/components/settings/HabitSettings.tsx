// src/components/settings/HabitSettings.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { fetchApi } from '../../lib/api';
import { SleepHabit, HydrateHabit, DietHabit } from '../../types/habit.types';
import styles from '../../styles/Settings.module.css';
import LoadingSpinner from "../common/LoadingSpinner";

const HabitSettings = () => {
    // State for each habit type
    const [sleepData, setSleepData] = useState<Partial<SleepHabit>>({});
    const [hydrateData, setHydrateData] = useState<Partial<HydrateHabit>>({});
    const [dietData, setDietData] = useState<Partial<DietHabit>>({});

    // Loading states
    const [isLoading, setIsLoading] = useState(true); // Initial loading
    const [isSaving, setIsSaving] = useState<Record<string, boolean>>({ // Saving per habit
        sleep: false, hydrate: false, diet: false
    });

    // Error/Success states
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [successMessages, setSuccessMessages] = useState<Record<string, string | null>>({});

    // Fetch all habits on mount
    useEffect(() => {
        const fetchHabits = async () => {
            setIsLoading(true);
            setErrors({});
            try {
                const [sleepRes, hydrateRes, dietRes] = await Promise.all([
                    fetchApi<SleepHabit>('/sleep/habit', { isProtected: true }),
                    fetchApi<HydrateHabit>('/hydrate/habit', { isProtected: true }),
                    fetchApi<DietHabit>('/diet/habit', { isProtected: true }),
                ]);

                if (sleepRes.data) setSleepData(sleepRes.data);
                else if (sleepRes.status !== 404) setErrors(prev => ({ ...prev, sleep: sleepRes.error || 'Failed to load sleep habit' }));

                if (hydrateRes.data) setHydrateData(hydrateRes.data);
                 else if (hydrateRes.status !== 404) setErrors(prev => ({ ...prev, hydrate: hydrateRes.error || 'Failed to load hydrate habit' }));

                if (dietRes.data) setDietData(dietRes.data);
                 else if (dietRes.status !== 404) setErrors(prev => ({ ...prev, diet: dietRes.error || 'Failed to load diet habit' }));

            } catch (err) {
                 console.error("Error fetching habits:", err);
                 setErrors(prev => ({ ...prev, general: 'Could not load habit settings.' }));
            } finally {
                setIsLoading(false);
            }
        };
        fetchHabits();
    }, []);

    // Generic input handler
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        habitType: 'sleep' | 'hydrate' | 'diet'
    ) => {
        const { name, value, type } = e.target;
        const setter = { sleep: setSleepData, hydrate: setHydrateData, diet: setDietData }[habitType];

        setter(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value
        }));
    };

     // Hide success message after delay
    const showSuccess = (habitType: string, message: string) => {
        setSuccessMessages(prev => ({ ...prev, [habitType]: message }));
        setTimeout(() => setSuccessMessages(prev => ({ ...prev, [habitType]: null })), 3000);
    };

    // --- Save Handlers ---
    const handleSaveHabit = async (
        e: FormEvent,
        habitType: 'sleep' | 'hydrate' | 'diet'
    ) => {
        e.preventDefault();
        setIsSaving(prev => ({ ...prev, [habitType]: true }));
        setErrors(prev => ({ ...prev, [habitType]: null })); // Clear previous error for this habit
        setSuccessMessages(prev => ({ ...prev, [habitType]: null})); // Clear previous success

        const endpointMap = {
            sleep: '/sleep/habit',
            hydrate: '/hydrate/habit',
            diet: '/diet/habit'
        };
        const dataMap = { sleep: sleepData, hydrate: hydrateData, diet: dietData };
        const dataToSend = dataMap[habitType];

        // Basic Validation (Add more as needed)
        if (habitType === 'sleep' && (!dataToSend.sleep_time || !dataToSend.wakeup_time)) {
             setErrors(prev => ({ ...prev, [habitType]: 'Wake up and sleep times are required.' }));
             setIsSaving(prev => ({ ...prev, [habitType]: false }));
             return;
        }
         if (habitType === 'hydrate' && (!dataToSend.water_goal || !dataToSend.cup_size || dataToSend.water_goal <= 0 || dataToSend.cup_size <= 0)) {
             setErrors(prev => ({ ...prev, [habitType]: 'Valid Water Goal and Cup Size are required.' }));
             setIsSaving(prev => ({ ...prev, [habitType]: false }));
             return;
        }
         if (habitType === 'diet' && (!dataToSend.calories_goal || dataToSend.calories_goal <= 0)) {
             setErrors(prev => ({ ...prev, [habitType]: 'Valid Calorie Goal is required.' }));
             setIsSaving(prev => ({ ...prev, [habitType]: false }));
             return;
        }


        const response = await fetchApi(endpointMap[habitType], {
            method: 'PUT', // Use PUT for upsert
            isProtected: true,
            body: dataToSend,
        });

        setIsSaving(prev => ({ ...prev, [habitType]: false }));

        if (response.data) {
            showSuccess(habitType, `${habitType.charAt(0).toUpperCase() + habitType.slice(1)} habit saved successfully!`);
            // Optionally update local state if backend returns updated data (might not be necessary if page reloads or data isn't displayed directly here)
             // const setter = { sleep: setSleepData, hydrate: setHydrateData, diet: setDietData }[habitType];
             // setter(response.data);
        } else {
            setErrors(prev => ({ ...prev, [habitType]: response.error || `Failed to save ${habitType} habit.` }));
        }
    };


    // if (isLoading) {
    //     return <div className={styles.loadingContainer}><LoadingSpinner /></div>;
    // }
    //  if (errors.general) {
    //      return <p className={styles.formError}>{errors.general}</p>;
    //  }

    if (isLoading) {
        // Render cấu trúc cơ bản để giữ layout
        return (
            <div className={styles.settingsSection}>
                {/* Có thể thêm title placeholder nếu muốn */}
                {/* <h3 className={styles.sectionTitle}>Habit Settings</h3> */}
                <div className={styles.loadingContainer}>
                    <LoadingSpinner />
                </div>
            </div>
        );
    }


    if (errors.general) {
        // Render cấu trúc cơ bản và hiển thị lỗi
        return (
           <div className={styles.settingsSection}>
                 <h3 className={styles.sectionTitle}>Habit Settings</h3>
                 <p className={styles.formError}>{errors.general}</p>
            </div>
        );
    }

    return (
        <div className={styles.settingsSection}>
            {/* Overlay được hiển thị bởi component cha nếu isLoading */}
            {/* Nội dung chỉ render khi không loading */}
            {!isLoading && !errors.general && (
                <>
                    <h3 className={styles.sectionTitle}>Habit Settings</h3>
                    <p className={styles.sectionDescription}>Set your daily goals. Saving will reset today's progress for that habit.</p>

                    {/* --- Sleep Form --- */}
                    <form onSubmit={(e) => handleSaveHabit(e, 'sleep')} className={styles.subForm}>
                         <h4 className={styles.subFormTitle}>Sleep</h4>
                         {errors.sleep && <p className={styles.formError}>{errors.sleep}</p>}
                         {successMessages.sleep && <p className={styles.formSuccess}>{successMessages.sleep}</p>}
                        <div className={styles.formGroup}>
                             <label htmlFor="sleep_time">Target Sleep Time:</label>
                             <input type="time" id="sleep_time" name="sleep_time" value={sleepData.sleep_time || ''} onChange={(e) => handleInputChange(e, 'sleep')} disabled={isSaving.sleep} required className={styles.formInput} />
                        </div>
                        <div className={styles.formGroup}>
                             <label htmlFor="wakeup_time">Target Wake Up Time:</label>
                             <input type="time" id="wakeup_time" name="wakeup_time" value={sleepData.wakeup_time || ''} onChange={(e) => handleInputChange(e, 'sleep')} disabled={isSaving.sleep} required className={styles.formInput} />
                        </div>
                        <div className={styles.formActions}>
                            <button type="submit" disabled={isSaving.sleep} className={`${styles.formButton} ${styles.formButtonPrimary}`}>
                                {isSaving.sleep ? <LoadingSpinner inline={true}/> : 'Save Sleep Habit'}
                            </button>
                        </div>
                    </form>
                     <hr className={styles.divider} />

                    {/* --- Hydrate Form --- */}
                    <form onSubmit={(e) => handleSaveHabit(e, 'hydrate')} className={styles.subForm}>
                         <h4 className={styles.subFormTitle}>Hydration</h4>
                         {errors.hydrate && <p className={styles.formError}>{errors.hydrate}</p>}
                         {successMessages.hydrate && <p className={styles.formSuccess}>{successMessages.hydrate}</p>}
                        <div className={styles.formGroup}>
                             <label htmlFor="water_goal">Daily Water Goal (ml):</label>
                             <input type="number" id="water_goal" name="water_goal" min="1" step="50" value={hydrateData.water_goal || ''} onChange={(e) => handleInputChange(e, 'hydrate')} disabled={isSaving.hydrate} required className={styles.formInput} />
                         </div>
                         <div className={styles.formGroup}>
                             <label htmlFor="cup_size">Default Cup Size (ml):</label>
                             <input type="number" id="cup_size" name="cup_size" min="1" step="10" value={hydrateData.cup_size || ''} onChange={(e) => handleInputChange(e, 'hydrate')} disabled={isSaving.hydrate} required className={styles.formInput} />
                         </div>
                        <div className={styles.formActions}>
                            <button type="submit" disabled={isSaving.hydrate} className={`${styles.formButton} ${styles.formButtonPrimary}`}>
                                {isSaving.hydrate ? <LoadingSpinner inline={true}/> : 'Save Hydrate Habit'}
                            </button>
                        </div>
                    </form>
                     <hr className={styles.divider} />

                     {/* --- Diet Form --- */}
                    <form onSubmit={(e) => handleSaveHabit(e, 'diet')} className={styles.subForm}>
                         <h4 className={styles.subFormTitle}>Diet</h4>
                         {errors.diet && <p className={styles.formError}>{errors.diet}</p>}
                         {successMessages.diet && <p className={styles.formSuccess}>{successMessages.diet}</p>}
                        <div className={styles.formGroup}>
                             <label htmlFor="calories_goal">Daily Calorie Goal (kcal):</label>
                             <input type="number" id="calories_goal" name="calories_goal" min="1" step="50" value={dietData.calories_goal || ''} onChange={(e) => handleInputChange(e, 'diet')} disabled={isSaving.diet} required className={styles.formInput} />
                         </div>
                        <div className={styles.formActions}>
                            <button type="submit" disabled={isSaving.diet} className={`${styles.formButton} ${styles.formButtonPrimary}`}>
                                {isSaving.diet ? <LoadingSpinner inline={true}/> : 'Save Diet Habit'}
                            </button>
                         </div>
                    </form>
                </>
            )}
            {/* Hiển thị lỗi fetch ban đầu nếu có và không đang loading */}
            {!isLoading && errors.general && (
                 <p className={styles.formError}>{errors.general}</p>
            )}
        </div>
    );
};

export default HabitSettings;