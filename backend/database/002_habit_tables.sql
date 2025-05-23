CREATE TABLE sleep_habits (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    sleep_time TIME NOT NULL,
    wakeup_time TIME NOT NULL
);

CREATE TABLE sleep_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    task_type TEXT CHECK (task_type IN ('sleep', 'wakeup')) NOT NULL, 
    scheduled_time TIMESTAMP NOT NULL,
    completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE hydrate_habits (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    water_goal FLOAT NOT NULL,
    cup_size FLOAT NOT NULL,
    reminder_time TIME[]
);

CREATE TABLE hydrate_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    water_goal FLOAT NOT NULL,
    cup_size FLOAT NOT NULL,
    consumed_water FLOAT NOT NULL,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE diet_habits (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    calories_goal FLOAT NOT NULL,
    reminder_time TIME[]
);

CREATE TABLE diet_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    calories_goal FLOAT NOT NULL,
    dishes JSONB NOT NULL,
    consumed_calories FLOAT NOT NULL,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE focus_habits (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    focus_goal INT NOT NULL
);

CREATE TABLE focus_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    focus_done INT NOT NULL, -- in minutes
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE
);
