-- ChargeNet Supabase SQL Schema
-- Paste this into the Supabase SQL Editor

-- 1. Create Enums


-- 2. Create Tables

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    phone TEXT,
    vehicle_type TEXT,
    vehicle_number TEXT,
    role user_role DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stations table
CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    total_slots INTEGER DEFAULT 0,
    price_per_kwh DECIMAL(10, 2) NOT NULL,
    connector_types TEXT[] NOT NULL, -- e.g., {'CCS2', 'Type2'}
    amenities TEXT[] DEFAULT '{}',
    status station_status DEFAULT 'active',
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Slots table
CREATE TABLE slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID REFERENCES stations(id) ON DELETE CASCADE NOT NULL,
    slot_number TEXT NOT NULL,
    connector_type TEXT NOT NULL,
    status slot_status DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    station_id UUID REFERENCES stations(id) ON DELETE CASCADE NOT NULL,
    slot_id UUID REFERENCES slots(id) ON DELETE CASCADE NOT NULL,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours DECIMAL(5, 2) NOT NULL,
    estimated_units DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status booking_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    status transaction_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    station_id UUID REFERENCES stations(id) NOT NULL,
    slot_id UUID REFERENCES slots(id) NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    energy_consumed_kwh DECIMAL(10, 2) DEFAULT 0.00,
    total_cost DECIMAL(10, 2) DEFAULT 0.00,
    status session_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID REFERENCES stations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Stations: Anyone can read active stations
CREATE POLICY "Anyone can view active stations" ON stations FOR SELECT USING (status = 'active');
CREATE POLICY "Owners can manage own stations" ON stations FOR ALL USING (auth.uid() = owner_id);

-- Slots: Anyone can view slots
CREATE POLICY "Anyone can view slots" ON slots FOR SELECT USING (true);
CREATE POLICY "Owners can manage slots" ON slots FOR ALL USING (
    EXISTS (SELECT 1 FROM stations WHERE stations.id = slots.station_id AND stations.owner_id = auth.uid())
);

-- Bookings: Users can see/manage their own bookings; Owners can see bookings for their stations
CREATE POLICY "Users can view/manage own bookings" ON bookings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Owners can view bookings for their stations" ON bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM stations WHERE stations.id = bookings.station_id AND stations.owner_id = auth.uid())
);

-- Transactions: Users can view own transactions
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);

-- Sessions: Users can view own sessions
CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);

-- Reviews: Anyone can view reviews; Users can manage their own reviews
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert/manage own reviews" ON reviews FOR ALL USING (auth.uid() = user_id);

-- Admin Policy (Example for all tables - needs careful handling)
-- You can add policies for an 'admin' role if checking profiles.role directly is efficient.

-- 4. Trigger for Profile Creation
-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
