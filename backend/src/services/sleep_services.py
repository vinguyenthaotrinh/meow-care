from datetime import datetime, timezone
from ..utils import supabase, ServiceError, DEBUG

class SleepService:
    def __init__(self):
        self.client = supabase

    def set_sleep_habit(self, user_id, data): 
        sleep_time = data.get("sleep_time")
        wakeup_time = data.get("wakeup_time")

        if not sleep_time or not wakeup_time:
            raise ServiceError("Missing required fields", 400)
        if sleep_time >= wakeup_time:
            raise ServiceError("Sleep time must be before wakeup time", 400)
        
        try:
            # Lưu habit (Upsert: Nếu có thì cập nhật, chưa có thì tạo mới)
            habit_response = self.client.table("sleep_habits").upsert(
                {"user_id": user_id, "sleep_time": sleep_time, "wakeup_time": wakeup_time}
            ).execute()
            if not habit_response.data:
                raise ServiceError("Database server error", 500)

            # Xóa Sleep Logs hôm nay (tránh trùng lặp)
            today = datetime.now(timezone.utc).date()
            self.client.table("sleep_logs").delete().eq("user_id", user_id).gte("scheduled_time", today).execute()

            # Tạo Sleep Logs hôm nay
            sleep_log = {
                "user_id": user_id,
                "task_type": "sleep",
                "scheduled_time": f"{today} {sleep_time}",
            }
            wakeup_log = {
                "user_id": user_id,
                "task_type": "wakeup",
                "scheduled_time": f"{today} {wakeup_time}",
            }
            logs_response = self.client.table("sleep_logs").insert([sleep_log, wakeup_log]).execute()
            if not logs_response.data:
                raise ServiceError("Database server error", 500)
            
            return habit_response.data[0]
        except ServiceError:
            raise
        except Exception as e:
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

    def get_sleep_logs(self, user_id):
        """Lấy Sleep Logs của user"""
        response = self.client.table("sleep_logs").select("*").eq("user_id", user_id).execute()
        if not response.data:
            raise ServiceError("No sleep logs found", 404)
        return response.data

sleep_service = SleepService()
