from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, date, time

class WaterHabitBase(BaseModel):
    user_id: str # uuid.UUID
    cup_size: float = Field(..., gt=0)  # Kích thước cốc phải > 0
    reminder_time: Optional[List[time]] = None

class WaterHabitCreate(WaterHabitBase):
    pass

class WaterHabitResponse(WaterHabitBase):
    id: str # uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class WaterLogBase(BaseModel):
    user_id: str # uuid.UUID
    habit_id: str # uuid.UUID
    date: date
    consumed_cups: int = Field(..., ge=0)  # Số cốc đã uống không thể âm
    completed: Optional[bool] = Field(default=False)

class WaterLogCreate(WaterLogBase):
    pass

class WaterLogResponse(WaterLogBase):
    id: str # uuid.UUID

    model_config = ConfigDict(from_attributes=True)
