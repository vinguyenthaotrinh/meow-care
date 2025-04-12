// src/types/rewards.types.ts

// Matches the structure returned by the /xp API and DB table
export interface XpRewardsData {
    user_id: string;
    coins: number;
    diamonds: number;
    streak: number;
    daily_checkin: number; // Represents the number of consecutive days checked in (0-6, loops back)
    last_checkin_date: string; // ISO Date string (e.g., "2023-10-27")
    last_streak_date: string; // ISO Date string
  }
  
  // Type for individual quests (Daily/Monthly) - Mocked for now
  export interface Quest {
      id: string;
      title: string;
      description?: string; // Optional description
      currentProgress: number;
      targetProgress: number;
      rewardType: 'coins' | 'diamonds';
      rewardAmount: number;
      isClaimable: boolean; // Derived based on progress >= target and not yet claimed
      isCompleted: boolean; // Task objective met (e.g., drank water) - might be different from claimable
      // Add specific type if needed, e.g., 'hydrate', 'earn_coins'
      questType?: string;
  }
  
  // Type for Daily Check-in Box rendering
  export interface CheckinDay {
      dayIndex: number; // 0-6
      isToday: boolean;
      isClaimed: boolean;
      isClaimable: boolean;
      rewardCoins?: number;
      rewardDiamonds?: number;
  }