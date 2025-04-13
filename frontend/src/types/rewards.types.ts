// src/types/rewards.types.ts

// Matches the structure returned by the /xp API and DB table
export interface XpRewardsData {
    user_id: string; // Use string
    coins: number;
    diamonds: number;
    streak: number;
    daily_checkin: number;
    last_checkin_date: string; // ISO Date string (e.g., "2023-10-27")
    last_streak_date: string; // ISO Date string
  }

  // Matches the backend UserQuestProgressResponse model
  export interface UserQuestProgress {
      id: string;
      user_id: string;
      quest_id: string;
      current_progress: number;
      period_start_date: string; // ISO Date string
      claimed_at: string | null; // ISO DateTime string or null
      last_updated: string; // ISO DateTime string
  }

  // Matches the backend QuestWithProgressResponse model
  export interface Quest {
      // Base Quest fields
      id: string;
      title: string;
      description: string | null;
      type: 'daily' | 'monthly';
      trigger_type: string | null;
      target_progress: number;
      reward_type: 'coins' | 'diamonds';
      reward_amount: number;
      is_active: boolean;
      created_at: string; // ISO DateTime string
      // Added fields from backend calculation
      user_progress: UserQuestProgress | null; // Nested progress object or null
      is_completed: boolean; // Calculated: user_progress.current_progress >= target_progress
      is_claimable: boolean; // Calculated: is_completed AND user_progress.claimed_at is null
  }


  // Type for Daily Check-in Box rendering (no changes needed)
  export interface CheckinDay {
      dayIndex: number; // 0-6
      isToday: boolean;
      isClaimed: boolean;
      isClaimable: boolean;
      rewardCoins?: number;
      rewardDiamonds?: number;
  }