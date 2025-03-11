-- Disable RLS for words and sentences tables
ALTER TABLE words DISABLE ROW LEVEL SECURITY;
ALTER TABLE sentences DISABLE ROW LEVEL SECURITY;

-- Create policies for words table
DROP POLICY IF EXISTS "Public words access" ON words;
CREATE POLICY "Public words access"
  ON words FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Auth users can insert words" ON words;
CREATE POLICY "Auth users can insert words"
  ON words FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Auth users can update their words" ON words;
CREATE POLICY "Auth users can update their words"
  ON words FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Auth users can delete their words" ON words;
CREATE POLICY "Auth users can delete their words"
  ON words FOR DELETE
  USING (true);

-- Create policies for sentences table
DROP POLICY IF EXISTS "Public sentences access" ON sentences;
CREATE POLICY "Public sentences access"
  ON sentences FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Auth users can insert sentences" ON sentences;
CREATE POLICY "Auth users can insert sentences"
  ON sentences FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Auth users can update their sentences" ON sentences;
CREATE POLICY "Auth users can update their sentences"
  ON sentences FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Auth users can delete their sentences" ON sentences;
CREATE POLICY "Auth users can delete their sentences"
  ON sentences FOR DELETE
  USING (true);
