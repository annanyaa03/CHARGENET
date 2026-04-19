// Mock station data
export const mockStation = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Test EV Station',
  address: 'Test Road, Test Area',
  city: 'Mumbai',
  state: 'Maharashtra',
  lat: 19.0760,
  lng: 72.8777,
  status: 'active',
  slug: 'test-ev-station-550e',
  rating: 4.5,
  review_count: 10,
  total_slots: 3,
  available_slots: 2,
  description: 'Test station description',
  open_hours: '24/7',
  created_at: new Date().toISOString()
}

// Mock charger data
export const mockCharger = {
  id: '660e8400-e29b-41d4-a716-446655440001',
  station_id: mockStation.id,
  type: 'CCS',
  power_kw: 50,
  status: 'available',
  price_per_kwh: 12.00,
  created_at: new Date().toISOString()
}

// Mock booking data
export const mockBooking = {
  id: '770e8400-e29b-41d4-a716-446655440002',
  station_id: mockStation.id,
  charger_id: mockCharger.id,
  user_id: '880e8400-e29b-41d4-a716-446655440003',
  booking_date: '2026-12-25',
  booking_time: '10:00',
  duration_minutes: 60,
  status: 'confirmed',
  estimated_cost: 600.00,
  created_at: new Date().toISOString()
}

// Mock review data
export const mockReview = {
  id: '990e8400-e29b-41d4-a716-446655440004',
  station_id: mockStation.id,
  user_id: '880e8400-e29b-41d4-a716-446655440003',
  user_name: 'Test User',
  rating: 5,
  comment: 'Great charging station!',
  created_at: new Date().toISOString()
}

// Mock user data
export const mockUser = {
  id: '880e8400-e29b-41d4-a716-446655440003',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User'
  }
}

// Mock JWT token
export const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test'

// Auth headers helper
export const authHeaders = {
  Authorization: `Bearer ${mockToken}`,
  'Content-Type': 'application/json'
}
