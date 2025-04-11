// src/components/settings/PersonalInformationSettings.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { fetchApi } from '../../lib/api';
import { ProfileResponse, ProfileBase } from '../../types/profile.types';
import styles from '../../styles/Settings.module.css';
import LoadingSpinner from '../common/LoadingSpinner';
import ChangePasswordForm from './ChangePasswordForm';
import { toast } from 'react-toastify';

const PersonalInformationSettings = () => {
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [formData, setFormData] = useState<ProfileBase>({});
    const [isLoading, setIsLoading] = useState(true); // For initial load
    const [isSaving, setIsSaving] = useState(false); // For saving profile
    const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

    const validateProfileData = (data: ProfileBase): string | null => {
        if (data.username && (data.username.length < 3 || data.username.length > 50)) {
            return "Username must be between 3 and 50 characters.";
        }
        if (data.weight !== undefined && data.weight !== null && data.weight <= 0) {
            return "Weight must be a positive number.";
        }
        if (data.height !== undefined && data.height !== null && data.height <= 0) {
            return "Height must be a positive number.";
        }
        if (data.age !== undefined && data.age !== null && (data.age < 1 || data.age > 100)) {
            return "Age must be between 1 and 100.";
        }
        return null;
    };

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            setInitialLoadError(null);
            try {
                const response = await fetchApi<ProfileResponse>('/profile', { isProtected: true });
                if (response.data) {
                    setProfile(response.data);
                    setFormData({
                        username: response.data.username,
                        gender: response.data.gender,
                        weight: response.data.weight,
                        height: response.data.height,
                        age: response.data.age,
                    });
                } else {
                    const errorMsg = response.error || "Failed to load profile.";
                    setInitialLoadError(errorMsg);
                    toast.error(errorMsg);
                }
            } catch (err) {
                 console.error("Fetch profile error:", err);
                 const errorMsg = "An unexpected error occurred while loading profile.";
                 setInitialLoadError(errorMsg);
                 toast.error(errorMsg);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let processedValue: string | number | undefined = value;

        if (type === 'number') {
            processedValue = value === '' ? '' : parseFloat(value);
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const dataToValidate: ProfileBase = {};
        const dataToSend: Record<string, any> = {};

        Object.entries(formData).forEach(([key, value]) => {
            let finalValue: string | number | undefined | null = value;
            if (key === 'weight' || key === 'height' || key === 'age') {
                if (value === '' || value === null || value === undefined || isNaN(Number(value))) {
                    finalValue = undefined;
                } else {
                    finalValue = Number(value);
                }
            } else if (key === 'username' && typeof value === 'string') {
                finalValue = value.trim();
                if (finalValue === '') finalValue = undefined;
            }
            if (finalValue !== undefined) {
                 dataToValidate[key as keyof ProfileBase] = finalValue as any;
                 dataToSend[key] = finalValue;
            }
        });

        const validationError = validateProfileData(dataToValidate);
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetchApi<ProfileResponse>('/profile', {
                method: 'PUT',
                isProtected: true,
                body: dataToSend,
            });

            if (response.data) {
                setProfile(response.data);
                 setFormData({
                     username: response.data.username,
                     gender: response.data.gender,
                     weight: response.data.weight,
                     height: response.data.height,
                     age: response.data.age,
                 });
                toast.success("Profile updated successfully!");
            } else {
                toast.error(response.error || "Failed to update profile.");
            }
        } catch (err) {
            console.error("Update profile error:", err);
            toast.error("An unexpected error occurred while updating the profile.");
        } finally {
            setIsSaving(false);
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

    if (initialLoadError && !profile) {
        return (
           <div className={styles.settingsSection}>
                 <p className={styles.formError} style={{marginTop: '2rem'}}>Error: {initialLoadError}</p>
            </div>
        );
    }

    if (!profile) {
         return (
            <div className={styles.settingsSection}>
                 <p style={{marginTop: '2rem'}}>Could not find profile data.</p>
            </div>
         );
    }

    return (
        <div className={styles.settingsSection}>
            <h3 className={styles.sectionTitle}>Personal Information</h3>

            <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="username">Username:</label>
                        <input type="text" id="username" name="username"
                            value={formData.username ?? ''} onChange={handleInputChange}
                            disabled={isSaving} className={styles.formInput}
                            minLength={3} maxLength={50}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="gender">Gender:</label>
                        <select id="gender" name="gender"
                            value={formData.gender || 'female'} onChange={handleInputChange}
                            disabled={isSaving} className={styles.formInput}
                        >
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="weight">Weight (kg):</label>
                        <input type="number" id="weight" name="weight" min="0.1" step="0.1"
                            value={formData.weight ?? ''} onChange={handleInputChange}
                            disabled={isSaving} className={styles.formInput}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="height">Height (cm):</label>
                        <input type="number" id="height" name="height" min="1" step="1"
                            value={formData.height ?? ''} onChange={handleInputChange}
                            disabled={isSaving} className={styles.formInput}
                        />
                    </div>
                     <div className={styles.formGroup}>
                        <label htmlFor="age">Age (years):</label>
                        <input type="number" id="age" name="age" min="1" max="100" step="1"
                            value={formData.age ?? ''} onChange={handleInputChange}
                            disabled={isSaving} className={styles.formInput}
                        />
                    </div>
                     <div className={styles.formGroup}>
                        <label>Daily Calories Needed (kcal):</label>
                        <input type="text" value={profile.daily_calories?.toFixed(0) ?? 'N/A'} disabled className={styles.formInputReadOnly}/>
                    </div>
                     <div className={styles.formGroup}>
                        <label>Daily Water Needed (ml):</label>
                        <input
                            type="text"
                            value={
                                (profile.daily_water !== null && profile.daily_water !== undefined)
                                ? (profile.daily_water * 1000).toFixed(0)
                                : 'N/A'
                            }
                            disabled
                            className={styles.formInputReadOnly}
                        />
                    </div>
                </div>

                <div className={styles.formActions} style={{marginTop: '1.5rem'}}>
                     <button type="submit" disabled={isSaving} className={`${styles.formButton} ${styles.formButtonPrimary}`}>
                        Save Profile {/* Only Text */}
                     </button>
                </div>
            </form>

            <hr className={styles.divider} />
             <ChangePasswordForm />
        </div>
    );
};

export default PersonalInformationSettings;