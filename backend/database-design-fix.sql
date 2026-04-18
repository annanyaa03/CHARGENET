-- 1. TAGS TABLE (many-to-many)
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() 
    PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE 
    DEFAULT NOW()
);

-- 2. STATION TAGS (junction table)
CREATE TABLE IF NOT EXISTS station_tags (
  station_id UUID REFERENCES stations(id) 
    ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) 
    ON DELETE CASCADE,
  PRIMARY KEY (station_id, tag_id)
);

-- 3. Fix stations table types
ALTER TABLE stations
  ALTER COLUMN lat TYPE DECIMAL(10,8),
  ALTER COLUMN lng TYPE DECIMAL(11,8),
  ALTER COLUMN total_slots TYPE INTEGER;

ALTER TABLE stations
  ADD COLUMN IF NOT EXISTS available_slots INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS is_public 
    BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS open_hours 
    TEXT DEFAULT '24/7',
  ADD COLUMN IF NOT EXISTS facilities 
    JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS images 
    JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS rating 
    DECIMAL(3,2) DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS review_count 
    INTEGER DEFAULT 0;

-- 4. Fix chargers table
CREATE TABLE IF NOT EXISTS chargers (
  id UUID DEFAULT gen_random_uuid() 
    PRIMARY KEY,
  station_id UUID NOT NULL REFERENCES 
    stations(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL 
    CHECK (type IN (
      'CCS', 'CHAdeMO', 'Type2', 
      'AC', 'DC'
    )),
  power_kw INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'available'
    CHECK (status IN (
      'available', 'occupied', 
      'maintenance', 'inactive'
    )),
  price_per_kwh DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE 
    DEFAULT NOW()
);

-- 5. Fix bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() 
    PRIMARY KEY,
  station_id UUID NOT NULL REFERENCES 
    stations(id) ON DELETE CASCADE,
  charger_id UUID NOT NULL REFERENCES 
    chargers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES 
    auth.users(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL 
    DEFAULT 60 
    CHECK (duration_minutes > 0),
  status VARCHAR(20) DEFAULT 'confirmed'
    CHECK (status IN (
      'confirmed', 'cancelled', 
      'completed', 'no-show'
    )),
  estimated_cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE 
    DEFAULT NOW()
);

-- 6. Fix reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() 
    PRIMARY KEY,
  station_id UUID NOT NULL REFERENCES 
    stations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES 
    auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL 
    DEFAULT 'Anonymous',
  rating INTEGER NOT NULL 
    CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE 
    DEFAULT NOW()
);

-- 7. User profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES 
    auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  vehicle_type TEXT,
  vehicle_model TEXT,
  plan TEXT DEFAULT 'free'
    CHECK (plan IN (
      'free', 'pro', 'elite'
    )),
  created_at TIMESTAMP WITH TIME ZONE 
    DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE 
    DEFAULT NOW()
);

-- 8. Seed some tags
INSERT INTO tags (name) VALUES
  ('fast-charging'),
  ('highway'),
  ('mall'),
  ('24-hours'),
  ('covered-parking'),
  ('city-center'),
  ('airport'),
  ('residential'),
  ('commercial'),
  ('hotel')
ON CONFLICT (name) DO NOTHING;

-- 9. Generate slugs for stations
UPDATE stations 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        name, '[^a-zA-Z0-9\s]', '', 'g'
      ), '\s+', '-', 'g'
    ), '-+', '-', 'g'
  )
) || '-' || SUBSTRING(id::text FROM 1 FOR 8)
WHERE slug IS NULL;

-- 10. RLS Policies for all tables
ALTER TABLE tags 
  ENABLE ROW LEVEL SECURITY;
ALTER TABLE station_tags 
  ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles 
  ENABLE ROW LEVEL SECURITY;

-- Tags - public read
CREATE POLICY "Public read tags"
ON tags FOR SELECT TO public
USING (true);

-- Station tags - public read
CREATE POLICY "Public read station_tags"
ON station_tags FOR SELECT TO public
USING (true);

-- Profiles - users own data only
CREATE POLICY "Users read own profile"
ON profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users insert own profile"
ON profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- Bookings - users see own bookings
DROP POLICY IF EXISTS 
  "Users can view own bookings" ON bookings;

CREATE POLICY "Users view own bookings"
ON bookings FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Public insert bookings"
ON bookings FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "Users cancel own bookings"
ON bookings FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Reviews policies
DROP POLICY IF EXISTS 
  "Public can read reviews" ON reviews;
DROP POLICY IF EXISTS 
  "Public can insert reviews" ON reviews;

CREATE POLICY "Public read reviews"
ON reviews FOR SELECT TO public
USING (true);

CREATE POLICY "Authenticated insert reviews"
ON reviews FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 11. Auto-update review count trigger
CREATE OR REPLACE FUNCTION 
  update_station_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stations
  SET 
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM reviews
      WHERE station_id = NEW.station_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE station_id = NEW.station_id
    )
  WHERE id = NEW.station_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS 
  update_station_rating_trigger 
  ON reviews;

CREATE TRIGGER update_station_rating_trigger
AFTER INSERT OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_station_rating();

-- 12. Auto-create profile on signup
CREATE OR REPLACE FUNCTION 
  handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS 
  on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION 
  handle_new_user();

-- Verify everything
SELECT table_name 
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
