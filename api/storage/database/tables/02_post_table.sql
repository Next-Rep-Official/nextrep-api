CREATE TABLE IF NOT EXISTS public.posts (
    id SERIAL PRIMARY KEY,
    author_id INT REFERENCES users(id) ON DELETE CASCADE, 
    title TEXT NOT NULL,
    body TEXT DEFAULT '',                 
    likes INT DEFAULT 0,
    replies_count INT DEFAULT 0,
    visibility VARCHAR(10) NOT NULL CHECK (visibility = ANY (ARRAY['private', 'public'])) DEFAULT 'private',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add tsvector column for full-text search
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS document tsvector;

-- Populate existing rows
UPDATE public.posts
SET document = to_tsvector('english', title || ' ' || body)
WHERE document IS NULL;

-- Create GIN index for fast searching
CREATE INDEX IF NOT EXISTS idx_posts_document
ON public.posts
USING GIN (document);

-- Create (or replace) the trigger function
CREATE OR REPLACE FUNCTION posts_tsvector_trigger() RETURNS trigger AS $$
BEGIN
  NEW.document := to_tsvector('english', NEW.title || ' ' || NEW.body);
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

