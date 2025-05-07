from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services import focus_service
from ..utils import ServiceError, DEBUG

focus_bp = Blueprint("focus", __name__)

@focus_bp.route("/habit", methods=["POST", "PUT"])
@jwt_required()
def set_focus_habit():
    user_id = get_jwt_identity()
    data = request.get_json()
    try:
        habit = focus_service.set_focus_habit(user_id, data)
        return jsonify(habit), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500

@focus_bp.route("/habit", methods=["GET"])
@jwt_required()
def get_focus_habit():
    user_id = get_jwt_identity()
    try:
        habit = focus_service.get_focus_habit(user_id)
        return jsonify(habit), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500

@focus_bp.route("/logs/today", methods=["GET"])
@jwt_required()
def get_focus_logs_today():
    user_id = get_jwt_identity()
    try:
        logs = focus_service.get_focus_logs_today(user_id)
        return jsonify(logs), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500

@focus_bp.route("/logs/<log_id>/update", methods=["PUT"])
@jwt_required()
def update_focus_log(log_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    minutes = data.get("minutes")

    if minutes is None or not isinstance(minutes, int) or minutes <= 0:
        return jsonify({"error": "Invalid minutes"}), 400

    try:
        updated_log = focus_service.update_focus_log(user_id, log_id, minutes)
        return jsonify(updated_log), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500
