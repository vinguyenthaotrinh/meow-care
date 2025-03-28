from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services import diet_service
from ..utils import ServiceError, DEBUG
from pydantic import ValidationError

diet_bp = Blueprint("diet", __name__)

@diet_bp.route("/habit", methods=["POST", "PUT"])
@jwt_required()
def set_diet_habit():
    """Tạo hoặc cập nhật Diet Habit"""
    user_id = get_jwt_identity()
    data = request.get_json()

    try:
        diet_habit = diet_service.set_diet_habit(user_id, data)
        return jsonify(diet_habit), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except ValidationError:
        return jsonify({"error": "Invalid input data"}), 400
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500

@diet_bp.route("/habit", methods=["GET"])
@jwt_required()
def get_diet_habit():
    """Lấy thông tin Diet Habit của người dùng"""
    user_id = get_jwt_identity()

    try:
        diet_habit = diet_service.get_diet_habit(user_id)
        return jsonify(diet_habit), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500

@diet_bp.route("/logs/today", methods=["GET"])
@jwt_required()
def get_today_diet_logs():
    """Lấy Diet Logs hôm nay"""
    user_id = get_jwt_identity()
    try:
        logs = diet_service.get_diet_logs_today(user_id)
        return jsonify(logs), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500

@diet_bp.route("/logs/week", methods=["GET"])
@jwt_required()
def get_week_diet_logs():
    """Lấy Diet Logs từ thứ 2 đến hôm nay"""
    user_id = get_jwt_identity()
    try:
        logs = diet_service.get_diet_logs_week(user_id)
        return jsonify(logs), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500

@diet_bp.route("/logs/<log_id>/update", methods=["PUT"])
@jwt_required()
def update_diet_log(log_id):
    """Cập nhật nhật ký ăn uống bằng cách thêm món ăn"""
    user_id = get_jwt_identity()
    data = request.get_json()

    try:
        updated_log = diet_service.update_diet_log(user_id, log_id, data)
        return jsonify(updated_log), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e) if DEBUG else "Internal server error"}), 500
