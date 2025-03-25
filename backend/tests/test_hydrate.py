import pytest

# Dữ liệu test
VALID_HYDRATE_HABIT = {"water_goal": 2000, "cup_size": 250, "reminder_time": ["08:00", "12:00", "18:00"]}
INVALID_HYDRATE_HABIT = {"water_goal": 2000}  # Thiếu cup_size

@pytest.mark.hydrate
@pytest.mark.order(40)
def test_set_hydrate_habit_success(client, auth_token):
    """Cập nhật Hydrate Habit hợp lệ"""
    response = client.put("/hydrate/habit", json=VALID_HYDRATE_HABIT, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert "water_goal" in response.json

@pytest.mark.hydrate
@pytest.mark.order(41)
def test_set_hydrate_habit_invalid_data(client, auth_token):
    """Cập nhật Hydrate Habit với dữ liệu không hợp lệ"""
    response = client.put("/hydrate/habit", json=INVALID_HYDRATE_HABIT, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 400
    assert "error" in response.json

@pytest.mark.hydrate
@pytest.mark.order(42)
def test_get_hydrate_habit_success(client, auth_token):
    """Lấy thông tin Hydrate Habit thành công"""
    response = client.get("/hydrate/habit", headers={"Authorization": f"Bearer {auth_token}"})
    
    assert response.status_code == 200
    assert "water_goal" in response.json

@pytest.mark.hydrate
@pytest.mark.order(43)
def test_get_today_hydrate_logs_success(client, auth_token):
    """Lấy Hydrate Logs hôm nay"""
    response = client.get("/hydrate/logs/today", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert isinstance(response.json, list)

@pytest.mark.hydrate
@pytest.mark.order(44)
def test_get_today_hydrate_logs_unauthorized(client):
    """Lấy Hydrate Logs hôm nay khi chưa đăng nhập"""
    response = client.get("/hydrate/logs/today")
    assert response.status_code == 401
    assert "Missing Authorization Header" in response.json["msg"]

@pytest.mark.hydrate
@pytest.mark.order(45)
def test_get_week_hydrate_logs_success(client, auth_token):
    """Lấy Hydrate Logs từ thứ 2 đến hôm nay"""
    response = client.get("/hydrate/logs/week", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert isinstance(response.json, list)

@pytest.mark.hydrate
@pytest.mark.order(46)
def test_update_hydrate_log_success(client, auth_token):
    """Cập nhật Hydrate Log thành công"""
    # Lấy danh sách hydrate logs hôm nay
    response = client.get("/hydrate/logs/today", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    logs = response.json
    assert isinstance(logs, list) and len(logs) > 0  
    log_id = logs[0]["id"]

    # Cập nhật log
    update_response = client.put(f"/hydrate/logs/{log_id}/update", headers={"Authorization": f"Bearer {auth_token}"})
    assert update_response.status_code == 200
    assert "consumed_water" in update_response.json

@pytest.mark.hydrate
@pytest.mark.order(47)
def test_update_hydrate_log_not_found(client, auth_token):
    """Cập nhật Hydrate Log không tồn tại"""
    log_id = "00000000-0000-0000-0000-000000000000"
    response = client.put(f"/hydrate/logs/{log_id}/update", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 404
    assert "error" in response.json
