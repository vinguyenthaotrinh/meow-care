create or replace function reset_user_quest_progress() 
returns void as $$
declare
    today date := (CURRENT_TIMESTAMP AT TIME ZONE 'WAST')::DATE;
    month_start date := date_trunc('month', today)::date;
begin
    -- Xóa progress daily cũ (giữ monthly)
    delete from user_quest_progress
    where period_start_date < today
    and quest_id in (
        select id from quests where type = 'daily'
    );

    -- Xóa progress monthly cũ nếu không phải trong tháng hiện tại
    delete from user_quest_progress
    where period_start_date < month_start
    and quest_id in (
        select id from quests where type = 'monthly'
    );
end;
$$ language plpgsql;

-- Chạy mỗi ngày lúc 0h UTC+7 (tức 17h UTC hôm trước)
select cron.schedule('reset_user_quest_progress_daily', '0 17 * * *', $$ 
    select reset_user_quest_progress(); 
$$);
