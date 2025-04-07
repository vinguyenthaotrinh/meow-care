// src/components/settings/ChangePasswordForm.tsx
import React, { useState, FormEvent } from 'react';
import { fetchApi } from '../../lib/api';
import styles from '../../styles/Settings.module.css'; // Reuse settings styles
import LoadingSpinner from '../common/LoadingSpinner';

const ChangePasswordForm = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) { // Basic validation
            setError("New password must be at least 6 characters long.");
            return;
        }

        setIsLoading(true);
        const response = await fetchApi('/profile/change-password', {
            method: 'PUT',
            isProtected: true,
            body: { old_password: oldPassword, new_password: newPassword },
        });
        setIsLoading(false);

        if (response.error) {
            setError(response.error);
        } else {
            setSuccessMessage("Password changed successfully!");
            // Clear fields after success
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            // Hide success message after a few seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.subForm}> {/* Dùng subForm style */}
            <h4 className={styles.subFormTitle}>Change Password</h4>
            {error && <p className={styles.formError}>{error}</p>}
            {successMessage && <p className={styles.formSuccess}>{successMessage}</p>}

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
                    minLength={6}
                    className={styles.formInput}
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