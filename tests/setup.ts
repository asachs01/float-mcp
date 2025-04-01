import { jest } from '@jest/globals';
import { config } from 'dotenv';
import { stopCleanup } from '../src/services/float-api.js';

// Load environment variables
config();

// Set longer timeout for tests
jest.setTimeout(10000);

// Mock fetch globally
global.fetch = jest.fn() as jest.Mock;

beforeAll(() => {
  // Initialize any test setup
});

afterAll(() => {
  // Clean up rate limiting interval
  stopCleanup();
});

beforeEach(() => {
  jest.resetAllMocks();
}); 