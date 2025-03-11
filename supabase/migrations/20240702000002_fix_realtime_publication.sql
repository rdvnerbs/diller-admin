-- Check if the table is already in the publication before adding it
DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'learning_categories'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE learning_categories;
    END IF;
END
$$;