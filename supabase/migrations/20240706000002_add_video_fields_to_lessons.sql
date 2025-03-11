-- Add video_url and video_file_path columns to lessons table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'video_url') THEN
    ALTER TABLE lessons ADD COLUMN video_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'video_file_path') THEN
    ALTER TABLE lessons ADD COLUMN video_file_path TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'html_content') THEN
    ALTER TABLE lessons ADD COLUMN html_content TEXT;
  END IF;
END $$;
