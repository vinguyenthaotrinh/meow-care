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
        
        try:
            response = self.client.table("users").insert(user_data.model_dump()).execute()
            if not response.data:
                raise ServiceError("Database server error", 500)

            # Chèn user_profile với user_id mới tạo
            profile_data = ProfileCreate(user_id=user_data.id)
            response_profile = self.client.table("profiles").insert(profile_data.model_dump()).execute()
            if not response_profile.data:
                raise ServiceError("Database server error", 500)
            
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

            insert_response = self.client.table("user_quest_progress").insert(quest_progress_data).execute()
            if not insert_response.data:
                raise ServiceError("Database server error", 500)
            
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
