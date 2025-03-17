import uuid
from models import UserCreate, UserResponse
from utils import supabase, hash_password, verify_password, generate_jwt

class AuthService:
    def __init__(self):
        self.client = supabase

    def register_user(self, user_data: UserCreate):
        user_data.password_hash = hash_password(user_data.password_hash)
        user_data.id = str(uuid.uuid4())

        response = self.client.table("users").insert(user_data.model_dump()).execute()
        if response.get("error"):
            return None, response["error"]

        return UserResponse(**response["data"][0]), None

    def login_user(self, email: str, password: str):
        response = self.client.table("users").select("*").eq("email", email).single().execute()
        if response.get("error") or not response.get("data"):
            return None, "Invalid email or password"

        user = UserResponse(**response["data"])
        if not verify_password(password, user.password_hash):
            return None, "Invalid email or password"

        return generate_jwt(user), None

auth_service = AuthService()
