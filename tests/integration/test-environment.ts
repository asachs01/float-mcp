import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Test environment configuration
export const TEST_ENV = {
  // API Configuration
  FLOAT_API_KEY: process.env.FLOAT_API_KEY || 'test_key',
  FLOAT_API_BASE_URL: process.env.FLOAT_API_BASE_URL || 'https://api.float.com/v3',

  // Test Configuration
  NODE_ENV: 'test',
  LOG_LEVEL: process.env.LOG_LEVEL || 'warn',
  LOG_FORMAT: 'json',

  // Rate Limiting (relaxed for tests)
  RATE_LIMIT_WINDOW_MS: 60000,
  RATE_LIMIT_MAX_REQUESTS: 200,

  // Health Check (disabled for tests)
  HEALTH_CHECK_INTERVAL: 0,
  HEALTH_CHECK_TIMEOUT: 1000,

  // Test-specific settings
  TEST_TIMEOUT: 30000,
  TEST_RETRY_ATTEMPTS: 3,
  TEST_RETRY_DELAY: 1000,
  TEST_REAL_API: process.env.TEST_REAL_API === 'true',
  TEST_MOCK_MODE: process.env.TEST_MOCK_MODE === 'true',
  TEST_SKIP_SLOW: process.env.TEST_SKIP_SLOW === 'true',
  TEST_DATA_PREFIX: 'test_integration_',
  TEST_CLEANUP_ENABLED: process.env.TEST_CLEANUP_ENABLED !== 'false',

  // Test data for common scenarios
  TEST_CLIENT_ID: parseInt(process.env.TEST_CLIENT_ID || '1', 10),
  TEST_PROJECT_ID: parseInt(process.env.TEST_PROJECT_ID || '1', 10),
  TEST_PERSON_ID: parseInt(process.env.TEST_PERSON_ID || '1', 10),
  TEST_DEPARTMENT_ID: parseInt(process.env.TEST_DEPARTMENT_ID || '1', 10),
  TEST_PHASE_ID: parseInt(process.env.TEST_PHASE_ID || '1', 10),
} as const;

// Apply test environment variables
export const applyTestEnvironment = () => {
  Object.entries(TEST_ENV).forEach(([key, value]) => {
    process.env[key] = String(value);
  });
};

// Validate test environment
export const validateTestEnvironment = () => {
  const errors: string[] = [];

  if (TEST_ENV.TEST_REAL_API) {
    if (!process.env.FLOAT_API_KEY || process.env.FLOAT_API_KEY === 'test_key') {
      errors.push('FLOAT_API_KEY is required for real API tests');
    }

    if (!process.env.FLOAT_API_BASE_URL || !process.env.FLOAT_API_BASE_URL.startsWith('https://')) {
      errors.push('FLOAT_API_BASE_URL must be a valid HTTPS URL');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Test environment validation failed:\n${errors.join('\n')}`);
  }
};

// Mock environment for testing
export const mockEnvironment = {
  FLOAT_API_KEY: 'flt_test_key_12345',
  FLOAT_API_BASE_URL: 'https://api.float.com/v3',
  NODE_ENV: 'test',
  LOG_LEVEL: 'error',
  LOG_FORMAT: 'json',
  RATE_LIMIT_WINDOW_MS: '60000',
  RATE_LIMIT_MAX_REQUESTS: '200',
  HEALTH_CHECK_INTERVAL: '0',
  HEALTH_CHECK_TIMEOUT: '1000',
};

// Setup test environment
export const setupTestEnvironment = () => {
  // Apply test environment
  applyTestEnvironment();

  // Validate environment
  validateTestEnvironment();

  // Set Jest timeout
  jest.setTimeout(TEST_ENV.TEST_TIMEOUT);
};

// Teardown test environment
export const teardownTestEnvironment = () => {
  // Reset environment variables if needed
  Object.keys(TEST_ENV).forEach((key) => {
    delete process.env[key];
  });
};
