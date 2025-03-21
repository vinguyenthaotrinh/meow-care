import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from ..models import UserResponse
from .config import JWT_SECRET_KEY

def generate_salt() -> str:
    return bcrypt.gensalt().decode("utf-8")

def hash_password(password: str, salt: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), salt.encode("utf-8")).decode("utf-8")

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))

def generate_jwt(user: UserResponse) -> str:
    payload = {
        "sub": user.id,
        "exp": datetime.now(timezone.utc) + timedelta(days=1), # Token hết hạn sau 1 ngày
        "role": user.role
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm="HS256")

def verify_token(token):
    try:
        decoded = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        return decoded
    except jwt.ExpiredSignatureError:
        return None  # Token hết hạn
    except jwt.InvalidTokenError:
        return None  # Token không hợp lệ