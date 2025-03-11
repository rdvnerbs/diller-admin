-- Add new junction tables for lessons to words and sentences relationships

-- Create lesson_words junction table
CREATE TABLE IF NOT EXISTS lesson_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lesson_id, word_id)
);

-- Create lesson_sentences junction table
CREATE TABLE IF NOT EXISTS lesson_sentences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  sentence_id UUID NOT NULL REFERENCES sentences(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lesson_id, sentence_id)
);

-- Add realtime publication for the new tables
ALTER PUBLICATION supabase_realtime ADD TABLE lesson_words;
ALTER PUBLICATION supabase_realtime ADD TABLE lesson_sentences;

-- Disable RLS for the new tables
ALTER TABLE lesson_words DISABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_sentences DISABLE ROW LEVEL SECURITY;

-- Create policies for lesson_words table
DROP POLICY IF EXISTS "Public lesson_words access" ON lesson_words;
CREATE POLICY "Public lesson_words access"
  ON lesson_words FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Auth users can insert lesson_words" ON lesson_words;
CREATE POLICY "Auth users can insert lesson_words"
  ON lesson_words FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Auth users can update their lesson_words" ON lesson_words;
CREATE POLICY "Auth users can update their lesson_words"
  ON lesson_words FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Auth users can delete their lesson_words" ON lesson_words;
CREATE POLICY "Auth users can delete their lesson_words"
  ON lesson_words FOR DELETE
  USING (true);

-- Create policies for lesson_sentences table
DROP POLICY IF EXISTS "Public lesson_sentences access" ON lesson_sentences;
CREATE POLICY "Public lesson_sentences access"
  ON lesson_sentences FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Auth users can insert lesson_sentences" ON lesson_sentences;
CREATE POLICY "Auth users can insert lesson_sentences"
  ON lesson_sentences FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Auth users can update their lesson_sentences" ON lesson_sentences;
CREATE POLICY "Auth users can update their lesson_sentences"
  ON lesson_sentences FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Auth users can delete their lesson_sentences" ON lesson_sentences;
CREATE POLICY "Auth users can delete their lesson_sentences"
  ON lesson_sentences FOR DELETE
  USING (true);
