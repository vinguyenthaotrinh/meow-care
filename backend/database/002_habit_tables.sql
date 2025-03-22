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

CREATE TABLE water_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cup_size FLOAT NOT NULL,
    reminder_time TIME[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE water_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    habit_id UUID REFERENCES water_habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    consumed_cups INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE diet_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reminder_time TIME[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE diet_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    habit_id UUID REFERENCES diet_habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    consumed_calories FLOAT NOT NULL,
    completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE focus_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE focus_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    habit_id UUID REFERENCES focus_habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    focus_duration INT NOT NULL, -- in minutes
    completed BOOLEAN DEFAULT FALSE
);
