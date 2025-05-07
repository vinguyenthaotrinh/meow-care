import uuid
from ..models import UserCreate, UserResponse, ProfileCreate
from ..utils import supabase, hash_password, verify_password, generate_jwt, generate_salt, ServiceError, DEBUG
from datetime import datetime, timezone, timedelta

class AuthService:
    def __init__(self):
        self.client = supabase
        
    @staticmethod
    def get_current_period_start(quest_type: str) -> str:
        now_utc_plus7 = datetime.now(timezone.utc) + timedelta(hours=7)
        if quest_type == "daily":
            return now_utc_plus7.date().isoformat()
        elif quest_type == "monthly":
            return now_utc_plus7.replace(day=1).date().isoformat()
        return now_utc_plus7.date().isoformat()

    def register_user(self, user_data: UserCreate):
        user_data.id = str(uuid.uuid4())
        salt = generate_salt()
        user_data.password = hash_password(user_data.password, salt)

        today = datetime.now(timezone(timedelta(hours=7))).date()

        try:
            # Tạo user
            response = self.client.table("users").insert(user_data.model_dump()).execute()
            if not response.data:
                raise ServiceError("Database server error", 500)

            # Tạo profile
            profile_data = ProfileCreate(user_id=user_data.id)
            response_profile = self.client.table("profiles").insert(profile_data.model_dump()).execute()
            if not response_profile.data:
                raise ServiceError("Database server error", 500)

            # Tạo các habit mặc định
            default_sleep = {
                "user_id": user_data.id,
                "sleep_time": "23:00:00",
                "wakeup_time": "07:00:00"
            }
            default_hydrate = {
                "user_id": user_data.id,
                "water_goal": 2000.0,
                "cup_size": 250.0,
                "reminder_time": []
            }
            default_diet = {
                "user_id": user_data.id,
                "calories_goal": 2000.0,
                "reminder_time": []
            }
            default_focus = {
                "user_id": user_data.id,
                "focus_goal": 120  # 2h
            }

            self.client.table("sleep_habits").insert(default_sleep).execute()
            self.client.table("hydrate_habits").insert(default_hydrate).execute()
            self.client.table("diet_habits").insert(default_diet).execute()
            self.client.table("focus_habits").insert(default_focus).execute()

            # Tạo các log tương ứng cho hôm nay
            sleep_logs = [
                {
                    "user_id": user_data.id,
                    "task_type": "sleep",
                    "scheduled_time": f"{today}T23:00:00+07:00"
                },
                {
                    "user_id": user_data.id,
                    "task_type": "wakeup",
                    "scheduled_time": f"{(today + timedelta(days=1))}T07:00:00+07:00"
                }
            ]
            hydrate_log = {
                "user_id": user_data.id,
                "water_goal": 2000.0,
                "cup_size": 250.0,
                "consumed_water": 0.0,
                "date": str(today),
                "completed": False
            }
            diet_log = {
                "user_id": user_data.id,
                "calories_goal": 2000.0,
                "dishes": [],
                "consumed_calories": 0.0,
                "date": str(today),
                "completed": False
            }
            focus_log = {
                "user_id": user_data.id,
                "focus_done": 0,
                "date": str(today),
                "completed": False
            }

            self.client.table("sleep_logs").insert(sleep_logs).execute()
            self.client.table("hydrate_logs").insert(hydrate_log).execute()
            self.client.table("diet_logs").insert(diet_log).execute()
            self.client.table("focus_logs").insert(focus_log).execute()

            # Tạo user_quest_progress mặc định
            quests_response = self.client.table("quests").select("id, type").eq("is_active", True).execute()
            if not quests_response.data:
                raise ServiceError("No quests available", 500)

            quest_progress_data = [
                {
                    "user_id": user_data.id,
                    "quest_id": quest["id"],
                    "period_start_date": AuthService.get_current_period_start(quest["type"]),
                    "current_progress": 0
                }
                for quest in quests_response.data
            ]
            self.client.table("user_quest_progress").insert(quest_progress_data).execute()

            return UserResponse(**response.data[0]).model_dump()

        except ServiceError:
            raise
        except Exception as e:
            error_message = str(e).lower()
            if "created successfully" in error_message:
                raise ServiceError("User created successfully", 201)
            if "already exists" in error_message:
                raise ServiceError("Email already registered", 409)
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)


    def login_user(self, email: str, password: str):        
        try:
            response = self.client.table("users").select("*").eq("email", email).single().execute() # single trả về 1 dict thay vì list
            if not response.data:
                raise ServiceError("Database server error", 500)
            
            user_data = response.data       
            if not verify_password(password, user_data.get("password")):
                raise ServiceError("Invalid email or password", 401)
            
            return generate_jwt(UserResponse(**user_data))
        except ServiceError:
            raise
        except Exception as e:
            error_message = str(e).lower()
            if "0 rows" in error_message:
                raise ServiceError("Invalid email or password", 401)
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

auth_service = AuthService() # Tạo instance một lần duy nhất
