-- Add broad public read access to core tables
-- Run this in the Supabase SQL Editor

-- 1. Stations public read
CREATE POLICY "Public read active stations"
ON stations FOR SELECT
TO public
USING (true);

-- 2. Chargers public read
CREATE POLICY "Public read chargers"
ON chargers FOR SELECT
TO public
USING (true);

-- 3. Reviews public read
CREATE POLICY "Public read reviews"
ON reviews FOR SELECT
TO public
USING (true);

-- 4. Station Tags (Junction Table) public read
CREATE POLICY "Public read junction station_tags"
ON station_tags FOR SELECT
TO public
USING (true);

-- 5. Tags public read
CREATE POLICY "Public read tags master"
ON tags FOR SELECT
TO public
USING (true);
