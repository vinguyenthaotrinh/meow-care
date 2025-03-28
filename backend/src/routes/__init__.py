from .health_routes import health_bp
from .auth_routes import auth_bp
from .profile_routes import profile_bp
from .sleep_routes import sleep_bp
from .hydrate_routes import hydrate_bp
from .diet_routes import diet_bp

__all__ = ["health_bp", "auth_bp", "profile_bp", "sleep_bp", "hydrate_bp", "diet_bp"]