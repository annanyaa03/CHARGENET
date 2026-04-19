import { vi, beforeAll, afterAll } from 'vitest'

// Mock environment variables for tests
process.env.SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_SERVICE_KEY = 'test-service-key-mock'
process.env.PORT = '3002'
process.env.NODE_ENV = 'test'

// Mock Supabase client globally
// This prevents real DB calls in tests
vi.mock('../lib/supabase.js', () => {
  const mockSupabase = {
    from: vi.fn(() => mockSupabase),
    select: vi.fn(() => mockSupabase),
    insert: vi.fn(() => mockSupabase),
    update: vi.fn(() => mockSupabase),
    delete: vi.fn(() => mockSupabase),
    eq: vi.fn(() => mockSupabase),
    neq: vi.fn(() => mockSupabase),
    ilike: vi.fn(() => mockSupabase),
    single: vi.fn(() => mockSupabase),
    range: vi.fn(() => mockSupabase),
    order: vi.fn(() => mockSupabase),
    filter: vi.fn(() => mockSupabase),
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn()
    }
  }
  return { default: mockSupabase }
})

console.log('Test setup complete')
console.log('Supabase: mocked')
console.log('Environment: test')
