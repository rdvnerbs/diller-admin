-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'matching', 'word_image', 'audio_word', 'audio_multiple_choice', 'fill_in_blank_text', 'fill_in_blank_choice', 'dictation', 'translation', 'word_completion', 'sentence_completion')),
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  points INTEGER NOT NULL DEFAULT 10,
  content JSONB NOT NULL,
  language_id UUID REFERENCES languages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  time_limit INTEGER, -- in minutes, NULL means no time limit
  passing_score INTEGER NOT NULL DEFAULT 70, -- percentage
  is_published BOOLEAN DEFAULT FALSE,
  language_id UUID REFERENCES languages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create exam_questions junction table
CREATE TABLE IF NOT EXISTS exam_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_id, question_id)
);

-- Create exam_results table
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL, -- percentage
  time_taken INTEGER, -- in seconds
  answers JSONB, -- store user answers
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_id, user_id, completed_at)
);

-- Create comments table for lessons
CREATE TABLE IF NOT EXISTS lesson_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES lesson_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Add realtime publication for the new tables
ALTER PUBLICATION supabase_realtime ADD TABLE questions;
ALTER PUBLICATION supabase_realtime ADD TABLE exams;
ALTER PUBLICATION supabase_realtime ADD TABLE exam_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE exam_results;
ALTER PUBLICATION supabase_realtime ADD TABLE lesson_comments;

-- Disable RLS for the new tables
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_comments DISABLE ROW LEVEL SECURITY;

-- Create policies for questions table
DROP POLICY IF EXISTS "Public questions access" ON questions;
CREATE POLICY "Public questions access"
  ON questions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Auth users can insert questions" ON questions;
CREATE POLICY "Auth users can insert questions"
  ON questions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Auth users can update their questions" ON questions;
CREATE POLICY "Auth users can update their questions"
  ON questions FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Auth users can delete their questions" ON questions;
CREATE POLICY "Auth users can delete their questions"
  ON questions FOR DELETE
  USING (true);

-- Create policies for exams table
DROP POLICY IF EXISTS "Public exams access" ON exams;
CREATE POLICY "Public exams access"
  ON exams FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Auth users can insert exams" ON exams;
CREATE POLICY "Auth users can insert exams"
  ON exams FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Auth users can update their exams" ON exams;
CREATE POLICY "Auth users can update their exams"
  ON exams FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Auth users can delete their exams" ON exams;
CREATE POLICY "Auth users can delete their exams"
  ON exams FOR DELETE
  USING (true);

-- Create policies for lesson_comments table
DROP POLICY IF EXISTS "Public lesson_comments access" ON lesson_comments;
CREATE POLICY "Public lesson_comments access"
  ON lesson_comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Auth users can insert lesson_comments" ON lesson_comments;
CREATE POLICY "Auth users can insert lesson_comments"
  ON lesson_comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Auth users can update their lesson_comments" ON lesson_comments;
CREATE POLICY "Auth users can update their lesson_comments"
  ON lesson_comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Auth users can delete their lesson_comments" ON lesson_comments;
CREATE POLICY "Auth users can delete their lesson_comments"
  ON lesson_comments FOR DELETE
  USING (auth.uid() = user_id);
