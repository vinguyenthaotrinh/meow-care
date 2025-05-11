# Meow Care API Documentation

## Authentication API

### Register User

Creates a new user account.

- **Endpoint**: `/auth/register`
- **Method**: `POST`
- **Request Body**:

  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **Responses**:
  - `201`: User created successfully
  - `400`: Invalid input data
  - `409`: Email already in use
  - `500`: Internal server error

### Login User

Authenticates a user and returns a token.

- **Endpoint**: `/auth/login`
- **Method**: `POST`
- **Request Body**:

  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **Responses**:
  - `200`: Returns authentication token
  - `400`: Email and password are required
  - `401`: Invalid credentials
  - `500`: Internal server error

### Authentication

For protected routes, include the token in requests:

```json
Authorization: Bearer <token>
```

## Diet API

### Set or Update Diet Habit

Creates or updates a user's diet habit settings and creates a new diet log for today.

- **Endpoint**: `/diet/habit`
- **Method**: `POST`, `PUT`
- **Authentication**: Required (JWT Token)
- **Request Body**:

  ```json
  {
    "calories_goal": 2000,
    "reminder_time": ["08:00", "12:00", "18:00"]
  }
  ```

- **Responses**:
  - `200`: Diet habit updated successfully
  - `400`: Missing required fields
  - `401`: Unauthorized (invalid or missing token)
  - `500`: Database server error or internal server error

### Get Diet Habit

Retrieves the user's diet habit settings.

- **Endpoint**: `/diet/habit`
- **Method**: `GET`
- **Authentication**: Required (JWT Token)
- **Responses**:
  - `200`: Returns the diet habit details
  - `401`: Unauthorized (invalid or missing token)
  - `404`: Diet habit not found
  - `500`: Database server error or internal server error

### Get Today's Diet Logs

Retrieves the user's diet logs for the current day.

- **Endpoint**: `/diet/logs/today`
- **Method**: `GET`
- **Authentication**: Required (JWT Token)
- **Responses**:
  - `200`: Returns today's diet logs
  - `401`: Unauthorized (invalid or missing token)
  - `404`: No diet logs found for today
  - `500`: Database server error or internal server error

### Get Weekly Diet Logs

Retrieves the user's diet logs from Monday to the current day.

- **Endpoint**: `/diet/logs/week`
- **Method**: `GET`
- **Authentication**: Required (JWT Token)
- **Responses**:
  - `200`: Returns the weekly diet logs
  - `401`: Unauthorized (invalid or missing token)
  - `404`: No diet logs found for this week
  - `500`: Database server error or internal server error

### Update Diet Log

Updates a specific diet log entry by adding food items and calculating total calories consumed.

- **Endpoint**: `/diet/logs/<log_id>/update`
- **Method**: `PUT`
- **Authentication**: Required (JWT Token)
- **Request Body**:

  ```json
  {
    "dishes": [
      {
        "name": "Apple",
        "calories": 95
      },
      {
        "name": "Chicken Salad",
        "calories": 350
      }
    ]
  }
  ```

- **Responses**:
  - `200`: Returns the updated diet log
  - `401`: Unauthorized (invalid or missing token)
  - `404`: Diet log not found
  - `500`: Database server error or internal server error
