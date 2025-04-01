import { config } from 'dotenv';

// Load environment variables from .env.test if it exists
config({ path: '.env.test' });

// Set default timeout for all tests
jest.setTimeout(10000);

// Global test setup
beforeAll(() => {
  // Add any global setup here
});

// Global test cleanup
afterAll(() => {
  // Add any global cleanup here
}); 