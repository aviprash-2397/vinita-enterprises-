-- Update 5: Areas Management & Salesman Locations RLS

-- 1. Create areas table
CREATE TABLE IF NOT EXISTS areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Allow public access to areas (since app uses anon key)
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read areas" ON areas FOR SELECT USING (true);
CREATE POLICY "Allow anon insert areas" ON areas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update areas" ON areas FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete areas" ON areas FOR DELETE USING (true);

-- 3. Fix Salesman Locations (Ensure table exists and is writable)
CREATE TABLE IF NOT EXISTS salesman_locations (
  salesman_id UUID PRIMARY KEY REFERENCES salesmen(id),
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  accuracy FLOAT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: In Supabase, if RLS is enabled, you MUST have a policy to insert.
-- We are explicitly allowing all operations so the app works seamlessly.
ALTER TABLE salesman_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read salesman_locations" ON salesman_locations FOR SELECT USING (true);
CREATE POLICY "Allow anon insert salesman_locations" ON salesman_locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update salesman_locations" ON salesman_locations FOR UPDATE USING (true);
