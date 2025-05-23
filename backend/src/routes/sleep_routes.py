from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services import sleep_service
from ..utils import ServiceError, DEBUG
from pydantic import ValidationError
from ..services import xp_reward_service

sleep_bp = Blueprint("sleep", __name__)

@sleep_bp.route("/habit", methods=["POST", "PUT"])
@jwt_required()
def set_sleep_habit():
    """Tạo hoặc cập nhật Sleep Habit và Sleep Log hôm nay"""
    user_id = get_jwt_identity()
    data = request.get_json()

    try:
        sleep_habit = sleep_service.set_sleep_habit(user_id, data)
        return jsonify(sleep_habit), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except ValidationError:
        return jsonify({"error": "Invalid input data"}), 400
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500

@sleep_bp.route("/habit", methods=["GET"])
@jwt_required()
def get_sleep_habit():
    """Lấy thông tin Sleep Habit"""
    user_id = get_jwt_identity()
    
    try:
        sleep_habit = sleep_service.get_sleep_habit(user_id)
        return jsonify(sleep_habit), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500    

@sleep_bp.route("/logs/today", methods=["GET"])
@jwt_required()
def get_today_sleep_logs():
    """Lấy Sleep Logs hôm nay"""
    user_id = get_jwt_identity()
    try:
        logs = sleep_service.get_sleep_logs_today(user_id)
        return jsonify(logs), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500

@sleep_bp.route("/logs/week", methods=["GET"])
@jwt_required()
def get_week_sleep_logs():
    """Lấy Sleep Logs từ thứ 2 đến hôm nay"""
    user_id = get_jwt_identity()
    try:
        logs = sleep_service.get_sleep_logs_week(user_id)
        return jsonify(logs), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500

@sleep_bp.route("/logs/<log_id>/complete", methods=["PUT"])
@jwt_required()
def update_sleep_log_completion(log_id):
    """Cập nhật trạng thái hoàn thành của một Sleep hoặc Wakeup log"""
    user_id = get_jwt_identity()

    try:
        updated_log = sleep_service.update_sleep_log_completion(user_id, log_id)
        return jsonify(updated_log), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500

