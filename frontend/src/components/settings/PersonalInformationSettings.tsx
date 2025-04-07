// src/components/settings/PersonalInformationSettings.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { fetchApi } from '../../lib/api';
import { ProfileResponse, ProfileBase } from '../../types/profile.types';
import styles from '../../styles/Settings.module.css';
import LoadingSpinner from '../common/LoadingSpinner';
import ChangePasswordForm from './ChangePasswordForm'; // Import form đổi MK

const PersonalInformationSettings = () => {
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [formData, setFormData] = useState<ProfileBase>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            setError(null);
            const response = await fetchApi<ProfileResponse>('/profile', { isProtected: true });
            setIsLoading(false);
            if (response.data) {
                setProfile(response.data);
                // Initialize form data with fetched profile data (only editable fields)
                setFormData({
                    username: response.data.username,
                    gender: response.data.gender,
                    weight: response.data.weight,
                    height: response.data.height,
                    age: response.data.age,
                });
            } else {
                setError(response.error || "Failed to load profile.");
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            // Convert number inputs to numbers, handle potential empty string
            [name]: (name === 'weight' || name === 'height' || name === 'age')
                     ? (value === '' ? undefined : parseFloat(value))
                     : value
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        // Filter out any undefined values before sending
        const dataToSend: Record<string, any> = {};
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                dataToSend[key] = value;
            }
        });


        const response = await fetchApi<ProfileResponse>('/profile', {
            method: 'PUT',
            isProtected: true,
            body: dataToSend,
        });
        setIsSaving(false);

        if (response.data) {
            setProfile(response.data); // Update displayed profile with new calculated values
             // Re-initialize form data after successful save
            setFormData({
                username: response.data.username,
                gender: response.data.gender,
                weight: response.data.weight,
                height: response.data.height,
                age: response.data.age,
            });
            setSuccessMessage("Profile updated successfully!");
             setTimeout(() => setSuccessMessage(null), 3000);
        } else {
            setError(response.error || "Failed to update profile.");
        }
    };

    // if (isLoading) {
    //     return <div className={styles.loadingContainer}><LoadingSpinner /></div>;
    // }

    // if (error && !profile) {
    //     return <p className={styles.formError}>Error loading profile: {error}</p>;
    // }

    // if (!profile) {
    //     return <p>No profile data found.</p>; // Should not happen if fetch works
    // }

    if (isLoading) {
        // Chỉ render container loading bên trong section
        // CSS sẽ đảm bảo container này được căn giữa và chiếm không gian
        return (
            <div className={styles.settingsSection}>
                <div className={styles.loadingContainer}>
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error /* Hoặc điều kiện lỗi khác */) {
        return (
           <div className={styles.settingsSection}>
                {/* Hiển thị lỗi bên trong section */}
                <p className={styles.formError}>{error}</p>
            </div>
         );
    }

    if (error && !profile) {
        // Vẫn render trong settingsSection để giữ layout
         return (
            <div className={styles.settingsSection}>
                 {/* Có thể thêm title hoặc để trống */}
                 {/* <h3 className={styles.sectionTitle}>Personal Information</h3> */}
                 <div style={{paddingTop: '2rem'}}> {/* Thêm padding nếu muốn đẩy lỗi xuống */}
                     <p className={styles.formError}>Error loading profile: {error}</p>
                 </div>
            </div>
         );
    }

    if (!profile) {
         return (
            <div className={styles.settingsSection}>
                 {/* <h3 className={styles.sectionTitle}>Personal Information</h3> */}
                 <p style={{paddingTop: '2rem'}}>No profile data found.</p>
            </div>
         );
    }

    return (
        <div className={styles.settingsSection}>
            {/* Overlay được hiển thị bởi component cha nếu isLoading */}
            {/* Nội dung chỉ render khi không loading */}
            {!isLoading && profile && (
                <>
                    <h3 className={styles.sectionTitle}>Personal Information</h3>
                    {error && <p className={styles.formError} style={{marginBottom: '1rem'}}>{error}</p>}
                    {successMessage && <p className={styles.formSuccess} style={{marginBottom: '1rem'}}>{successMessage}</p>}

                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGrid}>
                            {/* ... (các input fields cho profile) ... */}
                             <div className={styles.formGroup}>
                                <label htmlFor="username">Username:</label>
                                <input type="text" id="username" name="username" value={formData.username || ''} onChange={handleInputChange} disabled={isSaving} className={styles.formInput} />
                             </div>
                             <div className={styles.formGroup}>
                                <label htmlFor="gender">Gender:</label>
                                <select id="gender" name="gender" value={formData.gender || 'female'} onChange={handleInputChange} disabled={isSaving} className={styles.formInput}>
                                    <option value="female">Female</option>
                                    <option value="male">Male</option>
                                </select>
                             </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="weight">Weight (kg):</label>
                                <input type="number" id="weight" name="weight" min="1" step="0.1" value={formData.weight || ''} onChange={handleInputChange} disabled={isSaving} className={styles.formInput} />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="height">Height (cm):</label>
                                <input type="number" id="height" name="height" min="1" step="1" value={formData.height || ''} onChange={handleInputChange} disabled={isSaving} className={styles.formInput} />
                            </div>
                             <div className={styles.formGroup}>
                                <label htmlFor="age">Age (years):</label>
                                <input type="number" id="age" name="age" min="1" max="100" step="1" value={formData.age || ''} onChange={handleInputChange} disabled={isSaving} className={styles.formInput} />
                             </div>
                             <div className={styles.formGroup}>
                                <label>Daily Calories (calculated):</label>
                                <input type="text" value={profile.daily_calories?.toFixed(0) ?? 'N/A'} disabled className={styles.formInputReadOnly}/>
                            </div>
                             <div className={styles.formGroup}>
                                <label>Daily Water (calculated, L):</label>
                                <input type="text" value={profile.daily_water?.toFixed(2) ?? 'N/A'} disabled className={styles.formInputReadOnly}/>
                            </div>
                        </div>
                        <div className={styles.formActions} style={{marginTop: '1.5rem'}}>
                            <button type="submit" disabled={isSaving} className={`${styles.formButton} ${styles.formButtonPrimary}`}>
                                {isSaving ? <LoadingSpinner inline={true}/> : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                    <hr className={styles.divider} />
                    <ChangePasswordForm />
                </>
            )}
             {/* Hiển thị lỗi fetch ban đầu nếu có và không đang loading */}
            {!isLoading && error && !profile && (
                 <p className={styles.formError}>Error loading profile: {error}</p>
            )}
             {/* Hiển thị nếu fetch thành công nhưng không có profile */}
             {!isLoading && !profile && !error && (
                 <p>No profile data found.</p>
             )}
        </div>
    );
};

export default PersonalInformationSettings;