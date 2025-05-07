from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date

class FocusHabitBase(BaseModel):
    focus_goal: int  
class FocusHabitCreate(FocusHabitBase):
    user_id: Optional[str] = None  # uuid.UUID

class FocusHabitResponse(FocusHabitBase):
    model_config = ConfigDict(from_attributes=True)

class FocusLogBase(BaseModel):
    user_id: str  # uuid.UUID
    focus_goal: int  # Khớp với SQL
    focus_done: int
    date: date
    completed: Optional[bool] = Field(default=False)

class FocusLogCreate(FocusLogBase):
    pass

class FocusLogResponse(FocusLogBase):
    id: str  # uuid.UUID

    model_config = ConfigDict(from_attributes=True)
