from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid
from datetime import datetime

class UserProfileBase(BaseModel):
    gender: Optional[str] = Field(None, pattern="^(male|female|other)$")
    weight: Optional[float] = Field(None, gt=0)
    height: Optional[float] = Field(None, gt=0)
    age: Optional[int] = Field(None, ge=1, le=100)
    focus_goal: Optional[int] = Field(default=60)  # Mặc định 60 phút/ngày

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    user_id: str # uuid.UUID
    daily_calories: Optional[float] = None
    daily_water: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
