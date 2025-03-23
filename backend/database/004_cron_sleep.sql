CREATE OR REPLACE FUNCTION generate_daily_sleep_logs()
RETURNS VOID AS $$
DECLARE
    today DATE := CURRENT_DATE;
BEGIN
    -- Xóa sleep logs cũ của hôm nay để tránh trùng lặp
    DELETE FROM sleep_logs WHERE DATE(scheduled_time) = today;

    -- Chèn sleep logs mới từ sleep habits
    INSERT INTO sleep_logs (user_id, task_type, scheduled_time)
    SELECT
        user_id,
        'sleep',
        today || ' ' || sleep_time
    FROM sleep_habits
    UNION ALL
    SELECT
        user_id,
        'wakeup',
        today || ' ' || wakeup_time
    FROM sleep_habits;
END;
$$ LANGUAGE plpgsql;

-- Bật extension pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA public; 

-- Tạo job để chạy hàm generate_daily_sleep_logs mỗi ngày 00:00 UTC
-- (tương đương với 07:00 AM giờ Việt Nam)
SELECT cron.schedule(
    'daily_sleep_log_job',  -- ID của job
    '0 17 * * *',  -- Chạy lúc 17:00 UTC mỗi ngày (tương đương 00:00 UTC+7)
    $$ SELECT generate_daily_sleep_logs(); $$
);

-- Xem danh sách các job đang chạy:
-- SELECT * FROM cron.job;

-- Xem lịch sử chạy của job:
-- SELECT * FROM cron.job_run_details;

-- Xóa job
-- SELECT cron.unschedule('daily_sleep_log_job');
