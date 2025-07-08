import { logger } from '../../../src/utils/logger.ts';
import { executeTool } from './test-helpers.ts';

// Error test scenarios
export interface ErrorTestScenario {
  name: string;
  expectedErrorType: string;
  expectedStatus?: number;
  expectedMessage?: string;
  setup?: () => Promise<void>;
  cleanup?: () => Promise<void>;
}

// Common error scenarios
export const ERROR_SCENARIOS = {
  AUTHENTICATION: {
    name: 'Authentication Error',
    expectedErrorType: 'FloatAuthError',
    expectedStatus: 401,
    expectedMessage: 'authentication',
  },
  AUTHORIZATION: {
    name: 'Authorization Error',
    expectedErrorType: 'FloatAuthorizationError',
    expectedStatus: 403,
    expectedMessage: 'authorization',
  },
  VALIDATION: {
    name: 'Validation Error',
    expectedErrorType: 'FloatValidationError',
    expectedStatus: 400,
    expectedMessage: 'validation',
  },
  NOT_FOUND: {
    name: 'Not Found Error',
    expectedErrorType: 'FloatNotFoundError',
    expectedStatus: 404,
    expectedMessage: 'not found',
  },
  RATE_LIMIT: {
    name: 'Rate Limit Error',
    expectedErrorType: 'FloatRateLimitError',
    expectedStatus: 429,
    expectedMessage: 'rate limit',
  },
} as const;

// Error testing utilities
export class ErrorTestUtils {
  // Test authentication error
  static async testAuthenticationError(
    toolName: string,
    params: Record<string, any>,
    originalApiKey?: string
  ): Promise<void> {
    // Temporarily override API key
    // const backupApiKey = process.env.FLOAT_API_KEY;
    process.env.FLOAT_API_KEY = 'invalid_api_key';

    try {
      await executeTool(toolName, params);
      throw new Error('Expected authentication error but operation succeeded');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error instanceof Error).toBe(true);

      const errorMessage = (error as Error).message.toLowerCase();
      expect(
        errorMessage.includes('authentication') ||
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('401')
      ).toBe(true);
    } finally {
      // Restore original API key
      if (originalApiKey) {
        process.env.FLOAT_API_KEY = originalApiKey;
      } else {
        delete process.env.FLOAT_API_KEY;
      }
    }
  }

  // Test validation error
  static async testValidationError(
    toolName: string,
    invalidParams: Record<string, any>,
    expectedField?: string
  ): Promise<void> {
    try {
      await executeTool(toolName, invalidParams);
      throw new Error('Expected validation error but operation succeeded');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error instanceof Error).toBe(true);

      const errorMessage = (error as Error).message.toLowerCase();
      expect(
        errorMessage.includes('validation') ||
          errorMessage.includes('invalid') ||
          errorMessage.includes('required') ||
          errorMessage.includes('400')
      ).toBe(true);

      if (expectedField) {
        expect(errorMessage.includes(expectedField.toLowerCase())).toBe(true);
      }
    }
  }

  // Test not found error
  static async testNotFoundError(
    toolName: string,
    params: Record<string, any>,
    entityType?: string
  ): Promise<void> {
    try {
      await executeTool(toolName, params);
      throw new Error('Expected not found error but operation succeeded');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error instanceof Error).toBe(true);

      const errorMessage = (error as Error).message.toLowerCase();
      expect(
        errorMessage.includes('not found') ||
          errorMessage.includes('404') ||
          errorMessage.includes('does not exist')
      ).toBe(true);

      if (entityType) {
        expect(errorMessage.includes(entityType.toLowerCase())).toBe(true);
      }
    }
  }

  // Test rate limit error
  static async testRateLimitError(
    toolName: string,
    params: Record<string, any>,
    requestCount: number = 200
  ): Promise<void> {
    // Make many requests quickly to trigger rate limiting
    const requests = Array.from({ length: requestCount }, () => executeTool(toolName, params));

    try {
      await Promise.all(requests);
      logger.warn('Rate limit not reached - may need to adjust test parameters');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error instanceof Error).toBe(true);

      const errorMessage = (error as Error).message.toLowerCase();
      expect(
        errorMessage.includes('rate limit') ||
          errorMessage.includes('429') ||
          errorMessage.includes('too many requests')
      ).toBe(true);
    }
  }

  // Test error recovery
  static async testErrorRecovery(
    toolName: string,
    validParams: Record<string, any>,
    invalidParams: Record<string, any>
  ): Promise<void> {
    // First, cause an error
    try {
      await executeTool(toolName, invalidParams);
      throw new Error('Expected error but operation succeeded');
    } catch (error) {
      expect(error).toBeDefined();
    }

    // Then, verify the system can recover with valid params
    try {
      const result = await executeTool(toolName, validParams);
      expect(result).toBeDefined();
    } catch (error) {
      throw new Error(`System failed to recover after error: ${error}`);
    }
  }

  // Test error message format
  static validateErrorMessage(error: Error, expectedFormat?: RegExp): void {
    expect(error.message).toBeDefined();
    expect(error.message.length).toBeGreaterThan(0);

    if (expectedFormat) {
      expect(error.message).toMatch(expectedFormat);
    }
  }

  // Test error object structure
  static validateErrorObject(error: any, expectedProps?: string[]): void {
    expect(error).toBeDefined();
    expect(error instanceof Error).toBe(true);

    if (expectedProps) {
      expectedProps.forEach((prop) => {
        expect(error).toHaveProperty(prop);
      });
    }
  }
}

// Error scenario test runner
export class ErrorScenarioRunner {
  // Run a single error scenario
  static async runScenario(
    scenario: ErrorTestScenario,
    toolName: string,
    params: Record<string, any>
  ): Promise<void> {
    logger.info(`Running error scenario: ${scenario.name}`);

    // Setup
    if (scenario.setup) {
      await scenario.setup();
    }

    try {
      // Execute test
      await executeTool(toolName, params);
      throw new Error(`Expected ${scenario.expectedErrorType} but operation succeeded`);
    } catch (error) {
      // Validate error
      expect(error).toBeDefined();
      expect(error instanceof Error).toBe(true);

      const errorMessage = (error as Error).message.toLowerCase();

      if (scenario.expectedMessage) {
        expect(errorMessage.includes(scenario.expectedMessage.toLowerCase())).toBe(true);
      }

      if (scenario.expectedStatus) {
        expect(
          errorMessage.includes(scenario.expectedStatus.toString()) ||
            errorMessage.includes('status')
        ).toBe(true);
      }

      logger.info(`Error scenario ${scenario.name} passed`);
    } finally {
      // Cleanup
      if (scenario.cleanup) {
        await scenario.cleanup();
      }
    }
  }

  // Run multiple error scenarios
  static async runScenarios(
    scenarios: ErrorTestScenario[],
    toolName: string,
    getParams: (scenario: ErrorTestScenario) => Record<string, any>
  ): Promise<void> {
    for (const scenario of scenarios) {
      await this.runScenario(scenario, toolName, getParams(scenario));
    }
  }
}

// Common error test cases
export const createErrorTestCases = (entityType: string) => {
  return [
    {
      name: `${entityType} - Invalid API Key`,
      test: async (toolName: string, validParams: Record<string, any>) => {
        await ErrorTestUtils.testAuthenticationError(toolName, validParams);
      },
    },
    {
      name: `${entityType} - Missing Required Fields`,
      test: async (toolName: string, _validParams: Record<string, any>) => {
        await ErrorTestUtils.testValidationError(toolName, {});
      },
    },
    {
      name: `${entityType} - Invalid ID Format`,
      test: async (toolName: string, validParams: Record<string, any>) => {
        const invalidParams = { ...validParams };
        const idField = `${entityType}_id`;
        invalidParams[idField] = 'invalid_id';

        await ErrorTestUtils.testValidationError(toolName, invalidParams, idField);
      },
    },
    {
      name: `${entityType} - Non-existent ID`,
      test: async (toolName: string, validParams: Record<string, any>) => {
        const invalidParams = { ...validParams };
        const idField = `${entityType}_id`;
        invalidParams[idField] = 999999999;

        await ErrorTestUtils.testNotFoundError(toolName, invalidParams, entityType);
      },
    },
    {
      name: `${entityType} - Error Recovery`,
      test: async (toolName: string, validParams: Record<string, any>) => {
        const invalidParams = { ...validParams };
        const idField = `${entityType}_id`;
        invalidParams[idField] = 'invalid_id';

        await ErrorTestUtils.testErrorRecovery(toolName, validParams, invalidParams);
      },
    },
  ];
};

// Helper to generate invalid parameters for testing
export const generateInvalidParams = (entityType: string): Record<string, any> => {
  const invalidParams: Record<string, any> = {};

  switch (entityType) {
    case 'project':
      invalidParams.name = ''; // Empty name
      invalidParams.client_id = 'invalid'; // Invalid client ID
      invalidParams.start_date = 'invalid-date'; // Invalid date
      break;
    case 'person':
      invalidParams.name = ''; // Empty name
      invalidParams.email = 'invalid-email'; // Invalid email
      break;
    case 'task':
      invalidParams.name = ''; // Empty name
      invalidParams.project_id = 'invalid'; // Invalid project ID
      break;
    case 'client':
      invalidParams.name = ''; // Empty name
      break;
    case 'allocation':
      invalidParams.person_id = 'invalid'; // Invalid person ID
      invalidParams.project_id = 'invalid'; // Invalid project ID
      invalidParams.hours = -1; // Invalid hours
      break;
    default:
      invalidParams.name = ''; // Generic invalid name
      break;
  }

  return invalidParams;
};

// Export error test utilities
export { ErrorTestUtils, ErrorScenarioRunner };
