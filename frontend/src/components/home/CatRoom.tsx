// src/components/home/CatRoom.tsx
import React from 'react';
import Image from 'next/image';
import { XpRewardsData } from '@/types/rewards.types'; // **** IMPORT CORRECT TYPE ****
import styles from '@/styles/Home.module.css';
import catImageSrc from '@/assets/images/default-cat.png';
import backgroundImageSrc from '@/assets/images/background.png'; // *** Corrected filename if it's png ***
import { FaCoins, FaGem, FaFire } from 'react-icons/fa';

interface CatRoomProps {
    xpData: XpRewardsData | null; // **** ACCEPT NEW PROP NAME & TYPE ****
}

const CatRoom: React.FC<CatRoomProps> = ({ xpData }) => { // **** USE xpData PROP ****
    return (
        <div className={styles.catRoom}>
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

            {/* Stats positioned inside the room */}
            <div className={styles.catRoomStats}>
                {xpData ? ( // **** CHECK xpData ****
                    <div className={styles.statsContainer}>
                        <div className={styles.statItem}>
                            <FaCoins className={`${styles.statIcon} ${styles.coinIcon}`} />
                            {/* **** ACCESS CORRECT FIELDS **** */}
                            <span className={styles.statValue}>{xpData.coins}</span>
                        </div>
                        <div className={styles.statItem}>
                            <FaGem className={`${styles.statIcon} ${styles.diamondIcon}`} />
                            {/* **** ACCESS CORRECT FIELDS **** */}
                            <span className={styles.statValue}>{xpData.diamonds}</span>
                        </div>
                        <div className={styles.statItem}>
                            <FaFire className={`${styles.statIcon} ${styles.streakIcon}`} />
                             {/* **** ACCESS CORRECT FIELDS **** */}
                            <span className={styles.statValue}>{xpData.streak}</span>
                        </div>
                    </div>
                ) : (
                    <span className={styles.noStatsTextSmall}>Stats loading...</span>
                )}
            </div>
        </div>
    );
};

export default CatRoom;