-- ChargeNet Station Seeding Script
-- Instructions: 
-- 1. Replace 'YOUR_USER_ID_HERE' with your actual Supabase User ID (UUID).
-- 2. Paste this script into the Supabase SQL Editor and run it.

DO $$
DECLARE
    -- REPLACE THE UUID BELOW WITH YOUR USER ID from Supabase Auth
    v_owner_id UUID := 'YOUR_USER_ID_HERE'; 
BEGIN
    -- Check if the profile exists, if not, create a placeholder profile
    -- (Assumes the user exists in auth.users)
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_owner_id) THEN
        INSERT INTO profiles (id, full_name, role)
        VALUES (v_owner_id, 'Station Owner', 'station_owner');
    END IF;

    -- Clear existing stations for a fresh start (Optional)
    -- DELETE FROM stations WHERE owner_id = v_owner_id;

    -- Insert 35 Stations
    INSERT INTO stations (owner_id, name, description, address, city, state, lat, lng, total_slots, price_per_kwh, connector_types, amenities, status, rating, total_reviews)
    VALUES
    (v_owner_id, 'Pune Central Charging Hub', 'Main charging hub in Viman Nagar. Open 24/7.', 'Viman Nagar, Pune, Maharashtra 411014', 'Pune', 'Maharashtra', 21.1458, 79.0882, 3, 18.00, ARRAY['CCS2', 'Type 2', 'CHAdeMO'], ARRAY['Restrooms', 'Water', 'Covered Parking', 'CCTV'], 'active', 4.5, 38),
    (v_owner_id, 'Mumbai BKC EV Station', 'Premium high-speed charging in BKC complex.', 'Bandra Kurla Complex, Mumbai, Maharashtra 400051', 'Mumbai', 'Maharashtra', 19.0596, 72.8656, 3, 22.00, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Covered Parking', 'CCTV'], 'active', 4.2, 61),
    (v_owner_id, 'Pune Hinjewadi Tech Park Charger', 'Perfect for IT professionals. Safe and well-lit.', 'Hinjewadi Phase 1, Pune, Maharashtra 411057', 'Pune', 'Maharashtra', 18.5912, 73.7389, 3, 16.00, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Water', 'CCTV'], 'active', 4.7, 29),
    (v_owner_id, 'Delhi Connaught Place EV Point', 'Central Delhi location. Near Metro station.', 'Connaught Place, New Delhi 110001', 'Delhi', 'Delhi', 28.6315, 77.2167, 3, 20.00, ARRAY['CCS2', 'Type 2', 'CHAdeMO'], ARRAY['CCTV', 'Night Lighting'], 'inactive', 3.9, 45),
    (v_owner_id, 'Bengaluru Koramangala Charge Point', 'Located in the heart of Koramangala. Lots of cafes nearby.', '5th Block, Koramangala, Bengaluru 560095', 'Bengaluru', 'Karnataka', 12.9352, 77.6245, 3, 23.00, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Water', 'Covered Parking', 'CCTV'], 'active', 4.6, 72),
    (v_owner_id, 'Mumbai Andheri West EV Hub', 'Busy hub in Andheri West. Quick turnaround.', 'Andheri West, Mumbai, Maharashtra 400058', 'Mumbai', 'Maharashtra', 19.1364, 72.8296, 3, 18.00, ARRAY['Type 2', 'CCS2', 'CHAdeMO'], ARRAY['Restrooms', 'Water', 'Night Lighting'], 'active', 4.1, 33),
    (v_owner_id, 'Pune Kothrud Charging Station', 'Reliable charging in residential Kothrud.', 'Kothrud, Pune, Maharashtra 411038', 'Pune', 'Maharashtra', 18.5074, 73.8077, 3, 19.00, ARRAY['CCS2', 'Type 2'], ARRAY['Water', 'Covered Parking', 'CCTV'], 'active', 4.3, 18),
    (v_owner_id, 'Delhi Dwarka Sector 21 EV Point', 'Near Dwarka Sector 21. Currently under maintenance.', 'Sector 21, Dwarka, New Delhi 110077', 'Delhi', 'Delhi', 28.5562, 77.0595, 3, 17.00, ARRAY['CCS2', 'Type 2'], ARRAY['CCTV'], 'maintenance', 3.5, 12),
    (v_owner_id, 'Bengaluru Whitefield EV Station', 'Ideal for long-stay charging in Whitefield.', 'Whitefield Main Road, Bengaluru 560066', 'Bengaluru', 'Karnataka', 12.9698, 77.7499, 3, 24.00, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Water', 'Covered Parking', 'CCTV'], 'active', 4.4, 55),
    (v_owner_id, 'Indore Airport Road Charger', 'Conveniently located on the way to the airport.', 'Airport Road, Indore, Madhya Pradesh 452005', 'Indore', 'Madhya Pradesh', 22.7196, 75.8577, 3, 20.00, ARRAY['CCS2', 'Type 2', 'CHAdeMO'], ARRAY['Restrooms', 'Covered Parking', 'CCTV'], 'active', 4.0, 22),
    (v_owner_id, 'Chennai T Nagar EV Hub', 'Major hub in T Nagar shopping district.', 'T Nagar, Chennai, Tamil Nadu 600017', 'Chennai', 'Tamil Nadu', 13.0418, 80.2341, 4, 15.00, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Water', 'Covered Parking', 'CCTV'], 'active', 4.8, 89),
    (v_owner_id, 'Hyderabad HITEC City Charger', 'High-speed chargers for the tech corridor.', 'HITEC City, Hyderabad, Telangana 500081', 'Hyderabad', 'Telangana', 17.4435, 78.3772, 5, 18.00, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Water', 'Covered Parking', 'CCTV'], 'active', 4.6, 112),
    (v_owner_id, 'Ahmedabad SG Highway Station', 'Fast charging on the highway. Good highway amenities.', 'SG Highway, Ahmedabad, Gujarat 380015', 'Ahmedabad', 'Gujarat', 23.0300, 72.5150, 3, 16.00, ARRAY['CCS2', 'Type 2'], ARRAY['Water', 'CCTV', 'Night Lighting'], 'active', 4.1, 43),
    (v_owner_id, 'Kolkata Salt Lake Point', 'Quiet location in Salt Lake City.', 'Sector V, Salt Lake, Kolkata, West Bengal 700091', 'Kolkata', 'West Bengal', 22.5765, 88.4323, 2, 14.50, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Covered Parking', 'Night Lighting'], 'active', 3.8, 27),
    (v_owner_id, 'Jaipur Malviya Nagar EV Base', 'Central Malviya Nagar. Reliable 24/7 service.', 'Malviya Nagar, Jaipur, Rajasthan 302017', 'Jaipur', 'Rajasthan', 26.8521, 75.8048, 3, 15.50, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Water', 'Covered Parking', 'CCTV'], 'inactive', 4.3, 31),
    (v_owner_id, 'Surat Ring Road Charger', 'High traffic area. Frequent maintenance.', 'Ring Road, Surat, Gujarat 395002', 'Surat', 'Gujarat', 21.1702, 72.8311, 4, 17.00, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Water', 'Covered Parking', 'CCTV'], 'active', 4.5, 67),
    (v_owner_id, 'Lucknow Gomti Nagar EV', 'Well-maintained station in posh Gomti Nagar.', 'Gomti Nagar, Lucknow, UP 226010', 'Lucknow', 'Uttar Pradesh', 26.8467, 80.9462, 3, 16.50, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Covered Parking', 'CCTV', 'Night Lighting'], 'active', 4.2, 34),
    (v_owner_id, 'Kanpur Mall Road Station', 'Old city location. Busy during day hours.', 'Mall Road, Kanpur, UP 208001', 'Kanpur', 'Uttar Pradesh', 26.4499, 80.3319, 2, 14.00, ARRAY['CCS2', 'Type 2'], ARRAY['Water', 'CCTV'], 'active', 3.9, 21),
    (v_owner_id, 'Nagpur IT Park Charger', 'Modern hub for IT Park commute. Very reliable.', 'IT Park, Nagpur, Maharashtra 440022', 'Nagpur', 'Maharashtra', 21.1258, 79.0582, 5, 18.00, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Water', 'Covered Parking', 'CCTV'], 'active', 4.7, 45),
    (v_owner_id, 'Visakhapatnam Beach Road EV', 'Scenic location near Beach Road.', 'Beach Road, Visakhapatnam, AP 530003', 'Visakhapatnam', 'Andhra Pradesh', 17.6868, 83.2185, 3, 15.00, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Water', 'CCTV', 'Night Lighting'], 'active', 4.6, 88),
    (v_owner_id, 'Bhopal MP Nagar Point', 'Commercial hub location.', 'MP Nagar, Bhopal, MP 462011', 'Bhopal', 'Madhya Pradesh', 23.2399, 77.4326, 2, 14.00, ARRAY['CCS2', 'Type 2'], ARRAY['Covered Parking', 'Night Lighting'], 'inactive', 4.1, 29),
    (v_owner_id, 'Patna Frazer Road Charger', 'Strategic location in Patna city.', 'Frazer Road, Patna, Bihar 800001', 'Patna', 'Bihar', 25.6041, 85.1476, 3, 13.50, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Water', 'CCTV'], 'active', 3.8, 18),
    (v_owner_id, 'Vadodara Alkapuri Station', 'High-end locality. Premium chargers.', 'Alkapuri, Vadodara, Gujarat 390007', 'Vadodara', 'Gujarat', 22.3172, 73.1712, 4, 16.00, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Water', 'Covered Parking', 'CCTV'], 'active', 4.4, 52),
    (v_owner_id, 'Ghaziabad Indirapuram Hub', 'Large residential area station.', 'Indirapuram, Ghaziabad, UP 201014', 'Ghaziabad', 'Uttar Pradesh', 28.6492, 77.3638, 3, 17.50, ARRAY['CCS2', 'Type 2'], ARRAY['Water', 'Covered Parking', 'CCTV'], 'active', 4.0, 38),
    (v_owner_id, 'Ludhiana Ferozepur Road EV', 'Main highway entry point location.', 'Ferozepur Road, Ludhiana, Punjab 141001', 'Ludhiana', 'Punjab', 30.9010, 75.8573, 2, 15.00, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Water', 'Covered Parking', 'CCTV'], 'active', 4.3, 24),
    (v_owner_id, 'Agra Taj View EV Hub', 'Tourist friendly station near Taj Mahal.', 'Fatehabad Road, Agra, UP 282001', 'Agra', 'Uttar Pradesh', 27.1606, 78.0332, 4, 19.50, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Water', 'Covered Parking', 'CCTV'], 'active', 4.8, 89),
    (v_owner_id, 'Varanasi Ghat Point', 'Holy city charging point.', 'Sigra, Varanasi, UP 221010', 'Varanasi', 'Uttar Pradesh', 25.3176, 82.9739, 2, 16.00, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Covered Parking', 'CCTV'], 'active', 4.1, 23),
    (v_owner_id, 'Amritsar Golden Charger', 'Near Golden Temple. Secure location.', 'Ranjit Avenue, Amritsar, Punjab 143001', 'Amritsar', 'Punjab', 31.6340, 74.8723, 3, 17.00, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Water', 'CCTV', 'Night Lighting'], 'active', 4.6, 65),
    (v_owner_id, 'Coimbatore Race Course EV', 'Well connected Coimbatore hub.', 'Race Course, Coimbatore, TN 641018', 'Coimbatore', 'Tamil Nadu', 11.0045, 76.9749, 6, 16.50, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Water', 'Covered Parking', 'CCTV'], 'active', 4.7, 122),
    (v_owner_id, 'Kochi Marine Drive Point', 'Scenic charging near the backwaters.', 'Marine Drive, Kochi, Kerala 682031', 'Kochi', 'Kerala', 9.9790, 76.2750, 3, 18.00, ARRAY['CCS2', 'Type 2'], ARRAY['Water', 'Covered Parking', 'CCTV'], 'active', 4.4, 54),
    (v_owner_id, 'Trivandrum Technopark Station', 'Fastest charging in Kerala.', 'Technopark, Thiruvananthapuram, Kerala 695581', 'Thiruvananthapuram', 'Kerala', 8.5241, 76.9366, 8, 20.00, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Water', 'Covered Parking', 'CCTV'], 'active', 4.9, 210),
    (v_owner_id, 'Mysore Palace Arch EV', 'Heritage location charging.', 'Sayyaji Rao Road, Mysore, Karnataka 570001', 'Mysore', 'Karnataka', 12.2958, 76.6394, 2, 14.50, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'CCTV', 'Night Lighting'], 'active', 4.5, 44),
    (v_owner_id, 'Guwahati GS Road Hub', 'Major roadway connection in the NE.', 'GS Road, Guwahati, Assam 781005', 'Guwahati', 'Assam', 26.1445, 91.7362, 3, 15.00, ARRAY['CCS2', 'Type 2'], ARRAY['Water', 'Covered Parking', 'CCTV'], 'active', 4.0, 19),
    (v_owner_id, 'Chandigarh Sector 17 Charger', 'Planned city center charging.', 'Sector 17, Chandigarh 160017', 'Chandigarh', 'Chandigarh', 30.7333, 76.7794, 5, 16.50, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Water', 'Covered Parking', 'CCTV'], 'active', 4.3, 76),
    (v_owner_id, 'Bhubaneswar KIIT EV Base', 'University area charging point.', 'Patia, Bhubaneswar, Odisha 751024', 'Bhubaneswar', 'Odisha', 20.2961, 85.8245, 3, 14.00, ARRAY['CCS2', 'Type 2'], ARRAY['Restrooms', 'Water', 'CCTV', 'Night Lighting'], 'active', 4.2, 32);

END $$;
