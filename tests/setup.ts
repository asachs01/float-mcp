import { config } from 'dotenv';

// Load environment variables
config();

// Set longer timeout for tests
jest.setTimeout(10000);

// Mock fetch globally
global.fetch = jest.fn();

beforeAll(() => {
  // Initialize any test setup
});

afterAll(() => {
  // Clean up any resources
});

beforeEach(() => {
  jest.resetAllMocks();
});
