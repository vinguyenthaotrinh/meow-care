from flask import Blueprint, request, jsonify
from services import auth_service
from models.user_models import UserCreate

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    try:
        user_data = UserCreate(**data)
        user, error = auth_service.register_user(user_data)
        if error:
            return jsonify({"error": error}), 400
        return jsonify(user.model_dump()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    token, error = auth_service.login_user(email, password)
    if error:
        return jsonify({"error": error}), 401

    return jsonify({"token": token}), 200
