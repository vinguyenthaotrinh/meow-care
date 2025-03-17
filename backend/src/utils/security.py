import bcrypt
import jwt
from datetime import datetime, timedelta
from models import UserCreate, UserResponse
from utils import JWT_SECRET

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))

def generate_jwt(user: UserResponse) -> str:
    payload = {
        "sub": str(user.id),
        "exp": datetime.datetime.utcnow() + timedelta(days=1), # Token hết hạn sau 1 ngày
        "role": user.role
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")