# routes/quest_routes.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
# Removed UUID import
from ..services import quest_service
from ..utils import ServiceError, DEBUG
from ..models import QuestWithProgressResponse

quest_bp = Blueprint("quest", __name__)

@quest_bp.route("", methods=["GET"])
@jwt_required()
def get_quests():
    """Get all active quests with user's current progress."""
    user_id = get_jwt_identity() # Keep as string from token
    try:
        # Pass string ID directly to service
        quests_with_progress = quest_service.get_quests_with_progress(user_id)
        response_data = [q.model_dump(mode='json') for q in quests_with_progress]
        return jsonify(response_data), 200
    # Removed ValueError catch for UUID
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        error_message = str(e) if DEBUG else "Internal server error"
        print(f"Error in GET /quests: {e}")
        return jsonify({"error": error_message}), 500

# Route parameter quest_id is now treated as string by default
@quest_bp.route("/<quest_id>/claim", methods=["POST"])
@jwt_required()
def claim_quest(quest_id: str): # Accept string
    """Claim the reward for a specific completed quest."""
    user_id = get_jwt_identity() # Keep as string
    try:
        # Pass string IDs directly to service
        updated_rewards = quest_service.claim_quest_reward(user_id, quest_id)
        return jsonify({
            "message": "Reward claimed successfully!",
            "rewards": updated_rewards.model_dump(mode='json')
            }), 200
    # Removed ValueError catch for UUID
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        error_message = str(e) if DEBUG else "Internal server error"
        print(f"Error in POST /quests/{quest_id}/claim: {e}")
        return jsonify({"error": error_message}), 500