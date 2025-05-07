CREATE OR REPLACE FUNCTION generate_daily_sleep_logs()
RETURNS VOID AS $$
DECLARE
    today DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;
BEGIN
    -- Xóa sleep logs của các ngày trước hôm nay
    DELETE FROM sleep_logs
    WHERE scheduled_time::date < today;

    -- Chèn log ngủ nếu hôm nay chưa có log 'sleep'
    INSERT INTO sleep_logs (user_id, task_type, scheduled_time)
    SELECT
        sh.user_id,
        'sleep',
        (today || ' ' || sh.sleep_time)::timestamp
    FROM sleep_habits sh
    WHERE NOT EXISTS (
        SELECT 1 FROM sleep_logs sl
        WHERE sl.user_id = sh.user_id
          AND sl.task_type = 'sleep'
          AND sl.scheduled_time::date = today
    );

    -- Chèn log thức dậy nếu hôm nay chưa có log 'wakeup'
    INSERT INTO sleep_logs (user_id, task_type, scheduled_time)
    SELECT
        sh.user_id,
        'wakeup',
        (today || ' ' || sh.wakeup_time)::timestamp
    FROM sleep_habits sh
    WHERE NOT EXISTS (
        SELECT 1 FROM sleep_logs sl
        WHERE sl.user_id = sh.user_id
          AND sl.task_type = 'wakeup'
          AND sl.scheduled_time::date = today
    );
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
