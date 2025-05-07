from datetime import datetime, timezone, timedelta
from ..utils import supabase, ServiceError, DEBUG
from .xp_reward_services import xp_reward_service

class FocusService:
    def __init__(self):
        self.client = supabase

    def set_focus_habit(self, user_id, data):
        focus_goal = data.get("focus_goal")
        if not focus_goal:
            raise ServiceError("Missing focus_goal field", 400)

        try:
            # Upsert habit
            habit_response = self.client.table("focus_habits").upsert(
                {
                    "user_id": user_id,
                    "focus_goal": focus_goal,
                }
            ).execute()
            if not habit_response.data:
                raise ServiceError("Database server error", 500)

            # Delete today’s log if exists
            today = datetime.now(timezone(timedelta(hours=7))).date()
            self.client.table("focus_logs").delete().eq("user_id", user_id).eq("date", today).execute()

            # Insert new log for today
            log = {
                "user_id": user_id,
                "focus_done": 0,
                "date": today.isoformat(),
                "completed": False
            }
            logs_response = self.client.table("focus_logs").insert([log]).execute()
            if not logs_response.data:
                raise ServiceError("Database server error", 500)

            return habit_response.data[0]
        except ServiceError:
            raise
        except Exception as e:
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

    def get_focus_habit(self, user_id):
        try:
            response = self.client.table("focus_habits").select("*") \
                .eq("user_id", user_id).single().execute()
            if not response.data:
                raise ServiceError("Focus habit not found", 404)
            return response.data
        except ServiceError:
            raise
        except Exception as e:
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

    def get_focus_logs_today(self, user_id):
        today = datetime.now(timezone(timedelta(hours=7))).date()
        try:
            response = self.client.table("focus_logs").select("*") \
                .eq("user_id", user_id).eq("date", today).execute()
            if not response.data:
                raise ServiceError("No focus logs found for today", 404)
            return response.data
        except ServiceError:
            raise
        except Exception as e:
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

    def update_focus_log(self, user_id, log_id, minutes):
        try:
            log_response = self.client.table("focus_logs").select("id, user_id, focus_done") \
                .eq("id", log_id).eq("user_id", user_id).single().execute()
            if not log_response.data:
                raise ServiceError("Focus log not found", 404)

            log = log_response.data

            habit_response = self.client.table("focus_habits").select("focus_goal") \
                .eq("user_id", user_id).single().execute()
            if not habit_response.data:
                raise ServiceError("Focus habit not found", 404)

            new_done = log["focus_done"] + minutes
            completed = new_done >= habit_response.data["focus_goal"]

            updated_response = self.client.table("focus_logs").update({
                "focus_done": new_done,
                "completed": completed
            }).eq("id", log_id).execute()

            if not updated_response.data:
                raise ServiceError("Database server error", 500)

            xp_reward_service.update_streak(user_id)

            return updated_response.data[0]
        except ServiceError:
            raise
        except Exception as e:
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

focus_service = FocusService()
