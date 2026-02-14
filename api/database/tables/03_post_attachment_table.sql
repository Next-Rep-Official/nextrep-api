CREATE TABLE IF NOT EXISTS public.post_attachments(
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    asset_id INT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.post_attachments ADD CONSTRAINT unique_post_attachment UNIQUE(post_id, asset_id);

CREATE OR REPLACE FUNCTION check_post_attachment_limit()
RETURNS TRIGGER AS $$
DECLARE
  attachment_count INT;
BEGIN
  SELECT COUNT(*) INTO attachment_count
  FROM public.post_attachments
  WHERE post_id = NEW.post_id;

  IF attachment_count >= 3 THEN
    RAISE EXCEPTION 'Post cannot have more than 3 attachments (current: %)', attachment_count
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_post_attachment_limit
BEFORE INSERT ON public.post_attachments
FOR EACH ROW EXECUTE FUNCTION check_post_attachment_limit();

CREATE OR REPLACE FUNCTION notify_on_post_attachment_removed()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'post_attachment_removed',
    row_to_json(OLD)::text
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_post_attachment_removed
AFTER DELETE ON public.post_attachments
FOR EACH ROW EXECUTE FUNCTION notify_on_post_attachment_removed();