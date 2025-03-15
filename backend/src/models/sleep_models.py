from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid
from datetime import datetime, date, time

class SleepHabitBase(BaseModel):
    user_id: uuid.UUID
    bedtime: time
    wakeup_time: time

class SleepHabitCreate(SleepHabitBase):
    pass

class SleepHabitResponse(SleepHabitBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SleepLogBase(BaseModel):
    user_id: uuid.UUID
    habit_id: uuid.UUID
    date: date
    sleep_duration: float = Field(..., gt=0)  # Thời gian ngủ phải > 0
    completed: Optional[bool] = Field(default=False)

class SleepLogCreate(SleepLogBase):
    pass

class SleepLogResponse(SleepLogBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
