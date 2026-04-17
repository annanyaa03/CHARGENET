-- 1. Create chargers table
CREATE TABLE chargers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  type VARCHAR(50), -- CCS, CHAdeMO, Type2, AC
  power_kw INTEGER,  -- 7, 22, 50, 100, 150
  status VARCHAR(20) DEFAULT 'available', -- available, occupied, maintenance
  price_per_kwh DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policy for chargers
ALTER TABLE chargers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read chargers" ON chargers FOR SELECT TO public USING (true);

-- 2. Add facilities column to stations
ALTER TABLE stations ADD COLUMN IF NOT EXISTS facilities JSONB DEFAULT '["Parking", "WiFi", "Restroom"]';

-- Update all stations with initial facilities
UPDATE stations SET facilities = '["Parking", "WiFi", "Restroom", "CCTV", "Waiting Area"]';

-- 3. Create reviews table (if not exists, schema says it does but this ensures correct structure)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read reviews" ON reviews FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
