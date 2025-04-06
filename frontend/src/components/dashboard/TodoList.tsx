// src/components/dashboard/TodoList.tsx
import React, { useState } from 'react';
import { TodoItem, SleepLog, HydrateLog, DietLog } from '../../types/habit.types';
import LoadingSpinner from '../common/LoadingSpinner';
import styles from '../../styles/Dashboard.module.css';
import DietUpdateModal from './DietUpdateModal';

interface TodoListProps {
    todos: TodoItem[];
    isUpdating: Record<string, boolean>;
    setItemLoading: (id: string, loading: boolean) => void;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    handleCompleteSleep: (logId: string) => Promise<void>;
    handleUpdateHydrate: (logId: string) => Promise<void>;
    handleUpdateDiet: (logId: string) => Promise<void>; // Prop name updated in parent
    formatTime: (timeString: string | null | undefined) => string;
    formatAmount: (amount: number | null | undefined, unit: string) => string;
    updateTodoInState: (updatedItem: TodoItem) => void;
}


const TodoList: React.FC<TodoListProps> = ({
    todos,
    isUpdating,
    setItemLoading, // Keep setItemLoading if needed for other loading states
    setError, // Keep setError if needed elsewhere
    handleCompleteSleep,
    handleUpdateHydrate,
    handleUpdateDiet: handleUpdateDietProp, // Keep renamed prop
    formatTime,
    formatAmount,
    updateTodoInState,
}) => {
    const [dietModalOpen, setDietModalOpen] = useState<string | null>(null);

    const handleOpenDietModal = (logId: string) => {
        setDietModalOpen(logId);
    };

    const handleCloseDietModal = () => {
        setDietModalOpen(null);
    };

    const handleFoodAdded = (updatedLog: DietLog) => {
        updateTodoInState({ ...updatedLog, type: 'diet' });
        handleCloseDietModal();
    };


    if (!todos || todos.length === 0) return <p>No tasks for today yet.</p>;

    return (
        <div className={styles.todoListContainer}>
            {todos.map((item) => {
                const itemIsLoading = isUpdating[item.id] ?? false;
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
                                    <p className={styles.todoText}>Hydrate</p>
                                    <p className={styles.todoSubtext}>
                                        Progress: {formatAmount(item.consumed_water, 'ml')} / {formatAmount(item.water_goal, 'ml')}
                                    </p>
                                </>
                            )}
                            {item.type === 'diet' && (
                                <>
                                    <p className={styles.todoText}>Eat well</p>
                                    <p className={styles.todoSubtext}>
                                        Progress: {formatAmount(item.consumed_calories, 'kcal')} / {formatAmount(item.calories_goal, 'kcal')}
                                    </p>
                                </>
                            )}
                        </div>
                        <div className={styles.todoActions}>
                            {itemIsLoading ? <LoadingSpinner /> : item.completed ? (
                                // *** MODIFICATION START ***
                                // Replace the check icon span with a disabled button
                                <button
                                    className={styles.completedButton} // Use a specific class for styling
                                    disabled // Always disabled
                                >
                                    Completed
                                </button>
                                // *** MODIFICATION END ***
                            ) : (
                                // Show active button based on type
                                item.type === 'sleep' ? (
                                    <button onClick={() => handleCompleteSleep(item.id)} disabled={itemIsLoading}>Complete</button>
                                ) : item.type === 'hydrate' ? (
                                    <button className={styles.updateButton} onClick={() => handleUpdateHydrate(item.id)} disabled={itemIsLoading}>
                                        + {formatAmount(item.cup_size, 'ml')}
                                    </button>
                                ) : item.type === 'diet' ? (
                                    <button className={styles.updateButton} onClick={() => handleOpenDietModal(item.id)} disabled={itemIsLoading}>
                                        Add food
                                    </button>
                                ) : null
                            )}
                        </div>
                        {/* Diet Modal Rendering (keep as is) */}
                        {item.type === 'diet' && dietModalOpen === item.id && (
                            <DietUpdateModal
                                logId={item.id}
                                isOpen={dietModalOpen === item.id}
                                onClose={handleCloseDietModal}
                                onFoodAdded={handleFoodAdded}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    );
};

export default TodoList;