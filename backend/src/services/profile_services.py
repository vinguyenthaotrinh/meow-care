from ..models import ProfileResponse, ProfileCreate
from ..utils import supabase, hash_password, verify_password, ServiceError, generate_salt

class ProfileService:
    def __init__(self):
        self.client = supabase

    def get_user_profile(self, user_id: str):
        try:
            response = self.client.table("profiles").select("*").eq("user_id", user_id).single().execute()
            if not response.data:
                raise ServiceError("Database server error", 500)
            return ProfileResponse(**response.data).model_dump()
        except ServiceError:
            raise
        except Exception:
            raise ServiceError("Database server error", 500)

    def update_user_profile(self, user_id: str, user_data: ProfileCreate):
        try:
            response = self.client.table("profiles").update(user_data.model_dump()).eq("user_id", user_id).single().execute()
            if not response.data:
                raise ServiceError("Database server error", 500)
            return ProfileResponse(**response.data).model_dump()
        except ServiceError:
            raise
        except Exception:
            raise ServiceError("Database server error", 500)

    def change_password(self, user_id: str, old_password: str, new_password: str):
        try:
            response = self.client.table("users").select("password").eq("id", user_id).single().execute()
            if not response.data:
                raise ServiceError("Database server error", 500)

            stored_password = response.data["password"]
            if not verify_password(old_password, stored_password):
                raise ServiceError("Incorrect old password", 401)
            salt = generate_salt()
            hashed_new_password = hash_password(new_password, salt)
            update_response = self.client.table("users").update({"password": hashed_new_password}).eq("id", user_id).execute()
            if not update_response.data:
                raise ServiceError("Database server error", 500)
        except ServiceError:
            raise
        except Exception:
            raise ServiceError("Database server error", 500)

profile_service = ProfileService()
