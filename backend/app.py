from flask import Flask
from src.routes import auth_bp, profile_bp, sleep_bp, hydrate_bp
from flask_jwt_extended import JWTManager
import os

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")
jwt = JWTManager(app)

# Đăng ký routes từ folder routes/
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(profile_bp, url_prefix="/profile")
app.register_blueprint(sleep_bp, url_prefix="/sleep")
app.register_blueprint(hydrate_bp, url_prefix="/hydrate")

if __name__ == "__main__":
    app.run(debug=os.environ.get("DEBUG", False), host="0.0.0.0", port=os.environ.get("PORT", 5000))