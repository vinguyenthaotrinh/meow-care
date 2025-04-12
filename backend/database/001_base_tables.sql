CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(10) CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    reset_token TEXT,
    reset_token_expiration TIMESTAMP
);

CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL DEFAULT 'Human',
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')) DEFAULT 'female',
    weight FLOAT CHECK (weight > 0) DEFAULT 50,
    height FLOAT CHECK (height > 0) DEFAULT 160,
    age INT CHECK (age BETWEEN 1 AND 100) DEFAULT 20,
    daily_calories FLOAT GENERATED ALWAYS AS (
        CASE
            WHEN gender = 'male' THEN 88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age)
            WHEN gender = 'female' THEN 447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age)
            ELSE NULL
        END
    ) STORED,
    daily_water FLOAT GENERATED ALWAYS AS (weight * 0.033) STORED,
);

CREATE TABLE xp_rewards (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    coins INT DEFAULT 0,
    diamonds INT DEFAULT 0,
    streak INT DEFAULT 0,
    daily_checkin INT DEFAULT 0,
    last_checkin_date DATE DEFAULT DATE '2000-01-01',
    last_streak_date DATE DEFAULT DATE '2000-01-01'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
