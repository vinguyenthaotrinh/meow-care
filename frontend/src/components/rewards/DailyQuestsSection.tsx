// src/components/rewards/DailyQuestsSection.tsx
import React from 'react';
import { Quest } from '@/types/rewards.types';
import DailyQuestItem from './DailyQuestItem';
import styles from '../../styles/Rewards.module.css';

interface DailyQuestsSectionProps {
    quests: Quest[]; // Accepts the list of quests
}

const DailyQuestsSection: React.FC<DailyQuestsSectionProps> = ({ quests }) => {
    return (
        // Changed section to div for grid layout flexibility
        <div className={styles.questsSection}>
            <h3 className={styles.questsTitle}>Daily Quests</h3>
            {quests.length === 0 ? (
                <p>No daily quests available right now.</p>
            ) : (
                <div className={styles.questList}>
                    {quests.map(quest => (
                        <DailyQuestItem key={quest.id} quest={quest} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DailyQuestsSection;