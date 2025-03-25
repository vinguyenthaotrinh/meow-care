from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services import hydrate_service
from ..utils import ServiceError, DEBUG
from pydantic import ValidationError

hydrate_bp = Blueprint("hydrate", __name__)

@hydrate_bp.route("/habit", methods=["POST", "PUT"])
@jwt_required()
def set_hydrate_habit():
    """Tạo hoặc cập nhật Hydrate Habit"""
    user_id = get_jwt_identity()
    data = request.get_json()

    try:
        hydrate_habit = hydrate_service.set_hydrate_habit(user_id, data)
        return jsonify(hydrate_habit), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except ValidationError:
        return jsonify({"error": "Invalid input data"}), 400
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500

@hydrate_bp.route("/habit", methods=["GET"])
@jwt_required()
def get_hydrate_habit():
    """Lấy thông tin Hydrate Habit của người dùng"""
    user_id = get_jwt_identity()
    
    try:
        hydrate_habit = hydrate_service.get_hydrate_habit(user_id)
        return jsonify(hydrate_habit), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500

@hydrate_bp.route("/logs/today", methods=["GET"])
@jwt_required()
def get_today_hydrate_logs():
    """Lấy Hydrate Logs hôm nay"""
    user_id = get_jwt_identity()
    try:
        logs = hydrate_service.get_hydrate_logs_today(user_id)
        return jsonify(logs), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500

@hydrate_bp.route("/logs/week", methods=["GET"])
@jwt_required()
def get_week_hydrate_logs():
    """Lấy Hydrate Logs từ thứ 2 đến hôm nay"""
    user_id = get_jwt_identity()
    try:
        logs = hydrate_service.get_hydrate_logs_week(user_id)
        return jsonify(logs), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500

@hydrate_bp.route("/logs/<log_id>/update", methods=["PUT"])
@jwt_required()
def update_hydrate_log(log_id):
    """Cập nhật lượng nước đã uống bằng cách tăng thêm cup_size"""
    user_id = get_jwt_identity()

    try:
        updated_log = hydrate_service.update_hydrate_log(user_id, log_id)
        return jsonify(updated_log), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500
