from pydantic import BaseModel, Field, ConfigDict
import uuid

class FriendBase(BaseModel):
    user_id: str # uuid.UUID
    friend_id: str # uuid.UUID
    status: str = Field(..., pattern="^(pending|accepted|blocked)$")

class FriendCreate(FriendBase):
    pass

class FriendResponse(FriendBase):
    model_config = ConfigDict(from_attributes=True)
