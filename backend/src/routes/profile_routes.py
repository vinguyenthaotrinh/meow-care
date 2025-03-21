from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import ProfileBase
from ..services import profile_service
from ..utils import ServiceError, DEBUG
from pydantic import ValidationError

profile_bp = Blueprint("profile", __name__)

@profile_bp.route("", methods=["GET"])
@jwt_required()
def get_profile():
    """Lấy thông tin profile của user"""
    user_id = get_jwt_identity()  # Lấy user_id từ token

    try:
        profile = profile_service.get_user_profile(user_id)
        return jsonify(profile), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        error_message = str(e) if DEBUG else "Internal server error"
        return jsonify({"error": error_message}), 500

@profile_bp.route("", methods=["PUT"])
@jwt_required()
def update_profile():
    """Cập nhật thông tin profile"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        user_data = ProfileBase(**data)
        updated_profile = profile_service.update_user_profile(user_id, user_data)
        return jsonify(updated_profile), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except ValidationError as e:
        return jsonify({"error": "Invalid input data"}), 400
    except Exception as e:
        error_message = str(e) if DEBUG else "Internal server error"
        return jsonify({"error": error_message}), 500

@profile_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    """Đổi mật khẩu"""
    user_id = get_jwt_identity()
    data = request.get_json()
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not old_password or not new_password:
        return jsonify({"error": "Old and new password are required"}), 400

    try:
        profile_service.change_password(user_id, old_password, new_password)
        return jsonify({"message": "Password changed successfully"}), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        error_message = str(e) if DEBUG else "Internal server error"
        return jsonify({"error": error_message}), 500
