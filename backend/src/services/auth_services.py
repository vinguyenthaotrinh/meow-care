import uuid
from ..models import UserCreate, UserResponse, ProfileCreate
from ..utils import supabase, hash_password, verify_password, generate_jwt, generate_salt, ServiceError, DEBUG

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
                raise ServiceError("Database server error", 500)

            # Chèn user_profile với user_id mới tạo
            profile_data = ProfileCreate(user_id=user_data.id)
            response_profile = self.client.table("profiles").insert(profile_data.model_dump()).execute()
            if not response_profile.data:
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
                raise ServiceError("bla bla Database server error", 500)
            user_data = response.data       
            if not verify_password(password, user_data.get("password")):
                raise ServiceError("Invalid email or password", 401)
            print(user_data) 
            return generate_jwt(UserResponse(**user_data))
        except ServiceError:
            raise
        except Exception as e:
            error_message = str(e).lower()
            if "0 rows" in error_message:
                raise ServiceError("Invalid email or password", 401)
            raise ServiceError(str(e) if DEBUG else "Database server error", 500)

auth_service = AuthService() # Tạo instance một lần duy nhất
