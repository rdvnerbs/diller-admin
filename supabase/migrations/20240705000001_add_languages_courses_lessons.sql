-- Add languages table
CREATE TABLE IF NOT EXISTS languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  flag_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  language_id UUID REFERENCES languages(id) ON DELETE CASCADE,
  level TEXT NOT NULL,
  image_url TEXT,
  duration_weeks INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL,
  content JSONB,
  duration_minutes INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add realtime publication for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE languages;
ALTER PUBLICATION supabase_realtime ADD TABLE courses;
ALTER PUBLICATION supabase_realtime ADD TABLE lessons;

-- Insert some initial languages
INSERT INTO languages (name, code, flag_url) VALUES
('English', 'en', 'https://flagcdn.com/w80/gb.png'),
('Spanish', 'es', 'https://flagcdn.com/w80/es.png'),
('French', 'fr', 'https://flagcdn.com/w80/fr.png'),
('German', 'de', 'https://flagcdn.com/w80/de.png'),
('Italian', 'it', 'https://flagcdn.com/w80/it.png'),
('Japanese', 'ja', 'https://flagcdn.com/w80/jp.png'),
('Chinese', 'zh', 'https://flagcdn.com/w80/cn.png'),
('Russian', 'ru', 'https://flagcdn.com/w80/ru.png'),
('Arabic', 'ar', 'https://flagcdn.com/w80/sa.png'),
('Portuguese', 'pt', 'https://flagcdn.com/w80/pt.png')
ON CONFLICT DO NOTHING;