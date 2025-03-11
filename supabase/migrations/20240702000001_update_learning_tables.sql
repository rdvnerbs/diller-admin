-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure learning_categories has all required fields
ALTER TABLE learning_categories
ADD COLUMN IF NOT EXISTS color VARCHAR DEFAULT 'blue',
ADD COLUMN IF NOT EXISTS icon VARCHAR DEFAULT 'BookOpen',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create trigger for updated_at on learning_categories
DROP TRIGGER IF EXISTS update_learning_categories_updated_at ON learning_categories;
CREATE TRIGGER update_learning_categories_updated_at
BEFORE UPDATE ON learning_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for learning_categories
ALTER TABLE learning_categories ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read categories
DROP POLICY IF EXISTS "Anyone can read categories" ON learning_categories;
CREATE POLICY "Anyone can read categories"
ON learning_categories FOR SELECT
USING (true);

-- Only authenticated users can create/update/delete categories
DROP POLICY IF EXISTS "Authenticated users can create categories" ON learning_categories;
CREATE POLICY "Authenticated users can create categories"
ON learning_categories FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update categories" ON learning_categories;
CREATE POLICY "Authenticated users can update categories"
ON learning_categories FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete categories" ON learning_categories;
CREATE POLICY "Authenticated users can delete categories"
ON learning_categories FOR DELETE
TO authenticated
USING (true);

-- Realtime publication is handled in a separate migration file
