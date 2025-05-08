# services/quest_service.py
from datetime import datetime, timedelta, timezone, date
# Removed UUID import
from typing import List, Optional, Dict
from ..utils import supabase, ServiceError, DEBUG
# Ensure imported models use 'str' for IDs
from ..models import HydrateLogResponse, DietLogResponse, SleepLogResponse, QuestResponse, UserQuestProgressResponse, QuestWithProgressResponse, XpRewardsData
from .xp_reward_services import xp_reward_service

class QuestService:
    def __init__(self):
        self.client = supabase
        self.local_tz = timezone(timedelta(hours=7)) # Adjust to your local timezone offset

    def _get_current_period_starts(self) -> (date, date): # type: ignore
        """Gets the start date for today (daily) and the current month (monthly)."""
        now_local = datetime.now(self.local_tz)
        today_start = now_local.date()
        month_start = today_start.replace(day=1)
        return today_start, month_start

    def _get_or_create_user_progress(self, user_id: str, quest_id: str, period_start: date) -> Optional[dict]:
        """Fetches or creates a progress record for a specific period. Uses string IDs."""
        try:
            progress_res = self.client.table("user_quest_progress")\
                .select("*")\
                .eq("user_id", user_id)\
                .eq("quest_id", quest_id)\
                .eq("period_start_date", period_start.isoformat())\
                .maybe_single()\
                .execute()

            if progress_res.data:
                # Reset progress if the period_start_date in DB is older than the calculated one
                # This handles daily/monthly resets automatically on first fetch of the new period
                db_period_start = date.fromisoformat(progress_res.data['period_start_date'])
                if db_period_start < period_start:
                    print(f"Resetting progress for Quest {quest_id}, User {user_id}. DB period: {db_period_start}, Current period: {period_start}")
                    reset_res = self.client.table("user_quest_progress")\
                        .update({"current_progress": 0, "claimed_at": None, "period_start_date": period_start.isoformat()})\
                        .eq("id", progress_res.data['id'])\
                        .execute()
                    if reset_res.data:
                        return reset_res.data[0]
                    else:
                         print(f"Error resetting progress: {reset_res.error}")
                         # Fallback to returning old data? Or raise? For now, return old.
                         return progress_res.data
                else:
                    return progress_res.data # Return existing data for current period

            # If no record exists for this period (or any previous), create one
            print(f"Creating new progress record for Quest {quest_id}, User {user_id}, Period {period_start}")
            new_progress = {
                "user_id": user_id,
                "quest_id": quest_id,
                "current_progress": 0,
                "period_start_date": period_start.isoformat(),
                "claimed_at": None,
            }
            insert_res = self.client.table("user_quest_progress").insert(new_progress).execute()

            if insert_res.data:
                return insert_res.data[0]
            else:
                 print(f"Error creating progress for user {user_id}, quest {quest_id}, period {period_start}: {insert_res.error}")
                 return None

        except Exception as e:
            print(f"DB Error in _get_or_create_user_progress for quest {quest_id}, user {user_id}: {e}")
            return None

    def _fetch_dependent_data(self, user_id: str, today_start: date, month_start: date) -> Dict:
        """Fetches data needed for automatic quest progress calculation."""
        dependent_data = {
            "daily_hydrate_ml": 0,
            "daily_tasks_completed": 0, # Count completed SleepLog tasks today
            "daily_meals_logged": 0, # Count non-empty DietLog dishes today
            "daily_focus_minutes": 0,
            "daily_checkin_done": False,
            "monthly_daily_quests_claimed": 0,
        }
        try:
            # Hydrate Log
            hydrate_res = self.client.table("hydrate_logs").select("consumed_water").eq("user_id", user_id).eq("date", today_start.isoformat()).maybe_single().execute()
            if hydrate_res.data:
                dependent_data["daily_hydrate_ml"] = hydrate_res.data.get("consumed_water", 0)

            # Daily Task Completion (Sleep Logs)
            sleep_tasks_res = self.client.table("sleep_logs").select("id", count='exact').eq("user_id", user_id).eq("completed", True).gte("scheduled_time", today_start.isoformat() + " 00:00:00").lt("scheduled_time", (today_start + timedelta(days=1)).isoformat() + " 00:00:00").execute()
            if sleep_tasks_res.count is not None:
                 dependent_data["daily_tasks_completed"] = sleep_tasks_res.count

            # Meal Logging (Diet Logs) - Check if 'dishes' JSON is not empty/null
            # Note: JSON checks can be DB-specific. This checks if the key exists and is not an empty list/object.
            # Adjust based on how you store empty dishes ('[]', '{}', or null)
            diet_res = self.client.table("diet_logs").select("id", count='exact').eq("user_id", user_id).eq("date", today_start.isoformat()).not_.in_("dishes", ['[]', '{}']).not_.is_("dishes", None).execute()
            if diet_res.count is not None:
                 dependent_data["daily_meals_logged"] = diet_res.count
                 
            # Focus Logs - Sum of durations today
            focus_res = self.client.table("focus_logs")\
                .select("focus_done")\
                .eq("user_id", user_id)\
                .eq("date", today_start.isoformat())\
                .execute()
            if focus_res.data:
                total_focus_min = sum(log.get("focus_done", 0) for log in focus_res.data)
                dependent_data["daily_focus_minutes"] = total_focus_min


             # Check-in Status (from xp_rewards)
            xp_res = self.client.table("xp_rewards").select("last_checkin_date").eq("user_id", user_id).maybe_single().execute()
            if xp_res.data and xp_res.data.get("last_checkin_date"):
                 last_checkin = date.fromisoformat(xp_res.data["last_checkin_date"])
                 if last_checkin == today_start:
                     dependent_data["daily_checkin_done"] = True

            # Monthly Quest Claims
            start_of_month_iso = month_start.isoformat()
            end_of_next_month_iso = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1).isoformat()
            # TODO: This still needs refinement - ideally join with quests table to ensure only 'daily' type quests are counted
            count_res = self.client.table("user_quest_progress")\
                .select("id", count='exact')\
                .match({'user_id': user_id})\
                .not_.is_("claimed_at", None)\
                .gte("period_start_date", start_of_month_iso)\
                .lt("period_start_date", end_of_next_month_iso)\
                .execute()
            if count_res.count is not None:
                 dependent_data["monthly_daily_quests_claimed"] = count_res.count

        except Exception as e:
            print(f"Error fetching dependent data for user {user_id}: {e}")
            # Return defaults on error, quests requiring this data won't update automatically
        return dependent_data

    def get_quests_with_progress(self, user_id: str) -> List[QuestWithProgressResponse]:
        """Fetches all active quests and the user's progress for the current period. Uses string IDs."""
        try:
            today_start, month_start = self._get_current_period_starts()

            # 1. Fetch dependent data needed for updates
            live_data = self._fetch_dependent_data(user_id, today_start, month_start)

            # 2. Fetch all active quests
            quests_res = self.client.table("quests").select("*").eq("is_active", True).execute()
            if not quests_res.data:
                return []

            results: List[QuestWithProgressResponse] = []

            # 3. Get/Create/Update progress for each quest
            for quest_dict in quests_res.data:
                quest = QuestResponse.model_validate(quest_dict)
                period_start = today_start if quest.type == 'daily' else month_start

                # Get or create ensures we have a record for the *current* period
                progress_dict = self._get_or_create_user_progress(user_id, quest.id, period_start)

                current_progress_val = 0
                if progress_dict:
                    current_progress_val = progress_dict.get("current_progress", 0)
                else:
                    # If creation failed, skip automatic updates for this quest
                     print(f"Skipping auto-update for quest {quest.id} due to missing progress record.")
                     # Continue to process the quest with 0 progress

                # --- Automatic Progress Updates Based on Live Data ---
                updated_progress_required = False
                if progress_dict and progress_dict.get("claimed_at") is None: # Only update if not claimed
                    target_value = 0
                    if quest.trigger_type == 'hydrate_goal':
                        target_value = live_data["daily_hydrate_ml"]
                    elif quest.trigger_type == 'tasks_completed':
                         target_value = live_data["daily_tasks_completed"]
                    elif quest.trigger_type == 'log_meal':
                         target_value = live_data["daily_meals_logged"]
                    elif quest.trigger_type == 'focus_time':
                         target_value = live_data.get("daily_focus_minutes", 0)
                    elif quest.trigger_type == 'checkin':
                         target_value = 1 if live_data["daily_checkin_done"] else 0
                    elif quest.trigger_type == 'monthly_daily_quests':
                         target_value = live_data["monthly_daily_quests_claimed"]
                    # Add more trigger types as needed

                    # Update if the calculated progress is different from stored progress
                    # Cap progress at target_progress for non-accumulative goals like checkin/log_meal
                    effective_target = quest.target_progress if quest.trigger_type not in ['checkin', 'log_meal'] else 1
                    final_progress = min(target_value, effective_target) # Use actual target from quest def

                    if final_progress != current_progress_val:
                        current_progress_val = final_progress
                        progress_dict["current_progress"] = current_progress_val # Update dict for calculations below
                        updated_progress_required = True

                # --- Update DB if progress changed (and record exists) ---
                if updated_progress_required and progress_dict:
                    try:
                        update_res = self.client.table("user_quest_progress")\
                            .update({"current_progress": current_progress_val})\
                            .eq("id", progress_dict["id"])\
                            .execute()
                        if not update_res.data:
                            print(f"Warning: Failed to update progress in DB for quest {quest.id}, user {user_id}")
                    except Exception as update_e:
                         print(f"DB Error updating progress for quest {quest.id}, user {user_id}: {update_e}")

                # --- Calculate final state ---
                user_progress_model: Optional[UserQuestProgressResponse] = None
                is_completed = False
                is_claimable = False
                if progress_dict:
                    # Use the potentially updated progress value
                    progress_dict['current_progress'] = current_progress_val
                    user_progress_model = UserQuestProgressResponse.model_validate(progress_dict)
                    is_completed = user_progress_model.current_progress >= quest.target_progress
                    is_claimable = is_completed and user_progress_model.claimed_at is None


                results.append(
                    QuestWithProgressResponse(
                        **quest.model_dump(),
                        user_progress=user_progress_model,
                        is_completed=is_completed,
                        is_claimable=is_claimable
                    )
                )

            return results

        except Exception as e:
            print(f"Error fetching quests with progress: {e}")
            raise ServiceError(str(e) if DEBUG else "Failed to load quests", 500)

    # --- update_quest_progress (Called by other services - Requires Dependency Injection or Event Bus ideally) ---
    # This is the method other services *should* call.
    # For now, it's less critical as get_quests_with_progress recalculates based on triggers.
    def update_quest_progress(self, user_id: str, trigger_type: str, increment: int = 1, value: Optional[int] = None):
        """
        Updates progress for relevant quests based on a trigger type.
        'increment' adds to existing progress. 'value' sets the progress directly.
        NOTE: This requires careful implementation to avoid race conditions if called frequently.
              The get_quests_with_progress method currently handles most updates by recalculating.
        """
        print(f"Placeholder: update_quest_progress called for user {user_id}, trigger {trigger_type}, increment {increment}, value {value}")
        # 1. Find active quests matching the trigger_type.
        # 2. Determine the correct period_start_date (daily/monthly).
        # 3. Get or create the user_quest_progress record for that period.
        # 4. If the quest is not already claimed:
        #    - Calculate the new progress (either add increment or set value, ensuring not to exceed target).
        #    - Update the record in the database.
        # This requires careful handling of concurrency and is less reliable than the fetch-time calculation
        # used in get_quests_with_progress without proper transactional updates or event sourcing.
        pass


    def claim_quest_reward(self, user_id: str, quest_id: str) -> XpRewardsData:
        """Claims the reward for a completed quest for the current period. Uses string IDs."""
        # (Keep the Warning about atomicity)
        try:
            today_start, month_start = self._get_current_period_starts()

            # 1. Get Quest Definition
            quest_res = self.client.table("quests").select("*").eq("id", quest_id).eq("is_active", True).maybe_single().execute()
            if not quest_res.data: raise ServiceError("Quest not found or not active", 404)
            quest = QuestResponse.model_validate(quest_res.data)

            # 2. Get Current Period Progress
            period_start = today_start if quest.type == 'daily' else month_start
            progress_res = self.client.table("user_quest_progress").select("*").eq("user_id", user_id).eq("quest_id", quest_id).eq("period_start_date", period_start.isoformat()).maybe_single().execute()
            if not progress_res.data: raise ServiceError("Quest progress not found for the current period", 404)
            progress = UserQuestProgressResponse.model_validate(progress_res.data)

            # 3. Validate Claim
            if progress.claimed_at is not None: raise ServiceError("Reward already claimed for this period", 400)

            # Recalculate completion based on current state, especially for aggregate quests
            is_completed = False
            if quest.trigger_type == 'monthly_daily_quests':
                 live_data = self._fetch_dependent_data(user_id, today_start, month_start)
                 is_completed = live_data["monthly_daily_quests_claimed"] >= quest.target_progress
            # TODO: Add similar recalculations for other trigger types if their progress might change
            # between fetch and claim (e.g., tasks_completed)
            elif quest.trigger_type in ['hydrate_goal', 'log_meal', 'checkin']:
                 # For these, trust the progress value fetched/updated earlier in the request lifecycle
                 # or recalculate if needed (fetch live data again)
                 is_completed = progress.current_progress >= quest.target_progress
            else: # Default case, trust stored progress
                is_completed = progress.current_progress >= quest.target_progress

            if not is_completed: raise ServiceError("Quest not completed yet", 400)

            # 4. Update User's XP/Rewards
            current_rewards_data = xp_reward_service.get_rewards(user_id)
            new_coins = current_rewards_data['coins']
            new_diamonds = current_rewards_data['diamonds']
            if quest.reward_type == 'coins': new_coins += quest.reward_amount
            elif quest.reward_type == 'diamonds': new_diamonds += quest.reward_amount
            xp_update_res = self.client.table("xp_rewards").update({"coins": new_coins, "diamonds": new_diamonds}).eq("user_id", user_id).execute()
            if not xp_update_res.data: raise ServiceError("Failed to update rewards", 500)

            # 5. Mark Quest Progress as Claimed
            claim_time = datetime.now(timezone.utc)
            progress_update_res = self.client.table("user_quest_progress").update({"claimed_at": claim_time.isoformat()}).eq("id", progress.id).execute()
            if not progress_update_res.data: raise ServiceError("Failed to finalize claim status", 500) # See warning in previous version

            updated_rewards = xp_reward_service.get_rewards(user_id)
            return XpRewardsData.model_validate(updated_rewards)

        except ServiceError as e: raise e
        except Exception as e:
            print(f"Error claiming quest {quest_id} reward for user {user_id}: {e}")
            raise ServiceError(str(e) if DEBUG else "Failed to claim reward", 500)

quest_service = QuestService()