-- Tạo hoặc thay thế function để generate hydrate logs hàng ngày
CREATE OR REPLACE FUNCTION generate_daily_hydrate_logs()
RETURNS VOID AS $$
DECLARE
    today DATE := CURRENT_DATE;
BEGIN
    -- Xóa hydrate logs cũ của hôm nay để tránh trùng lặp
    DELETE FROM hydrate_logs WHERE date = today;

    -- Chèn hydrate logs mới từ hydrate_habits
    INSERT INTO hydrate_logs (user_id, consumed_water, cup_size, date, completed)
    SELECT
        user_id,
        0,  -- Chưa uống nước nên consumed_water = 0
        cup_size,
        today,
        FALSE  -- Chưa hoàn thành
    FROM hydrate_habits;
END;
$$ LANGUAGE plpgsql;

-- Tạo cron job để chạy hàm generate_daily_hydrate_logs vào 00:00 UTC+7 (tức 17:00 UTC)
SELECT cron.schedule(
    'daily_hydrate_log_job',
    '0 17 * * *',  -- Chạy lúc 17:00 UTC (tương đương 00:00 UTC+7)
    $$ SELECT generate_daily_hydrate_logs(); $$
);

-- Xóa job nếu cần:
-- SELECT cron.unschedule('daily_hydrate_log_job');
