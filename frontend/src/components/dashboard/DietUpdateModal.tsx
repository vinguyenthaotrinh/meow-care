// src/components/dashboard/DietUpdateModal.tsx
import React, { useState, FormEvent } from 'react';
import { fetchApi } from '../../lib/api';
import { DietLog } from '../../types/habit.types';
import styles from '../../styles/Dashboard.module.css'; // Sử dụng cùng file CSS
import LoadingSpinner from '../common/LoadingSpinner';

interface DietUpdateModalProps {
    logId: string;
    isOpen: boolean;
    onClose: () => void;
    onFoodAdded: (updatedLog: DietLog) => void;
}

const DietUpdateModal: React.FC<DietUpdateModalProps> = ({ logId, isOpen, onClose, onFoodAdded }) => {
    const [foodName, setFoodName] = useState('');
    const [calories, setCalories] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Reset state when modal opens/closes or logId changes
    React.useEffect(() => {
        if (isOpen) {
            setFoodName('');
            setCalories('');
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);

        const parsedCalories = parseFloat(calories);
        if (!foodName.trim() || isNaN(parsedCalories) || parsedCalories <= 0) {
            setError("Please enter a valid food name and positive calorie amount.");
            return; // Don't set loading if validation fails client-side
        }

        setIsLoading(true); // Set loading only after validation passes

        // Backend expects a list of dishes within a 'dishes' key
        const foodData = {
            dishes: [
                {
                    name: foodName,
                    calories: parsedCalories,
                }
            ]
        };

        try {
            const response = await fetchApi<DietLog>(`/diet/logs/${logId}/update`, {
                method: 'PUT',
                isProtected: true,
                body: foodData
            });

            if (response.data) {
                onFoodAdded(response.data);
                onClose();
            } else {
                // Keep modal open and show error
                setError(response.error || "Failed to add food. Unexpected error.");
            }
        } catch (e) {
            console.error("Error updating diet log:", e);
            setError("Failed to add food. Network error or server issue.");
        } finally {
             // Always set loading false after API call finishes (success or error)
             setIsLoading(false);
        }
    };

    return (
        // Use the existing overlay style
        <div className={styles.dietModalOverlay}>
            {/* Modal container */}
            <div className={styles.dietModal}>
                 {/* --- Loading Spinner Overlay (NEW) --- */}
                 {/* This overlay will appear on top of the form when loading */}
                 {isLoading && (
                    <div className={styles.modalLoadingOverlay}>
                        <LoadingSpinner />
                    </div>
                 )}

                 {/* Modal Header */}
                <h3 className={styles.modalTitle}>What did you just eat?</h3>

                 {/* Form starts here */}
                <form onSubmit={handleSubmit} className={styles.dietForm}>
                    {/* Error Message */}
                    {error && <p className={styles.modalError}>{error}</p>}

                    {/* Input Fields */}
                    <div className={styles.formGroup}>
                        <label htmlFor="foodName" className={styles.formLabel}>Food name:</label>
                        <input
                            type="text"
                            id="foodName"
                            className={styles.formInput}
                            value={foodName}
                            onChange={(e) => setFoodName(e.target.value)}
                            placeholder="e.g., Apple, Salad"
                            disabled={isLoading} // Disable input while loading
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="calories" className={styles.formLabel}>Calories (kcal):</label>
                        <input
                            type="number"
                            id="calories"
                            className={styles.formInput}
                            value={calories}
                            onChange={(e) => setCalories(e.target.value)}
                            placeholder="e.g., 95, 350"
                            min="1" // Prevent negative/zero calories via HTML5 validation
                            step="any" // Allow decimals if needed
                            disabled={isLoading} // Disable input while loading
                            required
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.modalActions}>
                         {/* Add Button - No spinner inside, new class added */}
                        <button
                            type="submit"
                            // Apply base button style AND the new yellow style
                            className={`${styles.modalButton} ${styles.modalButtonPrimaryYellow}`}
                            disabled={isLoading} // Disable button while loading
                        >
                            Add
                        </button>
                        {/* Cancel Button */}
                        <button
                            type="button"
                            className={styles.modalButtonSecondary}
                            onClick={onClose}
                            disabled={isLoading} // Disable button while loading
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DietUpdateModal;