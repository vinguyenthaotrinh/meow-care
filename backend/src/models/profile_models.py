from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid
from datetime import datetime

class ProfileBase(BaseModel):
    username: Optional[str] = Field(default="Human", min_length=3, max_length=50)
    gender: Optional[str] = Field(default="female", pattern="^(male|female)$")
    weight: Optional[float] = Field(default=50, gt=0)
    height: Optional[float] = Field(default=160, gt=0)
    age: Optional[int] = Field(default=20, ge=1, le=100)

class ProfileCreate(ProfileBase):
    user_id: Optional[str] = None # uuid.UUID

class ProfileResponse(ProfileBase):
    daily_calories: Optional[float] = None
    daily_water: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
