-- Create words table
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kelime_en VARCHAR NOT NULL,
  kelime_tr VARCHAR NOT NULL,
  kelime_en_aciklama TEXT,
  kelime_tr_aciklama TEXT,
  resim_url VARCHAR,
  ses_url VARCHAR,
  seviye VARCHAR CHECK (seviye IN ('beginner', 'intermediate', 'advanced', 'expert')),
  kelime_turu VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sentences table
CREATE TABLE IF NOT EXISTS sentences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cumle_en VARCHAR NOT NULL,
  cumle_tr VARCHAR NOT NULL,
  cumle_zaman VARCHAR,
  gramer_konusu VARCHAR,
  cumle_ogeleri JSONB,
  resim_url VARCHAR,
  ses_url VARCHAR,
  seviye VARCHAR CHECK (seviye IN ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentences ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public words access" ON words;
CREATE POLICY "Public words access"
  ON words FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin words access" ON words;
CREATE POLICY "Admin words access"
  ON words FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE subscription = 'admin'));

DROP POLICY IF EXISTS "Public sentences access" ON sentences;
CREATE POLICY "Public sentences access"
  ON sentences FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin sentences access" ON sentences;
CREATE POLICY "Admin sentences access"
  ON sentences FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE subscription = 'admin'));

-- Add to realtime publication
alter publication supabase_realtime add table words;
alter publication supabase_realtime add table sentences;
