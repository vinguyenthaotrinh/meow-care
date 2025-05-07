CREATE OR REPLACE FUNCTION generate_daily_focus_logs()
RETURNS VOID AS $$
DECLARE
    today DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;
BEGIN
    -- Xóa các focus_logs của các ngày trước hôm nay
    DELETE FROM focus_logs WHERE date < today;

    -- Thêm log mới nếu hôm nay chưa có
    INSERT INTO focus_logs (user_id, focus_done, date, completed)
    SELECT
        fh.user_id,
        0,
        today,
        FALSE
    FROM focus_habits fh
    WHERE NOT EXISTS (
        SELECT 1 FROM focus_logs fl
        WHERE fl.user_id = fh.user_id
          AND fl.date = today
    );
END;
$$ LANGUAGE plpgsql;

-- Tạo cron job chạy lúc 00:00 UTC+7 (17:00 UTC)
SELECT cron.schedule(
    'daily_focus_log_job',
    '0 17 * * *',  -- 17:00 UTC tương đương 00:00 UTC+7
    $$ SELECT generate_daily_focus_logs(); $$
);

-- Xóa nếu cần:
-- SELECT cron.unschedule('daily_focus_log_job');
