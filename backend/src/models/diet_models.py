from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
from datetime import date, time

class DietHabitBase(BaseModel):
    calories_goal: float  
    reminder_time: Optional[List[time]] = None 

class DietHabitCreate(DietHabitBase):
    user_id: Optional[str] = None  # uuid.UUID

class DietHabitResponse(DietHabitBase):
    model_config = ConfigDict(from_attributes=True)

class DietLogBase(BaseModel):
    user_id: str  # uuid.UUID
    calories_goal: float  # Khớp với SQL
    dishes: Dict  # Tương ứng với JSONB
    consumed_calories: float
    date: date
    completed: Optional[bool] = Field(default=False)

class DietLogCreate(DietLogBase):
    pass

class DietLogResponse(DietLogBase):
    id: str  # uuid.UUID

    model_config = ConfigDict(from_attributes=True)
