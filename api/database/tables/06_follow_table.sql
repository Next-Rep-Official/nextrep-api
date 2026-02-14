CREATE TABLE IF NOT EXISTS public.follows(
    id SERIAL PRIMARY KEY,
    follower_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.follows ADD CONSTRAINT unique_follower_followed UNIQUE(follower_id, followed_id);