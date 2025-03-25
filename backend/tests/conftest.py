import pytest
from app import app
from src.utils import supabase  # Import Supabase để xóa dữ liệu test

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

@pytest.fixture(scope="session", autouse=True)
def cleanup():
    yield
    supabase.table("users").delete().eq("email", "test@example.com").execute()
    
VALID_PERMANENT_USER = {"email": "test_permanent@example.com", "password": "password123"}
NO_HABIT_USER = {"email": "test_no_habit@example.com", "password": "password123"}

@pytest.fixture
def auth_token(client):
    """Đăng nhập và lấy token"""
    response = client.post("/auth/login", json=VALID_PERMANENT_USER)
    assert response.status_code == 200
    return response.json["token"]

@pytest.fixture
def nohabit_token(client):
    """Đăng nhập và lấy token"""
    response = client.post("/auth/login", json=NO_HABIT_USER)
    assert response.status_code == 200
    return response.json["token"]
