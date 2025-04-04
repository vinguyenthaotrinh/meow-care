from flask import Flask
from src.routes import auth_bp, profile_bp, sleep_bp, hydrate_bp, health_bp, diet_bp
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app) # Enable CORS for all routes
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")
jwt = JWTManager(app)

app.register_blueprint(health_bp, url_prefix="/health")
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(profile_bp, url_prefix="/profile")
app.register_blueprint(sleep_bp, url_prefix="/sleep")
app.register_blueprint(hydrate_bp, url_prefix="/hydrate")
app.register_blueprint(diet_bp, url_prefix="/diet")

if __name__ == "__main__":
    app.run(debug=os.environ.get("DEBUG", False), host="0.0.0.0", port=os.environ.get("PORT", 5000))