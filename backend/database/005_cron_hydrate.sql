CREATE OR REPLACE FUNCTION generate_daily_hydrate_logs()
RETURNS VOID AS $$
DECLARE
    today DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;
BEGIN
    -- Xóa hydrate logs của các ngày trước hôm nay
    DELETE FROM hydrate_logs WHERE date < today;

    -- Chèn hydrate log mới nếu hôm nay chưa có
    INSERT INTO hydrate_logs (user_id, water_goal, cup_size, consumed_water, date, completed)
    SELECT
        hh.user_id,
        hh.water_goal,
        hh.cup_size,
        0,
        today,
        FALSE
    FROM hydrate_habits hh
    WHERE NOT EXISTS (
        SELECT 1 FROM hydrate_logs hl
        WHERE hl.user_id = hh.user_id
          AND hl.date = today
    );
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
