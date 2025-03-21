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
