from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid
from datetime import datetime, date, time

class SleepHabitBase(BaseModel):
    sleep_time: time
    wakeup_time: time

class SleepHabitCreate(SleepHabitBase):
    user_id: Optional[str] = None # uuid.UUID

class SleepHabitResponse(SleepHabitBase):
    model_config = ConfigDict(from_attributes=True)

class SleepLogBase(BaseModel):
    user_id: str # uuid.UUID
    task_type: str = Field(..., pattern="^(sleep|wakeup)$")
    scheduled_time: datetime  # Thời gian cụ thể
    completed: Optional[bool] = Field(default=False)

class SleepLogCreate(SleepLogBase):
    pass

class SleepLogResponse(SleepLogBase):
    id: str # uuid.UUID

    model_config = ConfigDict(from_attributes=True)
