# models/quest.py
from pydantic import BaseModel, Field
from typing import Optional, Literal, List
# Removed UUID import
from datetime import date, datetime

# --- Quest Definition ---
class QuestBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: Literal['daily', 'monthly']
    trigger_type: Optional[str] = None
    target_progress: int
    reward_type: Literal['coins', 'diamonds']
    reward_amount: int
    is_active: bool = True

class QuestResponse(QuestBase):
    id: str # Changed from UUID
    created_at: datetime

    class Config:
        from_attributes = True

# --- User Quest Progress ---
class UserQuestProgressBase(BaseModel):
    user_id: str # Changed from UUID
    quest_id: str # Changed from UUID
    current_progress: int = 0
    period_start_date: date
    claimed_at: Optional[datetime] = None

class UserQuestProgressResponse(UserQuestProgressBase):
    id: str # Changed from UUID
    last_updated: datetime

    class Config:
        from_attributes = True

# --- Combined Response for GET /quests ---
class QuestWithProgressResponse(QuestResponse):
    user_progress: Optional[UserQuestProgressResponse] = None
    is_completed: bool = False
    is_claimable: bool = False

# Model for updating progress specifically
class QuestProgressUpdate(BaseModel):
    user_id: str
    trigger_type: str
    increment_by: Optional[int] = 1 # Default increment
    set_value: Optional[int] = None # Option to set absolute value (e.g., for hydration)
    trigger_date: Optional[date] = None # Optional date context (defaults to today)
    
class XpRewardsData(BaseModel):
    user_id: str # Changed from UUID
    coins: int = 0
    diamonds: int = 0
    streak: int = 0
    daily_checkin: int = 0
    last_checkin_date: date = Field(default_factory=lambda: date(2000, 1, 1))
    last_streak_date: date = Field(default_factory=lambda: date(2000, 1, 1))

    class Config:
        from_attributes = True