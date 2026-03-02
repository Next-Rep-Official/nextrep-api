CREATE TABLE IF NOT EXISTS public.likes(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id INT NOT NULL,
    target_type TEXT NOT NULL CHECK(target_type = ANY (ARRAY['post', 'reply'])),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_target') THEN
    ALTER TABLE public.likes ADD CONSTRAINT unique_user_target UNIQUE(user_id, target_id, target_type);
  END IF;
END $$;