// src/components/home/CatRoom.tsx
import React from 'react';
import Image from 'next/image';
import { UserStats } from '@/types/habit.types'; // Import UserStats type
import styles from '@/styles/Home.module.css'; // Reuse styles
import catImageSrc from '@/assets/images/default-cat.png';
import backgroundImageSrc from '@/assets/images/background.png';
import { FaCoins, FaGem, FaFire } from 'react-icons/fa'; // Import icons

interface CatRoomProps {
    userStats: UserStats | null; // Accept userStats as a prop
}

const CatRoom: React.FC<CatRoomProps> = ({ userStats }) => {
    return (
        <div className={styles.catRoom}> {/* Main container with position: relative */}
            {/* Background Image */}
            <Image
                src={backgroundImageSrc}
                alt="Cat room background"
                layout="fill"
                objectFit="cover"
                className={styles.catRoomBackground}
                priority
            />

            {/* Cat Image */}
            <Image
                src={catImageSrc}
                alt="User's companion cat"
                width={180}
                height={180}
                className={styles.catImage}
                style={{ objectFit: 'contain' }}
            />

            {/* --- Stats positioned inside the room --- */}
            <div className={styles.catRoomStats}> {/* New container for stats */}
                {userStats ? (
                    // Use the existing stats container structure
                    <div className={styles.statsContainer}>
                        <div className={styles.statItem}>
                            <FaCoins className={`${styles.statIcon} ${styles.coinIcon}`} />
                            <span className={styles.statValue}>{userStats.xp}</span>
                        </div>
                        <div className={styles.statItem}>
                            <FaGem className={`${styles.statIcon} ${styles.diamondIcon}`} />
                            <span className={styles.statValue}>{userStats.level}</span>
                        </div>
                        <div className={styles.statItem}>
                            <FaFire className={`${styles.statIcon} ${styles.streakIcon}`} />
                            <span className={styles.statValue}>{userStats.streak}</span>
                        </div>
                    </div>
                ) : (
                    // Optional: Show something if stats aren't loaded, or just render nothing
                    <span className={styles.noStatsTextSmall}>Stats loading...</span>
                )}
            </div>
            {/* --- End Stats --- */}
        </div>
    );
};

export default CatRoom;