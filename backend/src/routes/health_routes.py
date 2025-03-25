from flask import Blueprint, jsonify
from ..utils import supabase

health_bp = Blueprint("health", __name__)

@health_bp.route("", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"}), 200

@health_bp.route("/supabase", methods=["GET"])
def health_supabase_check():
    try:
        response = supabase.table("users").select("*").limit(1).execute()
        return jsonify({"status": "ok", "db": "connected"}), 200
    except Exception as e:
        return jsonify({"status": "error", "db": "disconnected", "error": str(e)}), 500

