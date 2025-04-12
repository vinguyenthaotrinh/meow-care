// src/components/rewards/UserCurrencyDisplay.tsx
import React from 'react';
import { XpRewardsData } from '@/types/rewards.types';
import styles from '../../styles/Rewards.module.css'; // Use Rewards styles
import { FaCoins, FaGem, FaFire } from 'react-icons/fa';

interface UserCurrencyDisplayProps {
    rewardsData: XpRewardsData | null;
}

const UserCurrencyDisplay: React.FC<UserCurrencyDisplayProps> = ({ rewardsData }) => {
    return (
        <div className={styles.userCurrency}>
            <div className={styles.currencyItem}>
                <FaCoins className={`${styles.currencyIcon} ${styles.coinIcon}`} />
                <span>{rewardsData?.coins ?? 0}</span>
            </div>
            <div className={styles.currencyItem}>
                <FaGem className={`${styles.currencyIcon} ${styles.diamondIcon}`} />
                <span>{rewardsData?.diamonds ?? 0}</span>
            </div>
            <div className={styles.currencyItem}>
                <FaFire className={`${styles.currencyIcon} ${styles.streakIcon}`} />
                <span>{rewardsData?.streak ?? 0}</span>
            </div>
        </div>
    );
};

export default UserCurrencyDisplay;