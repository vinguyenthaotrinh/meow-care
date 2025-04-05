// src/components/dashboard/DietUpdateModal.tsx
import React, { useState, FormEvent } from 'react';
import { fetchApi } from '../../lib/api';
import { DietLog } from '../../types/habit.types';
import styles from '../../styles/Dashboard.module.css';
import LoadingSpinner from '../common/LoadingSpinner';

interface DietUpdateModalProps {
    logId: string;
    isOpen: boolean;
    onClose: () => void;
    onFoodAdded: (updatedLog: DietLog) => void; // Callback khi thêm món ăn thành công
}

const DietUpdateModal: React.FC<DietUpdateModalProps> = ({ logId, isOpen, onClose, onFoodAdded }) => {
    const [foodName, setFoodName] = useState('');
    const [calories, setCalories] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        // Correct foodData structure to match backend expectation
        const foodData = {
            name: foodName, // Use "name" instead of "dish_name"
            calories: parseFloat(calories),
        };

        if (!foodName.trim() || isNaN(foodData.calories) || foodData.calories <= 0) {
            setError("Please enter a valid food name and calorie amount.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetchApi<DietLog>(`/diet/logs/${logId}/update`, {
                method: 'PUT',
                isProtected: true,
                body: { dishes: [foodData] } // Correct body structure - send a list of dishes under "dishes" key
            });

            setIsLoading(false);

            if (response.data) {
                onFoodAdded(response.data); // Gọi callback để cập nhật UI ở component cha
                onClose(); // Đóng modal
            } else if (response.error) {
                setError(response.error);
            } else {
                setError("Failed to add food. Unexpected error.");
            }
        } catch (e) {
            console.error("Error updating diet log:", e);
            setError("Failed to add food. Network error.");
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.dietModalOverlay}>
            <div className={styles.dietModal}>
                <h3 className={styles.modalTitle}>What did you just eat?</h3>
                <form onSubmit={handleSubmit} className={styles.dietForm}>
                    {error && <p className={styles.modalError}>{error}</p>}
                    <div className={styles.formGroup}>
                        <label htmlFor="foodName" className={styles.formLabel}>Food name:</label>
                        <input
                            type="text"
                            id="foodName"
                            className={styles.formInput}
                            value={foodName}
                            onChange={(e) => setFoodName(e.target.value)}
                            placeholder="e.g., Apple, Salad"
                            disabled={isLoading}
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
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div className={styles.modalActions}>
                        <button type="submit" className={styles.modalButton} disabled={isLoading}>
                            {isLoading ? <><LoadingSpinner inline={true} /> Adding...</> : 'Add'}
                        </button>
                        <button type="button" className={styles.modalButtonSecondary} onClick={onClose} disabled={isLoading}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DietUpdateModal;