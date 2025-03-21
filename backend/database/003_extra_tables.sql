CREATE TABLE friends (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'blocked')),
    PRIMARY KEY (user_id, friend_id)
);

CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    mood VARCHAR(50) CHECK (mood IN ('happy', 'neutral', 'sad')),
    weight FLOAT DEFAULT 1.0 CHECK (weight > 0),
    last_fed TIMESTAMP,
    last_played TIMESTAMP
);

CREATE TABLE store_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('decoration', 'pet', 'other')),
    price INT CHECK (price >= 0)
);

CREATE TABLE user_items (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES store_items(id) ON DELETE CASCADE,
    quantity INT CHECK (quantity >= 0),
    PRIMARY KEY (user_id, item_id)
);