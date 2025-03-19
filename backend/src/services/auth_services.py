import uuid
from models import UserCreate, UserResponse
from utils import supabase, hash_password, verify_password, generate_jwt, generate_salt, AuthError

class AuthService:
    def __init__(self):
        self.client = supabase

    def register_user(self, user_data: UserCreate):
        user_data.id = str(uuid.uuid4())
        salt = generate_salt()
        user_data.password = hash_password(user_data.password, salt)
        
        try:
            response = self.client.table("users").insert(user_data.model_dump()).execute()
            if not response.data:
                raise AuthError("User registration failed", 500)
            return UserResponse(**response.data[0])
        except Exception as e:
            error_message = str(e).lower()
            if "already exists" in error_message:
                raise AuthError("Email or username already registered", 409)
            raise AuthError(f"Database error {e}", 500)

    def login_user(self, email: str, password: str):        
        try:
            response = self.client.table("users").select("*").eq("email", email).single().execute() # single trả về 1 dict thay vì list
            if not response.data:
                raise AuthError("Invalid email or password", 401)
        except AuthError:
            raise
        except Exception as e:
            error_message = str(e).lower()
            if "0 rows" in error_message:
                raise AuthError("Invalid email or password", 401)
            raise AuthError(f"Database error {e}", 500)

        user_data = response.data       
        if not verify_password(password, user_data.get("password")):
            raise AuthError("Invalid email or password", 401)

        return generate_jwt(UserResponse(**user_data))

auth_service = AuthService() # Tạo instance một lần duy nhất
