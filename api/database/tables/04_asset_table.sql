CREATE TABLE IF NOT EXISTS public.assets(
    id SERIAL PRIMARY KEY,
    owner_id INT NOT NULL,
    owner_type VARCHAR(10) NOT NULL CHECK(owner_type = ANY (ARRAY['user', 'post'])),
    type TEXT NOT NULL CHECK(type = ANY(ARRAY['profile_picture', 'post_attachment'])),
    filename TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.assets ADD CONSTRAINT unique_owner_filename UNIQUE(owner_type, owner_id, filename);