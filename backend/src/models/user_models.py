from pydantic import BaseModel, EmailStr, Field, ConfigDict # pydantic: data validation, transformation, serialization
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    role: Optional[str] = Field(default="user", pattern="^(user|admin)$")

class UserCreate(UserBase):
    id: Optional[str] = None
    password: str  # Hash password trước khi lưu
class UserResponse(UserBase):
    id: str # uuid.UUID
    reset_token: Optional[str] = None
    reset_token_expiration: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True) # from_attributes: convert model to Pydantic model

