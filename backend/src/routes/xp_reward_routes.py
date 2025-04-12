from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services import xp_reward_service
from ..utils import ServiceError, DEBUG

xp_bp = Blueprint("xp", __name__)

@xp_bp.route("", methods=["GET"])
@jwt_required()
def get_xp_rewards():
    user_id = get_jwt_identity()
    try:
        data = xp_reward_service.get_rewards(user_id)
        return jsonify(data), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500

@xp_bp.route("/checkin", methods=["PUT"])
@jwt_required()
def daily_checkin():
    user_id = get_jwt_identity()
    try:
        updated = xp_reward_service.update_checkin(user_id)
        return jsonify(updated), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500

@xp_bp.route("/streak", methods=["PUT"])
@jwt_required()
def update_streak():
    user_id = get_jwt_identity()
    try:
        updated = xp_reward_service.update_streak(user_id)
        return jsonify(updated), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500
