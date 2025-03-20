from flask import Blueprint, request, jsonify
from ..services import auth_service
from ..models import UserCreate
from ..utils import ServiceError, DEBUG
from pydantic import ValidationError

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() 
    
    try:
        user_data = UserCreate(**data)
        user = auth_service.register_user(user_data)
        return jsonify(user.model_dump()), 201
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except ValidationError as e:
        return jsonify({"error": "Invalid input data"}), 400
    except Exception as e:
        error_message = str(e) if DEBUG else "Internal server error"
        return jsonify({"error": error_message}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        token = auth_service.login_user(email, password)
        return jsonify({"token": token}), 200
    except ServiceError as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        error_message = str(e) if DEBUG else "Internal server error"
        return jsonify({"error": error_message}), 500