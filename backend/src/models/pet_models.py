from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid
from datetime import datetime

class PetBase(BaseModel):
    user_id: uuid.UUID
    name: str = Field(..., max_length=255)
    mood: str = Field(..., pattern="^(happy|neutral|sad)$")
    weight: float = Field(default=1.0, gt=0)  # Trọng lượng phải > 0

class PetCreate(PetBase):
    pass

class PetResponse(PetBase):
    id: uuid.UUID
    last_fed: Optional[datetime] = None
    last_played: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
