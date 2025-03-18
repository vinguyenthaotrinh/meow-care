import bcrypt
import jwt
from datetime import datetime, timedelta
from models import UserCreate, UserResponse
from utils import JWT_SECRET

def generate_salt() -> str:
    return bcrypt.gensalt().decode("utf-8")

def hash_password(password: str, salt: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), salt.encode("utf-8")).decode("utf-8")

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))

def generate_jwt(user: UserResponse) -> str:
    payload = {
        "sub": str(user.id),
        "exp": datetime.datetime.utcnow() + timedelta(days=1), # Token hết hạn sau 1 ngày
        "role": user.role
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def verify_token(token):
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return decoded
    except jwt.ExpiredSignatureError:
        return None  # Token hết hạn
    except jwt.InvalidTokenError:
        return None  # Token không hợp lệ