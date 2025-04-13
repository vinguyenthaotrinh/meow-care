from datetime import datetime, timezone, timedelta
from ..utils import supabase, ServiceError, DEBUG
from .xp_reward_services import xp_reward_service
from .quest_services import quest_service

class DietService:
    def __init__(self):
        self.client = supabase

    def set_diet_habit(self, user_id, data):
        calories_goal = data.get("calories_goal")
        reminder_time = data.get("reminder_time", [])

        if not calories_goal:
            raise ServiceError("Missing required fields", 400)

        try:
            # Lưu habit (Upsert: Nếu có thì cập nhật, chưa có thì tạo mới)
            habit_response = self.client.table("diet_habits").upsert(
                {
                    "user_id": user_id,
                    "calories_goal": calories_goal,
                    "reminder_time": reminder_time
                }
            ).execute()
            if not habit_response.data:
                raise ServiceError("Database server error", 500)

            # Xóa Diet Logs hôm nay (tránh trùng lặp)
            today = datetime.now(timezone(timedelta(hours=7))).date()
            self.client.table("diet_logs").delete().eq("user_id", user_id).eq("date", today).execute()

            # Tạo Diet Log hôm nay
            diet_log = {
                "user_id": user_id,
                "calories_goal": calories_goal,
                "dishes": [],
                "consumed_calories": 0,
                "date": today.isoformat(),
                "completed": False
            }
            logs_response = self.client.table("diet_logs").insert([diet_log]).execute()
            if not logs_response.data:
                raise ServiceError("Database server error", 500)

            return habit_response.data[0]
        except ServiceError:
            raise
        except Exception as e:
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

    def get_diet_habit(self, user_id):
        try:
            response = self.client.table("diet_habits").select("*") \
                .eq("user_id", user_id) \
                .execute()

            if not response.data:
                raise ServiceError("Diet habit not found", 404)
            return response.data[0]
        except ServiceError:
            raise
        except Exception as e:
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

    def get_diet_logs_today(self, user_id):
        today = datetime.now(timezone(timedelta(hours=7))).date()
        try:
            response = self.client.table("diet_logs").select("*") \
                .eq("user_id", user_id) \
                .eq("date", today) \
                .execute()

            if not response.data:
                raise ServiceError("No diet logs found for today", 404)
            return response.data
        except ServiceError:
            raise
        except Exception as e:
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

    def get_diet_logs_week(self, user_id):
        today = datetime.now(timezone(timedelta(hours=7))).date()
        monday = today - timedelta(days=today.weekday())

        try:
            response = self.client.table("diet_logs").select("*") \
                .eq("user_id", user_id) \
                .gte("date", monday) \
                .lte("date", today) \
                .execute()

            if not response.data:
                raise ServiceError("No diet logs found for this week", 404)
            return response.data
        except ServiceError:
            raise
        except Exception as e:
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

    def update_diet_log(self, user_id, log_id, data):
        try:
            log_response = self.client.table("diet_logs").select("id, user_id, dishes, consumed_calories, calories_goal") \
                .eq("id", log_id) \
                .eq("user_id", user_id) \
                .execute()

            if not log_response.data:
                raise ServiceError("Diet log not found", 404)

            log = log_response.data[0]
            # new_dishes = log["dishes"] + [data]
            new_dishes_to_add = data.get("dishes", []) # Lấy danh sách món ăn từ data, mặc định là list rỗng nếu không có
            current_dishes = log["dishes"] if log["dishes"] else [] # Đảm bảo log["dishes"] là list, xử lý trường hợp có thể là None/rỗng
            new_dishes = current_dishes + new_dishes_to_add # Mở rộng danh sách món ăn hiện tại với món ăn mới
            
            # new_consumed = log["consumed_calories"] + data.get("calories", 0)
            new_consumed = sum(dish.get("calories", 0) for dish in new_dishes) # Tính tổng calories từ tất cả dishes trong new_dishes
            completed = new_consumed >= log["calories_goal"]

            updated_response = self.client.table("diet_logs").update({
                "dishes": new_dishes,
                "consumed_calories": new_consumed,
                "completed": completed
            }).eq("id", log_id).execute()
            
            xp_reward_service.update_streak(user_id)
            increment_value = len(new_dishes_to_add) # Increment by number of valid dishes added
            if increment_value > 0:
                quest_service.update_quest_progress(user_id, 'log_meal', increment=increment_value)

            return updated_response.data[0]
        except ServiceError:
            raise
        except Exception as e:
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

diet_service = DietService()
