CREATE TABLE IF NOT EXISTS public.cleanup(
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL CHECK(type = ANY (ARRAY['delete_s3_object', 'delete_asset'])),
    data JSONB NOT NULL,
    attempt INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);