from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid
from datetime import datetime, date, time

class FocusHabitBase(BaseModel):
    user_id: uuid.UUID

class FocusHabitCreate(FocusHabitBase):
    pass

class FocusHabitResponse(FocusHabitBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class FocusLogBase(BaseModel):
    user_id: uuid.UUID
    habit_id: uuid.UUID
    date: date
    focus_duration: int = Field(..., ge=0)  # Thời gian tập trung (phút) không thể âm
    completed: Optional[bool] = Field(default=False)

class FocusLogCreate(FocusLogBase):
    pass

class FocusLogResponse(FocusLogBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
