from datetime import datetime, timezone, timedelta
from ..utils import supabase, ServiceError, DEBUG

class HydrateService:
    def __init__(self):
        self.client = supabase

    def set_hydrate_habit(self, user_id, data): 
        water_goal = data.get("water_goal")
        cup_size = data.get("cup_size")
        reminder_time = data.get("reminder_time", [])

        if not water_goal or not cup_size:
            raise ServiceError("Missing required fields", 400)
        
        try:
            # Lưu habit (Upsert: Nếu có thì cập nhật, chưa có thì tạo mới)
            habit_response = self.client.table("hydrate_habits").upsert(
                {
                    "user_id": user_id,
                    "water_goal": water_goal,
                    "cup_size": cup_size,
                    "reminder_time": reminder_time
                }
            ).execute()
            if not habit_response.data:
                raise ServiceError("Database server error", 500)

            # Xóa Hydrate Logs hôm nay (tránh trùng lặp)
            # today của múi giờ utc+7
            today = datetime.now(timezone(timedelta(hours=7))).date()
            self.client.table("hydrate_logs").delete().eq("user_id", user_id).eq("date", today).execute()

            # Tạo Hydrate Log hôm nay
            hydrate_log = {
                "user_id": user_id,
                "water_goal": water_goal,
                "cup_size": cup_size,
                "consumed_water": 0,
                "date": today.isoformat(),
                "completed": False
            }
            logs_response = self.client.table("hydrate_logs").insert([hydrate_log]).execute()
            if not logs_response.data:
                raise ServiceError("Database server error", 500)
            
            return habit_response.data[0]
        except ServiceError:
            raise
        except Exception as e:
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

    def get_hydrate_habit(self, user_id):
        """Lấy thông tin thói quen uống nước"""
        try:
            response = self.client.table("hydrate_habits").select("*") \
                .eq("user_id", user_id) \
                .execute()

            if not response.data:
                raise ServiceError("Hydrate habit not found", 404)
            return response.data[0]
        except ServiceError:
            raise
        except Exception as e:
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

    def get_hydrate_logs_today(self, user_id):
        # today của múi giờ utc+7
        today = datetime.now(timezone(timedelta(hours=7))).date()
        try:
            response = self.client.table("hydrate_logs").select("*") \
                .eq("user_id", user_id) \
                .eq("date", today) \
                .execute()

            if not response.data:
                raise ServiceError("No hydrate logs found for today", 404)
            return response.data
        except ServiceError:
            raise
        except Exception as e:
            error_message = str(e).lower()
            if "0 rows" in error_message:
                raise ServiceError("No hydrate logs found for today", 404)
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

    def get_hydrate_logs_week(self, user_id):
        # today của múi giờ utc+7
        today = datetime.now(timezone(timedelta(hours=7))).date()
        monday = today - timedelta(days=today.weekday())  # Lấy thứ 2 của tuần này
        
        try:
            response = self.client.table("hydrate_logs").select("*") \
                .eq("user_id", user_id) \
                .gte("date", monday) \
                .lte("date", today) \
                .execute()

            if not response.data:
                raise ServiceError("No hydrate logs found for this week", 404)
            return response.data
        except ServiceError:
            raise
        except Exception as e:
            error_message = str(e).lower()
            if "0 rows" in error_message:
                raise ServiceError("No hydrate logs found for this week", 404)
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)
    
    def update_hydrate_log(self, user_id, log_id):
        try:
            # Kiểm tra log có tồn tại không
            log_response = self.client.table("hydrate_logs").select("id, user_id, consumed_water, cup_size, water_goal") \
                .eq("id", log_id) \
                .eq("user_id", user_id) \
                .execute()

            if not log_response.data:
                raise ServiceError("Hydrate log not found", 404)
            
            log = log_response.data[0]
            new_consumed = log["consumed_water"] + log["cup_size"]
            completed = new_consumed >= log["water_goal"]

            # Cập nhật lượng nước đã uống
            updated_response = self.client.table("hydrate_logs").update({
                "consumed_water": new_consumed,
                "completed": completed
            }).eq("id", log_id).execute()

            if not updated_response.data:
                raise ServiceError("Database server error", 500)

            return updated_response.data[0]
        except ServiceError:
            raise
        except Exception as e:
            error_message = str(e).lower()
            if "0 rows" in error_message:
                raise ServiceError("Hydrate log not found", 404)
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

hydrate_service = HydrateService()
