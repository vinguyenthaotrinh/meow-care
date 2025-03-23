from datetime import datetime, timezone, timedelta
from ..utils import supabase, ServiceError, DEBUG

class SleepService:
    def __init__(self):
        self.client = supabase

    def set_sleep_habit(self, user_id, data): 
        sleep_time = data.get("sleep_time")
        wakeup_time = data.get("wakeup_time")

        if not sleep_time or not wakeup_time:
            raise ServiceError("Missing required fields", 400)
        
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

    def get_sleep_habit(self, user_id):
        try:
            response = self.client.table("sleep_habits").select("*") \
                .eq("user_id", user_id) \
                .execute()
            if not response.data:
                raise ServiceError("Sleep habit not found", 404)
            return response.data[0]
        except ServiceError:
            raise
        except Exception as e:
            error_message = str(e).lower()
            if "0 rows" in error_message:
                raise ServiceError("Sleep habit not found", 404)
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)


    def get_sleep_logs_today(self, user_id):
        today = datetime.now(timezone.utc).date()
        try:
            response = self.client.table("sleep_logs").select("*") \
                .eq("user_id", user_id) \
                .gte("scheduled_time", f"{today} 00:00:00") \
                .lt("scheduled_time", f"{today} 23:59:59") \
                .execute()

            if not response.data:
                raise ServiceError("No sleep logs found for today", 404)
            return response.data
        except ServiceError:
            raise
        except Exception as e:
            error_message = str(e).lower()
            if "0 rows" in error_message:
                raise ServiceError("No sleep logs found for today", 404)
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

    def get_sleep_logs_week(self, user_id):
        today = datetime.now(timezone.utc).date()
        monday = today - timedelta(days=today.weekday())  # Lấy thứ 2 của tuần này
        
        try:
            response = self.client.table("sleep_logs").select("*") \
                .eq("user_id", user_id) \
                .gte("scheduled_time", f"{monday} 00:00:00") \
                .lt("scheduled_time", f"{today} 23:59:59") \
                .execute()

            if not response.data:
                raise ServiceError("No sleep logs found for this week", 404)
            return response.data
        except ServiceError:
            raise
        except Exception as e:
            error_message = str(e).lower()
            if "0 rows" in error_message:
                raise ServiceError("No sleep logs found for this week", 404)
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)
    
    def update_sleep_log_completion(self, user_id, log_id):
        try:
            # Kiểm tra log đúng định dạng uuid chưa
            if not log_id or len(log_id) != 36:
                raise ServiceError("Sleep log not found", 404)
            
            log_response = self.client.table("sleep_logs").select("id, user_id") \
                .eq("id", log_id) \
                .eq("user_id", user_id) \
                .execute()

            if not log_response.data:
                raise ServiceError("Sleep log not found", 404)

            # Cập nhật trạng thái completed
            updated_response = self.client.table("sleep_logs").update({"completed": True}) \
                .eq("id", log_id) \
                .execute()

            if not updated_response.data:
                raise ServiceError("Database server error", 500)

            return updated_response.data[0]
        except ServiceError:
            raise
        except Exception as e:
            error_message = str(e).lower()
            if "0 rows" in error_message:
                raise ServiceError("Sleep log not found", 404)
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)


sleep_service = SleepService()
