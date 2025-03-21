import pytest

# Dữ liệu test
VALID_USER = {"email": "test@example.com", "password": "password123"}
INVALID_USER = {"email": "invalid", "password": "password123"}

@pytest.mark.auth
@pytest.mark.order(1)
def test_register_success(client): 
    response = client.post("/auth/register", json=VALID_USER)
    assert response.status_code == 201
    assert response.json["message"] == "User created successfully"

@pytest.mark.auth
@pytest.mark.order(2)
def test_register_already_exist(client): 
    response = client.post("/auth/register", json=VALID_USER)
    assert response.status_code == 409
    assert response.json["error"] == "Email or username already registered"

@pytest.mark.auth
@pytest.mark.order(3)
def test_register_invalid_data(client):
    response = client.post("/auth/register", json=INVALID_USER)
    assert response.status_code == 400
    assert response.json["error"] == "Invalid input data"

@pytest.mark.auth
@pytest.mark.order(4)
def test_login_success(client):
    response = client.post("/auth/login", json=VALID_USER)
    assert response.status_code == 200
    assert "token" in response.json
    
@pytest.mark.auth
@pytest.mark.order(5)
def test_login_missing_data(client):
    response = client.post("/auth/login", json={"email": "test@example.com"})
    assert response.status_code == 400
    assert response.json["error"] == "Email and password are required"

@pytest.mark.auth
@pytest.mark.order(6)
def test_login_wrong_password(client):
    response = client.post("/auth/login", json={"email": "test@example.com", "username": "test", "password": "wrongpassword"})
    assert response.status_code == 401
    assert response.json["error"] == "Invalid email or password"

@pytest.mark.auth
@pytest.mark.order(7)
def test_login_nonexistent_user(client):
    response = client.post("/auth/login", json={"email": "notexist@example.com", "username": "nonexist_user", "password": "password123"})
    assert response.status_code == 401
    assert response.json["error"] == "Invalid email or password"
