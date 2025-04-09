// src/components/dashboard/TodoList.tsx
import React, { useState } from 'react';
import { TodoItem, SleepLog, HydrateLog, DietLog, DietDish } from '../../types/habit.types';
import LoadingSpinner from '../common/LoadingSpinner';
import styles from '../../styles/Dashboard.module.css';
import DietUpdateModal from './DietUpdateModal';

interface TodoListProps {
    todos: TodoItem[];
    isUpdating: Record<string, boolean>;
    handleCompleteSleep: (logId: string) => Promise<void>;
    handleUpdateHydrate: (logId: string) => Promise<void>;
    handleUpdateDiet: (logId: string) => Promise<void>; // Opens modal
    formatTime: (timeString: string | null | undefined) => string;
    formatAmount: (amount: number | null | undefined, unit: string) => string;
    updateTodoInState: (updatedItem: TodoItem) => void;
}


const TodoList: React.FC<TodoListProps> = ({
    todos,
    isUpdating,
    handleCompleteSleep,
    handleUpdateHydrate,
    handleUpdateDiet: handleOpenDietModalProp,
    formatTime,
    formatAmount,
    updateTodoInState,
}) => {
    const [dietModalOpen, setDietModalOpen] = useState<string | null>(null);
    const [expandedDietLogId, setExpandedDietLogId] = useState<string | null>(null);

    const handleOpenDietModal = (logId: string) => {
        setDietModalOpen(logId);
    };

    const handleCloseDietModal = () => {
        setDietModalOpen(null);
    };

    const handleFoodAdded = (updatedLog: DietLog) => {
        updateTodoInState({ ...updatedLog, type: 'diet' });
        handleCloseDietModal();
        // Optionally keep it expanded after adding food
        setExpandedDietLogId(updatedLog.id);
    };

    const toggleDietExpansion = (logId: string) => {
        setExpandedDietLogId(prevId => (prevId === logId ? null : logId));
    };


    if (!todos || todos.length === 0) return <p>No tasks for today yet.</p>;

    return (
        <div className={styles.todoListContainer}>
            {todos.map((item) => {
                const itemIsLoading = isUpdating[item.id] ?? false;
                const isDietExpanded = item.type === 'diet' && expandedDietLogId === item.id;

                return (
                    <div key={item.id} className={styles.todoItemWrapper}>
                        <div className={`${styles.todoItem} ${itemIsLoading ? styles.loading : ''}`}>
                            {/* --- Phần nội dung chính (text) --- */}
                            <div className={styles.todoContentWrapper}>
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
                                            <p className={styles.todoText}>Drink up</p>
                                            <p className={styles.todoSubtext}>
                                                Progress: {formatAmount(item.consumed_water, 'ml')} / {formatAmount(item.water_goal, 'ml')}
                                            </p>
                                        </>
                                    )}
                                    {item.type === 'diet' && (
                                        <div> {/* Container cho text */}
                                            <p className={styles.todoText}>Eat well</p>
                                            {/* Progress text now part of the main content */}
                                            <p className={styles.todoSubtext}>
                                                Progress: {formatAmount(item.consumed_calories, 'kcal')} / {formatAmount(item.calories_goal, 'kcal')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* --- Phần Expand Toggle (Cho Diet) --- */}
                            {item.type === 'diet' && (
                                <div
                                    className={styles.detailsToggle} // Dùng class này để style
                                    onClick={() => toggleDietExpansion(item.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleDietExpansion(item.id); }}
                                    aria-expanded={isDietExpanded}
                                    aria-controls={`diet-details-${item.id}`}
                                >
                                    <span className={styles.detailsText}>See Details</span> {/* Changed text */}
                                    <span className={`${styles.expandIcon} ${isDietExpanded ? styles.expanded : ''}`} aria-hidden="true">
                                        ▶
                                    </span>
                                </div>
                            )}

                            {/* --- Phần Actions (Nút bấm) --- */}
                            <div className={styles.todoActions}>
                                {/* Show disabled button version if loading, otherwise show active button or completed */}
                                {item.completed ? (
                                    <button className={styles.completedButton} disabled>Completed</button>
                                ) : itemIsLoading ? (
                                    // Render a disabled version of the correct button type
                                    item.type === 'sleep' ? (
                                        <button disabled>Complete</button> // Match default button style when disabled
                                    ) : item.type === 'hydrate' ? (
                                        <button className={styles.updateButton} disabled>+ {formatAmount(item.cup_size, 'ml')}</button> // Match update button style when disabled
                                    ) : item.type === 'diet' ? (
                                        <button className={styles.updateButton} disabled>Add food</button> // Match update button style when disabled
                                    ) : null
                                ) : (
                                    // Render the active buttons if not loading and not completed
                                    item.type === 'sleep' ? (
                                        <button onClick={() => handleCompleteSleep(item.id)}>Complete</button>
                                    ) : item.type === 'hydrate' ? (
                                        <button className={styles.updateButton} onClick={() => handleUpdateHydrate(item.id)}>
                                            + {formatAmount(item.cup_size, 'ml')}
                                        </button>
                                    ) : item.type === 'diet' ? (
                                        <button className={styles.updateButton} onClick={() => handleOpenDietModalProp(item.id)}>
                                            Add food
                                        </button>
                                    ) : null
                                )}
                            </div>
                        </div>

                        {/* --- Phần mở rộng Diet --- */}
                        {isDietExpanded && item.type === 'diet' && (
                           <div id={`diet-details-${item.id}`} className={styles.dietDetailsContainer}>
                                {item.dishes && item.dishes.length > 0 ? (
                                    <>
                                        <h5 className={styles.dishListTitle}>Logged Foods:</h5>
                                        <ul className={styles.dishList}>
                                            {item.dishes.map((dish: DietDish, index: number) => (
                                                <li key={`${item.id}-dish-${index}`} className={styles.dishItem}>
                                                    <span className={styles.dishName}>{dish.name || 'Unnamed food'}</span>
                                                    <span className={styles.dishCalories}>{formatAmount(dish.calories, 'kcal')}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <p className={styles.noDishes}>No food logged yet for this entry.</p>
                                )}
                           </div>
                        )}

                        {/* Diet Modal Rendering */}
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