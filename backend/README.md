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
