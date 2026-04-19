import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Use node environment for API tests
    environment: 'node',
    
    // Global test setup file
    setupFiles: ['./tests/setup.js'],
    
    // Test file patterns
    include: ['tests/**/*.test.js'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'routes/**',
        'controllers/**',
        'services/**',
        'middleware/**'
      ],
      exclude: [
        'tests/**',
        'node_modules/**'
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60
      }
    },

    // Timeout for async tests
    testTimeout: 10000,

    // Run tests sequentially to avoid 
    // port conflicts
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    }
  }
})
