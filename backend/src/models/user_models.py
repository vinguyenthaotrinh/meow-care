from pydantic import BaseModel, EmailStr, Field, ConfigDict # pydantic: data validation, transformation, serialization
from typing import Optional
import uuid
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    role: Optional[str] = Field(default="user", pattern="^(user|admin)$")

class UserCreate(UserBase):
    id: Optional[uuid.UUID] = None
    password: str  # Hash password trước khi lưu
    salt: Optional[str] = None  # Salt để hash password
class UserResponse(UserBase):
    id: uuid.UUID
    reset_token: Optional[str] = None
    reset_token_expiration: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True) # from_attributes: convert model to Pydantic model

