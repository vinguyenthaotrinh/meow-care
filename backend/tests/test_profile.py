import pytest

# Dữ liệu test
VALID_USER = {"email": "test@example.com", "password": "password123"}
NEW_PROFILE = {"username": "new username", "gender": "female", "weight": 60, "height": 170, "age": 25}
INVALID_PROFILE = {"weight": -5}  # Dữ liệu không hợp lệ
NEW_PASSWORD = {"old_password": "password123", "new_password": "newpass456"}
WRONG_OLD_PASSWORD = {"old_password": "wrongpassword", "new_password": "newpass456"}

@pytest.fixture
def auth_token(client):
    """Đăng nhập và lấy token"""
    response = client.post("/auth/login", json=VALID_USER)
    assert response.status_code == 200
    return response.json["token"]

@pytest.mark.profile
@pytest.mark.order(8)
def test_get_profile_success(client, auth_token):
    """Lấy thông tin profile khi đăng nhập"""
    response = client.get("/profile", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200, response.json
    assert "username" in response.json
    assert "daily_calories" in response.json

@pytest.mark.profile
@pytest.mark.order(9)
def test_get_profile_unauthorized(client):
    """Lấy profile khi chưa đăng nhập (thiếu token)"""
    response = client.get("/profile")
    assert response.status_code == 401  # Unauthorized
    assert "Missing Authorization Header" in response.json["msg"]

@pytest.mark.profile
@pytest.mark.order(10)
def test_update_profile_success(client, auth_token):
    """Cập nhật thông tin profile hợp lệ"""
    response = client.put("/profile", json=NEW_PROFILE, headers={"Authorization": f"Bearer {auth_token}"})
    # print(response.json)

    assert response.status_code == 200
    assert response.json["username"] == NEW_PROFILE["username"]
    assert response.json["weight"] == NEW_PROFILE["weight"]

@pytest.mark.profile
@pytest.mark.order(11)
def test_update_profile_invalid_data(client, auth_token):
    """Cập nhật profile với dữ liệu không hợp lệ"""
    response = client.put("/profile", json=INVALID_PROFILE, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 400  # Bad Request
    assert "error" in response.json

@pytest.mark.profile
@pytest.mark.order(12)
def test_change_password_wrong_old_password(client, auth_token):
    """Đổi mật khẩu thất bại do nhập sai mật khẩu cũ"""
    response = client.put("/profile/change-password", json=WRONG_OLD_PASSWORD, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 401
    assert response.json["error"] == "Incorrect old password"

@pytest.mark.profile
@pytest.mark.order(13)
def test_change_password_unauthorized(client):
    """Đổi mật khẩu khi chưa đăng nhập"""
    response = client.put("/profile/change-password", json=NEW_PASSWORD)
    assert response.status_code == 401  # Unauthorized
    assert "Missing Authorization Header" in response.json["msg"]
    

@pytest.mark.profile
@pytest.mark.order(14)
def test_change_password_success(client, auth_token):
    """Đổi mật khẩu thành công"""
    response = client.put("/profile/change-password", json=NEW_PASSWORD, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert response.json["message"] == "Password changed successfully"
