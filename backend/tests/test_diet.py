import pytest

# Dữ liệu test
VALID_DIET_HABIT = {"calories_goal": 2000, "reminder_time": ["08:00", "12:00", "18:00"]}
INVALID_DIET_HABIT = {"reminder_time": ["08:00", "12:00"]}  # Thiếu calories_goal

@pytest.mark.diet
@pytest.mark.order(50)
def test_set_diet_habit_success(client, auth_token):
    """Cập nhật Diet Habit hợp lệ"""
    response = client.put("/diet/habit", json=VALID_DIET_HABIT, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert "calories_goal" in response.json

@pytest.mark.diet
@pytest.mark.order(51)
def test_set_diet_habit_invalid_data(client, auth_token):
    """Cập nhật Diet Habit với dữ liệu không hợp lệ"""
    response = client.put("/diet/habit", json=INVALID_DIET_HABIT, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 400
    assert "error" in response.json

@pytest.mark.diet
@pytest.mark.order(52)
def test_get_diet_habit_success(client, auth_token):
    """Lấy thông tin Diet Habit thành công"""
    response = client.get("/diet/habit", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert "calories_goal" in response.json

@pytest.mark.diet
@pytest.mark.order(53)
def test_get_today_diet_logs_success(client, auth_token):
    """Lấy Diet Logs hôm nay"""
    response = client.get("/diet/logs/today", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert isinstance(response.json, list)

@pytest.mark.diet
@pytest.mark.order(54)
def test_get_today_diet_logs_unauthorized(client):
    """Lấy Diet Logs hôm nay khi chưa đăng nhập"""
    response = client.get("/diet/logs/today")
    assert response.status_code == 401
    assert "Missing Authorization Header" in response.json["msg"]

@pytest.mark.diet
@pytest.mark.order(55)
def test_get_week_diet_logs_success(client, auth_token):
    """Lấy Diet Logs từ thứ 2 đến hôm nay"""
    response = client.get("/diet/logs/week", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert isinstance(response.json, list)

@pytest.mark.diet
@pytest.mark.order(56)
def test_update_diet_log_success(client, auth_token):
    """Cập nhật Diet Log thành công"""
    # Lấy danh sách diet logs hôm nay
    response = client.get("/diet/logs/today", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    logs = response.json
    assert isinstance(logs, list) and len(logs) > 0  
    log_id = logs[0]["id"]

    # Cập nhật log với món ăn mới
    update_response = client.put(f"/diet/logs/{log_id}/update", json={"name": "Salad", "calories": 300}, headers={"Authorization": f"Bearer {auth_token}"})
    assert update_response.status_code == 200
    assert "consumed_calories" in update_response.json

@pytest.mark.diet
@pytest.mark.order(57)
def test_update_diet_log_not_found(client, auth_token):
    """Cập nhật Diet Log không tồn tại"""
    log_id = "00000000-0000-0000-0000-000000000000"
    response = client.put(f"/diet/logs/{log_id}/update", json={"name": "Pizza", "calories": 500}, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 404
    assert "error" in response.json
