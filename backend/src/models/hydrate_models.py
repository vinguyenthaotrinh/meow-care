from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import date, time

class HydrateHabitBase(BaseModel):
    water_goal: float  # Lượng nước mục tiêu (ml)
    cup_size: float  # Dung tích mỗi cốc nước (ml)
    reminder_time: Optional[List[time]] = None  # Danh sách thời gian nhắc nhở uống nước

class HydrateHabitCreate(HydrateHabitBase):
    user_id: Optional[str] = None  # uuid.UUID

class HydrateHabitResponse(HydrateHabitBase):
    model_config = ConfigDict(from_attributes=True)

class HydrateLogBase(BaseModel):
    user_id: str  # uuid.UUID
    consumed_water: float  # Lượng nước đã uống (ml)
    cup_size: float  # Dung tích cốc nước (ml)
    date: date  # Ngày uống nước
    completed: Optional[bool] = Field(default=False)  # Đánh dấu hoàn thành hay chưa

class HydrateLogCreate(HydrateLogBase):
    pass

class HydrateLogResponse(HydrateLogBase):
    id: str  # uuid.UUID

    model_config = ConfigDict(from_attributes=True)
