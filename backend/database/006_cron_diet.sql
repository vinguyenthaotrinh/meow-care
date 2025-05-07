CREATE OR REPLACE FUNCTION generate_daily_diet_logs()
RETURNS VOID AS $$
DECLARE
    today DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;
BEGIN
    -- Xóa diet logs của các ngày trước hôm nay
    DELETE FROM diet_logs WHERE date < today;

    -- Chèn diet log mới nếu hôm nay chưa có
    INSERT INTO diet_logs (user_id, calories_goal, dishes, consumed_calories, date, completed)
    SELECT
        dh.user_id,
        dh.calories_goal,
        '[]'::JSONB,
        0,
        today,
        FALSE
    FROM diet_habits dh
    WHERE NOT EXISTS (
        SELECT 1 FROM diet_logs dl
        WHERE dl.user_id = dh.user_id
          AND dl.date = today
    );
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
