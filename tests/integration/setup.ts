import { config } from 'dotenv';
import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { logger } from '../../src/utils/logger.js';
import { appConfig } from '../../src/config/index.js';
import { stopCleanup } from '../../src/services/float-api.js';

// Load test environment variables
config({ path: '.env.test' });

// Global test configuration
export const TEST_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  apiCallDelay: 100, // Delay between API calls to avoid rate limiting
  maxConcurrentRequests: 5,
  enableRealApiCalls: process.env.TEST_REAL_API === 'true',
  mockMode: process.env.TEST_MOCK_MODE === 'true',
  skipSlowTests: process.env.TEST_SKIP_SLOW === 'true',
  testDataPrefix: 'test_integration_',
  testEnvironment: process.env.NODE_ENV || 'test',
};

// Test environment validation
export const validateTestEnvironment = () => {
  const errors: string[] = [];

  // Check for required environment variables
  if (!process.env.FLOAT_API_KEY && TEST_CONFIG.enableRealApiCalls) {
    errors.push('FLOAT_API_KEY is required for real API tests');
  }

  if (!process.env.FLOAT_API_BASE_URL && TEST_CONFIG.enableRealApiCalls) {
    errors.push('FLOAT_API_BASE_URL is required for real API tests');
  }

  // Validate API key format if provided
  if (process.env.FLOAT_API_KEY && !process.env.FLOAT_API_KEY.startsWith('flt_')) {
    errors.push('FLOAT_API_KEY should start with "flt_" prefix');
  }

  if (errors.length > 0) {
    throw new Error(`Test environment validation failed:\n${errors.join('\n')}`);
  }
};

// Global setup functions
export const setupIntegrationTests = async () => {
  // Validate test environment
  validateTestEnvironment();

  // Configure logger for test environment
  logger.info('Setting up integration tests', {
    environment: TEST_CONFIG.testEnvironment,
    realApiCalls: TEST_CONFIG.enableRealApiCalls,
    mockMode: TEST_CONFIG.mockMode,
  });

  // Set longer timeout for integration tests
  jest.setTimeout(TEST_CONFIG.timeout);

  // Initialize rate limiting cleanup
  if (TEST_CONFIG.enableRealApiCalls) {
    logger.info('Integration tests will make real API calls');
  } else {
    logger.info('Integration tests will use mocked API responses');
  }
};

export const teardownIntegrationTests = async () => {
  // Clean up rate limiting
  stopCleanup();

  // Clean up any test data if needed
  logger.info('Tearing down integration tests');
};

// Helper for delays between API calls
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Helper for retrying failed operations
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = TEST_CONFIG.retryAttempts,
  delay: number = TEST_CONFIG.retryDelay
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      logger.warn(`Operation failed, retrying (${attempt}/${maxRetries})`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      await sleep(delay);
    }
  }

  throw new Error('Max retries exceeded');
};

// Mock data generator
export const generateTestData = (prefix: string = TEST_CONFIG.testDataPrefix) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  return {
    name: `${prefix}${timestamp}_${random}`,
    timestamp,
    random,
    email: `${prefix}${timestamp}@example.com`,
    description: `Test data created at ${new Date().toISOString()}`,
  };
};

// Test data cleanup tracker
export const testDataTracker = {
  createdProjects: [] as number[],
  createdPeople: [] as number[],
  createdTasks: [] as number[],
  createdClients: [] as number[],
  createdAllocations: [] as number[],

  track: (type: string, id: number) => {
    switch (type) {
      case 'project':
        testDataTracker.createdProjects.push(id);
        break;
      case 'person':
        testDataTracker.createdPeople.push(id);
        break;
      case 'task':
        testDataTracker.createdTasks.push(id);
        break;
      case 'client':
        testDataTracker.createdClients.push(id);
        break;
      case 'allocation':
        testDataTracker.createdAllocations.push(id);
        break;
    }
  },

  clear: () => {
    testDataTracker.createdProjects = [];
    testDataTracker.createdPeople = [];
    testDataTracker.createdTasks = [];
    testDataTracker.createdClients = [];
    testDataTracker.createdAllocations = [];
  },
};

// Global test hooks
beforeAll(async () => {
  await setupIntegrationTests();
});

afterAll(async () => {
  await teardownIntegrationTests();
});

beforeEach(() => {
  // Reset test data tracker
  testDataTracker.clear();

  // Add delay between tests to avoid rate limiting
  return sleep(TEST_CONFIG.apiCallDelay);
});

afterEach(() => {
  // Clear any test data created during the test
  // Note: In a real implementation, you might want to clean up test data
  // but Float API doesn't support deletion of most resources
});
