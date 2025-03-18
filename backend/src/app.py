from flask import Flask
from routes.auth_routes import auth_bp

app = Flask(__name__)

# Đăng ký routes từ folder routes/
app.register_blueprint(auth_bp, url_prefix="/auth")

if __name__ == "__main__":
    app.run(debug=True)