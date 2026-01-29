CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE CHECK (username = LOWER(username)),
    display_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE CHECK (email = LOWER(email)),
    hashed_password TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type = ANY (ARRAY['user', 'admin'])) DEFAULT 'user',
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

