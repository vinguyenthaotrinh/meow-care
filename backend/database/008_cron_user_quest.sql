CREATE OR REPLACE FUNCTION reset_user_quest_progress() 
RETURNS VOID AS $$
DECLARE
    today DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;
    month_start DATE := date_trunc('month', today)::DATE;
BEGIN
    -- Xóa progress DAILY của các tháng trước (không xóa trong tháng hiện tại)
    DELETE FROM user_quest_progress
    WHERE period_start_date < date_trunc('month', today)
      AND quest_id IN (
          SELECT id FROM quests WHERE type = 'daily'
      );

    -- Xóa progress monthly cũ (chỉ giữ lại trong tháng này)
    DELETE FROM user_quest_progress
    WHERE period_start_date < month_start
      AND quest_id IN (
          SELECT id FROM quests WHERE type = 'monthly'
      );

    -- Tạo progress DAILY nếu chưa có cho hôm nay
    INSERT INTO user_quest_progress (user_id, quest_id, period_start_date, current_progress)
    SELECT
        u.id AS user_id,
        q.id AS quest_id,
        today AS period_start_date,
        0
    FROM users u
    CROSS JOIN quests q
    WHERE q.type = 'daily'
      AND NOT EXISTS (
          SELECT 1 FROM user_quest_progress p
          WHERE p.user_id = u.id
            AND p.quest_id = q.id
            AND p.period_start_date = today
      );

    -- Tạo progress MONTHLY nếu chưa có cho tháng này
    INSERT INTO user_quest_progress (user_id, quest_id, period_start_date, current_progress)
    SELECT
        u.id AS user_id,
        q.id AS quest_id,
        month_start AS period_start_date,
        0
    FROM users u
    CROSS JOIN quests q
    WHERE q.type = 'monthly'
      AND NOT EXISTS (
          SELECT 1 FROM user_quest_progress p
          WHERE p.user_id = u.id
            AND p.quest_id = q.id
            AND p.period_start_date = month_start
      );
END;
$$ LANGUAGE plpgsql;

SELECT cron.schedule(
    'reset_user_quest_progress_daily',
    '0 17 * * *',  -- 17:00 UTC tương đương 00:00 UTC+7
    $$ SELECT reset_user_quest_progress(); $$
);
