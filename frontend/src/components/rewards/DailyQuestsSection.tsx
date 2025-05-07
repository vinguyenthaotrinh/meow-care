// src/components/rewards/DailyQuestsSection.tsx
import React from 'react';
import { Quest } from '@/types/rewards.types';
import DailyQuestItem from './DailyQuestItem';
import styles from '../../styles/Rewards.module.css';

interface DailyQuestsSectionProps {
    quests: Quest[];
    onClaimQuest: (questId: string) => Promise<void>; // Function to claim
    // Removed claimingQuestId prop
}

const DailyQuestsSection: React.FC<DailyQuestsSectionProps> = ({ quests, onClaimQuest }) => {
    return (
        <div className={styles.questsSection}>
            <h3 className={styles.questsTitle}>Daily Quests</h3>
            {quests.length === 0 ? (
                <p>No daily quests available right now.</p>
            ) : (
                <div className={styles.questList}>
                    {quests.map(quest => (
                        <DailyQuestItem
                            key={quest.id}
                            quest={quest}
                            onClaim={onClaimQuest} // Pass the handler down
                            // isClaimingQuest prop removed
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DailyQuestsSection;