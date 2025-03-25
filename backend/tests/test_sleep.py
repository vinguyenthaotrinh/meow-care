import pytest

# Dữ liệu test
VALID_USER = {"email": "test@example.com", "password": "password123"}
VALID_SLEEP_HABIT = {"sleep_time": "23:00:00", "wakeup_time": "06:30:00"}
INVALID_SLEEP_HABIT = {"sleep_time": "07:00:00"}  

@pytest.mark.sleep
@pytest.mark.order(20)
def test_set_sleep_habit_success(client, auth_token):
    """Cập nhật Sleep Habit hợp lệ"""
    response = client.put("/sleep/habit", json=VALID_SLEEP_HABIT, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert "sleep_time" in response.json

@pytest.mark.sleep
@pytest.mark.order(21)
def test_set_sleep_habit_invalid_data(client, auth_token):
    """Cập nhật Sleep Habit với dữ liệu không hợp lệ"""
    response = client.put("/sleep/habit", json=INVALID_SLEEP_HABIT, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 400  # Bad Request
    assert "error" in response.json

@pytest.mark.sleep
@pytest.mark.order(22)
def test_get_sleep_habit_success(client, auth_token):
    """Lấy thông tin Sleep Habit thành công"""
    response = client.get("/sleep/habit", headers={"Authorization": f"Bearer {auth_token}"})
    
    assert response.status_code == 200
    assert "user_id" in response.json
    assert "sleep_time" in response.json  # Kiểm tra key tồn tại

@pytest.mark.sleep
@pytest.mark.order(23)
def test_get_today_sleep_logs_success(client, auth_token):
    """Lấy Sleep Logs hôm nay"""
    response = client.get("/sleep/logs/today", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert isinstance(response.json, list)

@pytest.mark.sleep
@pytest.mark.order(24)
def test_get_today_sleep_logs_unauthorized(client):
    """Lấy Sleep Logs hôm nay khi chưa đăng nhập"""
    response = client.get("/sleep/logs/today")
    assert response.status_code == 401  # Unauthorized
    assert "Missing Authorization Header" in response.json["msg"]

@pytest.mark.sleep
@pytest.mark.order(25)
def test_get_week_sleep_logs_success(client, auth_token):
    """Lấy Sleep Logs từ thứ 2 đến hôm nay"""
    response = client.get("/sleep/logs/week", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert isinstance(response.json, list)

@pytest.mark.sleep
@pytest.mark.order(26)
def test_get_week_sleep_logs_unauthorized(client):
    """Lấy Sleep Logs tuần này khi chưa đăng nhập"""
    response = client.get("/sleep/logs/week")
    assert response.status_code == 401
    assert "Missing Authorization Header" in response.json["msg"]
    
@pytest.mark.sleep
@pytest.mark.order(27)
def test_update_sleep_log_completion_success(client, auth_token):
    """Cập nhật trạng thái hoàn thành của một Sleep hoặc Wakeup log thành công"""
    # Lấy danh sách sleep logs hôm nay
    response = client.get("/sleep/logs/today", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    logs = response.json
    assert isinstance(logs, list) and len(logs) > 0  # Phải có ít nhất 1 log

    # Chọn 1 log_id hợp lệ
    log_id = logs[0]["id"]

    # Cập nhật trạng thái completed của log đã chọn
    update_response = client.put(f"/sleep/logs/{log_id}/complete", headers={"Authorization": f"Bearer {auth_token}"})
    assert update_response.status_code == 200
    assert update_response.json["completed"] is True

@pytest.mark.sleep
@pytest.mark.order(28)
def test_update_sleep_log_not_found(client, auth_token):
    """Cập nhật trạng thái của log không tồn tại"""
    # UUID không tồn tại
    log_id = "00000000-0000-0000-0000-000000000000"
    
    response = client.put(f"/sleep/logs/{log_id}/complete", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 404
    assert "error" in response.json

@pytest.mark.sleep
@pytest.mark.order(29)
def test_update_sleep_log_completion_unauthorized(client, auth_token):
    """Cập nhật trạng thái khi chưa đăng nhập"""
    response = client.get("/sleep/logs/today", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    logs = response.json
    assert isinstance(logs, list) and len(logs) > 0

    log_id = logs[0]["id"]

    # Cập nhật mà không có token
    unauthorized_response = client.put(f"/sleep/logs/{log_id}/complete")
    assert unauthorized_response.status_code == 401
    assert "Missing Authorization Header" in unauthorized_response.json["msg"]

@pytest.mark.sleep
@pytest.mark.order(30)
def test_get_sleep_habit_not_found(client, nohabit_token):
    """Lấy thông tin Sleep Habit của người dùng không có thói quen"""
    response = client.get("/sleep/habit", headers={"Authorization": f"Bearer {nohabit_token}"})
    
    assert response.status_code == 404
    assert response.json["error"] == "Sleep habit not found"