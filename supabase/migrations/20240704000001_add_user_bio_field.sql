-- Add bio field to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Enable realtime for users table if not already enabled
DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'users'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE users;
    END IF;
END
$$;