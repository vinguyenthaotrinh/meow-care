from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid
from datetime import datetime

class NotificationBase(BaseModel):
    user_id: uuid.UUID
    message: str
    read_status: Optional[bool] = Field(default=False)

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
