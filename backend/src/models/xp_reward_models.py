from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid
from datetime import date

class XPRewardsBase(BaseModel):
    xp: Optional[int] = Field(default=0, ge=0)
    streak: Optional[int] = Field(default=0, ge=0)

class XPRewardsCreate(XPRewardsBase):
    pass

class XPRewardsResponse(XPRewardsBase):
    user_id: uuid.UUID
    level: Optional[int] = 0  # Generated field
    last_streak_date: Optional[date] = None

    model_config = ConfigDict(from_attributes=True)
