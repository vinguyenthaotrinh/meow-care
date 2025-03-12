CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(10) CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    reset_token TEXT,
    reset_token_expiration TIMESTAMP
);

CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    weight FLOAT CHECK (weight > 0),
    height FLOAT CHECK (height > 0),
    birth_year INT CHECK (birth_year BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE)),
    daily_calories FLOAT GENERATED ALWAYS AS (
        CASE
            WHEN gender = 'male' THEN 88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * (EXTRACT(YEAR FROM CURRENT_DATE) - birth_year))
            WHEN gender = 'female' THEN 447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * (EXTRACT(YEAR FROM CURRENT_DATE) - birth_year))
            ELSE NULL
        END
    ) STORED,
    daily_water FLOAT GENERATED ALWAYS AS (weight * 0.033) STORED,
    focus_goal INT DEFAULT 60, -- 60 min/day by default
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE xp_rewards (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    xp INT DEFAULT 0,
    level INT GENERATED ALWAYS AS (xp / 100) STORED,
    streak INT DEFAULT 0,
    last_streak_date DATE
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
