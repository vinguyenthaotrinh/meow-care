import uuid
from models import UserCreate, UserResponse
from utils import supabase, hash_password, verify_password, generate_jwt, generate_salt

class AuthService:
    def __init__(self):
        self.client = supabase

    def register_user(self, user_data: UserCreate):
        user_data.id = str(uuid.uuid4())
        salt = generate_salt()
        user_data.password = hash_password(user_data.password, salt)
        try:
            response = self.client.table("users").insert(user_data.model_dump()).execute()
        except Exception as e:
            return None, str(e)

        return UserResponse(**response.data[0]), None

    def login_user(self, email: str, password: str):
        try:
            response = self.client.table("users").select("*").eq("email", email).single().execute() # single trả về 1 dict thay vì list
        except Exception as e:
            return None, str(e)
        
        if not response.data:
            return None, "Invalid email or password"

        user_data = response.data       
        if not verify_password(password, user_data.get("password")):
            return None, "Invalid email or password"

        return generate_jwt(UserResponse(**user_data)), None

auth_service = AuthService()
