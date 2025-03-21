from pydantic import BaseModel, Field, ConfigDict
import uuid

class StoreItemBase(BaseModel):
    name: str = Field(..., max_length=255)
    category: str = Field(..., pattern="^(decoration|pet|other)$")
    price: int = Field(..., ge=0)  # Giá không thể âm

class StoreItemCreate(StoreItemBase):
    pass

class StoreItemResponse(StoreItemBase):
    id: str # uuid.UUID

    model_config = ConfigDict(from_attributes=True)

class UserItemBase(BaseModel):
    user_id: str # uuid.UUID
    item_id: str # uuid.UUID
    quantity: int = Field(..., ge=0)  # Số lượng không thể âm

class UserItemCreate(UserItemBase):
    pass

class UserItemResponse(UserItemBase):
    model_config = ConfigDict(from_attributes=True)
