// src/components/settings/ChangePasswordForm.tsx
import React, { useState, FormEvent } from 'react';
import { fetchApi } from '../../lib/api';
import styles from '../../styles/Settings.module.css';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';

const ChangePasswordForm = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Removed error/successMessage states - using toast

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // --- Detailed Validation ---
        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all password fields.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        if (oldPassword === newPassword) {
            toast.error("New password cannot be the same as the old password.");
            return;
        }
        // --- End Validation ---

        setIsLoading(true);
        try {
            const response = await fetchApi('/profile/change-password', {
                method: 'PUT',
                isProtected: true,
                body: { old_password: oldPassword, new_password: newPassword },
            });

            if (response.error) {
                toast.error(response.error); // Use toast for errors
            } else {
                toast.success("Password changed successfully!"); // Use toast for success
                // Clear fields after success
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err) {
            console.error("Change password error:", err);
            toast.error("An unexpected error occurred while changing the password.");
        } finally {
            setIsLoading(false); // Ensure loading is always set to false
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.subForm}>
            <h4 className={styles.subFormTitle}>Change Password</h4>
            {/* Static messages removed, toasts will show notifications */}

            <div className={styles.formGroup}>
                <label htmlFor="oldPassword">Old Password:</label>
                <input
                    type="password"
                    id="oldPassword"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className={styles.formInput}
                    autoComplete="current-password"
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="newPassword">New Password:</label>
                <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    minLength={6} // HTML5 validation
                    className={styles.formInput}
                    autoComplete="new-password"
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Confirm New Password:</label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className={styles.formInput}
                    autoComplete="new-password"
                />
            </div>
            <div className={styles.formActions}>
                 <button type="submit" disabled={isLoading} className={`${styles.formButton} ${styles.formButtonPrimary}`}>
                    {isLoading ? <LoadingSpinner inline={true} /> : 'Change Password'}
                 </button>
            </div>
        </form>
    );
};

export default ChangePasswordForm;