from datetime import datetime, timedelta, timezone, date
from ..utils import supabase, ServiceError, DEBUG

class XPRewardService:
    def __init__(self):
        self.client = supabase

    def _format_dates(self, data):
        """Chuyển đổi các trường date về ISO format string"""
        for field in ["last_checkin_date", "last_streak_date"]:
            if isinstance(data.get(field), (datetime, date)):
                data[field] = data[field].isoformat()
        return data

    def get_rewards(self, user_id):
        try:
            today = datetime.now(timezone(timedelta(hours=7))).date()

            response = self.client.table("xp_rewards").select("*").eq("user_id", user_id).execute()
            if not response.data:
                new_data = {
                    "user_id": user_id,
                    "last_checkin_date": datetime(2000, 1, 1).date().isoformat(),
                    "last_streak_date": datetime(2000, 1, 1).date().isoformat(),
                }
                insert_resp = self.client.table("xp_rewards").insert(new_data).execute()
                if not insert_resp.data:
                    raise ServiceError("Database server error", 500)
                return self._format_dates(insert_resp.data[0])

            data = response.data[0]
            last_checkin_date = datetime.fromisoformat(data["last_checkin_date"]).date()
            last_streak_date = datetime.fromisoformat(data["last_streak_date"]).date()

            # Reset nếu bỏ qua 1 ngày
            if (today - last_checkin_date).days > 1:
                data["daily_checkin"] = 0
            if (today - last_streak_date).days > 1:
                data["streak"] = 0

            return self._format_dates(data)
        except Exception as e:
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

    def update_checkin(self, user_id):
        try:
            today = datetime.now(timezone(timedelta(hours=7))).date()
            response = self.client.table("xp_rewards").select("*").eq("user_id", user_id).execute()
            if not response.data:
                raise ServiceError("XP Rewards not found", 404)

            data = response.data[0]
            last_checkin_date = datetime.fromisoformat(data["last_checkin_date"]).date()

            if last_checkin_date == today:
                raise ServiceError("Already checked in today", 400)

            daily_checkin = data["daily_checkin"]
            coins = data["coins"]
            diamonds = data["diamonds"]

            if (today - last_checkin_date).days == 1:
                daily_checkin = (daily_checkin + 1) % 7
            else:
                daily_checkin = 1

            coins += 10
            if daily_checkin == 0:
                diamonds += 1

            update_data = {
                "daily_checkin": daily_checkin,
                "coins": coins,
                "diamonds": diamonds,
                "last_checkin_date": today.isoformat(),
            }

            updated = self.client.table("xp_rewards").update(update_data).eq("user_id", user_id).execute()
            if not updated.data:
                raise ServiceError("Database server error", 500)

            return self._format_dates(updated.data[0])
        except ServiceError:
            raise
        except Exception as e:
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

    def update_streak(self, user_id):
        try:
            today = datetime.now(timezone(timedelta(hours=7))).date()
            response = self.client.table("xp_rewards").select("*").eq("user_id", user_id).execute()
            if not response.data:
                raise ServiceError("XP Rewards not found", 404)

            data = response.data[0]
            last_streak_date = datetime.fromisoformat(data["last_streak_date"]).date()

            if last_streak_date != today:
                streak = data["streak"] + 1
            else:
                streak = data["streak"]
                # raise ServiceError("Streak already updated today", 400)

            update_data = {
                "streak": streak,
                "last_streak_date": today.isoformat()
            }

            updated = self.client.table("xp_rewards").update(update_data).eq("user_id", user_id).execute()
            if not updated.data:
                raise ServiceError("Database server error", 500)

            return self._format_dates(updated.data[0])
        except ServiceError:
            raise
        except Exception as e:
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

xp_reward_service = XPRewardService()
