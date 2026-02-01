CREATE TABLE IF NOT EXISTS public.profiles(
    id SERIAL PRIMARY KEY,
    user_id REFERENCES users(id) UNIQUE NOT NULL,
    profile_picture REFERENCES assets(id) DEFAULT NULL,
    pronouns NOT NULL CHECK(pronouns = ANY (ARRAY['h', 's', 'o', 'n'])) DEFAULT 'n',
    bio TEXT DEFAULT NULL, 
    posts_created INT NOT NULL DEFAULT 0,
    total_likes INT NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION enforce_profile_picture_type()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.profile_picture IS NOT NULL THEN
        -- Check that the asset exists and is type 'profile_picture'
        PERFORM 1
        FROM assets
        WHERE id = NEW.profile_picture AND type = 'profile_picture';

        IF NOT FOUND THEN
            RAISE EXCEPTION 'profile_picture must reference an asset of type profile_picture';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to the profiles table
CREATE TRIGGER check_profile_picture_type
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION enforce_profile_picture_type();
