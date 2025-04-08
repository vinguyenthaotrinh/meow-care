-- Tạo hoặc thay thế function để generate diet logs hàng ngày
CREATE OR REPLACE FUNCTION generate_daily_diet_logs()
RETURNS VOID AS $$
DECLARE
    today DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'WAST')::DATE;
BEGIN
    -- Xóa diet logs cũ của hôm nay để tránh trùng lặp
    DELETE FROM diet_logs WHERE date = today;

    -- Chèn diet logs mới từ diet_habits
    INSERT INTO diet_logs (user_id, calories_goal, dishes, consumed_calories, date, completed)
    SELECT
        user_id,
        calories_goal,
        '[]'::JSONB,  -- Dishes chưa được ăn, khởi tạo mảng rỗng
        0,  -- Chưa ăn nên consumed_calories = 0
        today,
        FALSE  -- Chưa hoàn thành
    FROM diet_habits;
END;
$$ LANGUAGE plpgsql;

-- Tạo cron job để chạy hàm generate_daily_diet_logs vào 00:00 UTC+7 (tức 17:00 UTC)
SELECT cron.schedule(
    'daily_diet_log_job',
    '0 17 * * *',  -- Chạy lúc 17:00 UTC (tương đương 00:00 UTC+7)
    $$ SELECT generate_daily_diet_logs(); $$
);

-- Xóa job nếu cần:
-- SELECT cron.unschedule('daily_diet_log_job');
