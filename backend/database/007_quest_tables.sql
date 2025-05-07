-- 1. Table to define available quests
CREATE TABLE quests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    -- 'daily' resets progress daily, 'monthly' resets monthly
    type TEXT NOT NULL CHECK (type IN ('daily', 'monthly')),
    -- Optional: Link quest to a specific action type for potential automatic updates
    -- e.g., 'hydrate_goal', 'earn_coins', 'tasks_completed', 'checkin', 'log_meal', 'monthly_daily_quests'
    trigger_type TEXT,
    target_progress INTEGER NOT NULL,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('coins', 'diamonds')),
    reward_amount INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add comments for clarity
COMMENT ON COLUMN quests.type IS 'Determines the reset period for the quest progress.';
COMMENT ON COLUMN quests.trigger_type IS 'Links quest to specific user actions for potential progress tracking.';

-- 2. Table to track user progress on quests per period
CREATE TABLE user_quest_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    -- Progress made during the current period
    current_progress INTEGER NOT NULL DEFAULT 0,
    -- Start date of the period this progress applies to (e.g., today for daily, 1st of month for monthly)
    period_start_date DATE NOT NULL,
    -- Timestamp when the reward for this period was claimed
    claimed_at TIMESTAMPTZ,
    last_updated TIMESTAMPTZ DEFAULT now()
);

-- Index for efficient querying
CREATE INDEX idx_user_quest_progress_user_period ON user_quest_progress (user_id, period_start_date);

-- Ensure only one progress record per user, per quest, per period start date
ALTER TABLE user_quest_progress
ADD CONSTRAINT user_quest_progress_user_quest_period_unique UNIQUE (user_id, quest_id, period_start_date);

-- Add comments
COMMENT ON COLUMN user_quest_progress.period_start_date IS 'Start date of the period (day or month) this progress record belongs to.';
COMMENT ON COLUMN user_quest_progress.claimed_at IS 'Timestamp when the reward for this specific period was claimed.';


-- Example Daily Quests
INSERT INTO quests (title, description, type, trigger_type, target_progress, reward_type, reward_amount) VALUES
('Drink up 1500ml', 'Stay hydrated throughout the day', 'daily', 'hydrate_goal', 1500, 'coins', 30),
('Complete 2 Sleep Tasks', 'Finish 2 sleep tasks from your daily list', 'daily', 'tasks_completed', 2, 'coins', 50),
('Check-in Today', 'Claim your daily check-in reward', 'daily', 'checkin', 1, 'coins', 10),
('Log Meal', 'Record what you had', 'daily', 'log_meal', 1, 'diamonds', 1);
('Earn 50 coins', 'Collect coins from various activities', 'daily', 'earn_coins', 50, 'coins', 20);
('Focus 30 minutes', 'Spend 30 minutes on a focus task', 'daily', 'focus_time', 30, 'coins', 40);

-- Example Monthly Quest
INSERT INTO quests (title, description, type, trigger_type, target_progress, reward_type, reward_amount) VALUES
('Monthly Master', 'Complete 40 daily quests this month', 'monthly', 'monthly_daily_quests', 40, 'diamonds', 40);