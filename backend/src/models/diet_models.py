from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, date, time

class DietHabitBase(BaseModel):
    user_id: str # uuid.UUID
    reminder_time: Optional[List[time]] = None

class DietHabitCreate(DietHabitBase):
    pass

class DietHabitResponse(DietHabitBase):
    id: str # uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DietLogBase(BaseModel):
    user_id: str # uuid.UUID
    habit_id: str # uuid.UUID
    date: date
    consumed_calories: float = Field(..., gt=0)
    completed: Optional[bool] = Field(default=False)

class DietLogCreate(DietLogBase):
    pass

class DietLogResponse(DietLogBase):
    id: str # uuid.UUID

    model_config = ConfigDict(from_attributes=True)
